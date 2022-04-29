import {
  Account, Claim, ClaimType, CreateLixiCommand, ExportLixiCommand, LixiDto, PaginationResult, PostLixiResponseDto, RenameLixiCommand, WithdrawLixiCommand
} from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Body, ClassSerializerInterceptor, Controller, Get, Headers, HttpException, HttpStatus,
  Inject, Injectable, Param, Patch, Post, Query, UseInterceptors
} from '@nestjs/common';
import { Claim as ClaimDb, Lixi } from '@prisma/client';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { PaginationParams } from 'src/common/models/paginationParams';
import { NOTIFICATION_TYPES } from 'src/common/notifications/notification.constants';
import { NotificationService } from 'src/common/notifications/notification.service';
import { EXPORT_SUB_LIXIES_QUEUE, LIXI_JOB_NAMES, WITHDRAW_SUB_LIXIES_QUEUE } from 'src/constants/lixi.constants';
import logger from 'src/logger';
import { LixiService } from 'src/services/lixi/lixi.service';
import { WalletService } from 'src/services/wallet.service';
import { aesGcmDecrypt, numberToBase58 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import { PrismaService } from '../services/prisma/prisma.service';



@Controller('lixies')
@UseInterceptors(ClassSerializerInterceptor)
@Injectable()

export class LixiController {

  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly lixiService: LixiService,
    private readonly notificationService: NotificationService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private XPI: BCHJS,
    @InjectQueue(EXPORT_SUB_LIXIES_QUEUE) private exportSubLixiesQueue: Queue,
    @InjectQueue(WITHDRAW_SUB_LIXIES_QUEUE) private withdrawSubLixiesQueue: Queue
  ) { }

  @Get(':id')
  async getLixi(@Param('id') id: string, @Headers('account-secret') accountSecret: string): Promise<any> {
    try {
      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: _.toSafeInteger(id)
        },
        include: {
          envelope: true
        }
      });

      if (!lixi) throw new VError('The lixi does not exist in the database.');

      const balance: number = await this.xpiWallet.getBalance(lixi.address);

      let resultApi: any
      resultApi = _.omit({
        ...lixi,
        activationAt: lixi.activationAt ? lixi.activationAt.toISOString() : null,
        isClaimed: lixi.isClaimed,
        balance: balance,
        totalClaim: Number(lixi.totalClaim),
        envelope: lixi.envelope,
      } as unknown as LixiDto, 'encryptedXPriv', 'encryptedClaimCode');

      // Return the claim code only if there's account secret attach to the header
      try {
        if (accountSecret && accountSecret !== 'undefined' && accountSecret !== 'null') {
          const claimPart = await aesGcmDecrypt(lixi.encryptedClaimCode, accountSecret);
          const encodedId = numberToBase58(lixi.id);
          resultApi.claimCode = claimPart + encodedId;
        }
      } catch (err: unknown) {
        logger.error(err);
      }
      return resultApi;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/children')
  async getSubLixi(
    @Param('id') id: string,
    @Query('startId') startId: number,
    @Query('limit') limit: number,
    @Headers('account-secret') accountSecret: string
  ): Promise<PaginationResult<LixiDto>> {

    const lixiId = _.toSafeInteger(id);
    const take = limit ? _.toSafeInteger(limit) : 5;
    const cursor = startId ? _.toSafeInteger(startId) : null;

    try {
      let subLixies: Lixi[] = [];
      const count = await this.prisma.lixi.count({
        where: {
          parentId: lixiId
        }
      });

      subLixies = cursor ?
        await this.prisma.lixi.findMany({
          take: take,
          skip: 1,
          where: {
            parentId: lixiId,
          },
          cursor: {
            id: cursor,
          },
        }) :
        await this.prisma.lixi.findMany({
          take: take,
          where: {
            parentId: lixiId,
          },
        });

      const childrenApiResult: LixiDto[] = [];

      for (let item of subLixies) {

        const childResult = _.omit({
          ...item,
          totalClaim: Number(item.totalClaim),
          expiryAt: item.expiryAt ? item.expiryAt : undefined,
          country: item.country ? item.country : undefined,
        } as LixiDto, 'encryptedXPriv', 'encryptedClaimCode');

        // Return the claim code only if there's account secret attach to the header
        try {
          if (accountSecret && accountSecret !== 'undefined' && accountSecret !== 'null') {
            const claimPart = await aesGcmDecrypt(item.encryptedClaimCode, accountSecret);
            const encodedId = numberToBase58(item.id);
            childResult.claimCode = claimPart + encodedId;
          }
        } catch (err: unknown) {
          logger.error(err);
        }
        childrenApiResult.push(childResult);
      }

      const startCursor = childrenApiResult.length > 0 ? _.first(childrenApiResult)?.id : null;
      const endCursor = childrenApiResult.length > 0 ? _.last(childrenApiResult)?.id : null;
      const countAfter = !endCursor ? 0 : await this.prisma.lixi.count({
        where: {
          parentId: lixiId
        },
        cursor: {
          id: _.toSafeInteger(endCursor)
        },
        skip: 1
      });

      const hasNextPage = countAfter > 0;

      return {
        data: childrenApiResult ?? [],
        pageInfo: {
          hasNextPage,
          startCursor,
          endCursor
        },
        totalCount: count
      } as PaginationResult<LixiDto>
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async createLixi(
    @Body() command: CreateLixiCommand,
  ): Promise<PostLixiResponseDto | undefined> {
    if (command) {
      try {
        const mnemonicFromApi = command.mnemonic;

        const account = await this.prisma.account.findFirst({
          where: {
            id: command.accountId,
            mnemonicHash: command.mnemonicHash
          },
        });

        if (!account) {
          throw new Error('Could not find the associated account.');
        }

        // Decrypt to validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
        if (mnemonicFromApi !== mnemonicToValidate) {
          throw Error('Could not create lixi because the account is invalid.');
        }

        // find the latest lixi created
        const latestLixi: Lixi | null = await this.prisma.lixi.findFirst({
          where: {
            accountId: account.id,
          },
          orderBy: {
            id: 'desc'
          }
        });

        // Find the latest derivation index:
        let lixiIndex = 1;
        if (latestLixi) {
          lixiIndex = latestLixi.derivationIndex + 1;
        }

        let lixi = null;
        if (command.claimType === ClaimType.Single) {
          // Single type
          lixi = await this.lixiService.createSingleLixi(lixiIndex, account, command);
          return {
            lixi
          } as PostLixiResponseDto;
        } else {
          // One time child codes type
          lixi = await this.lixiService.createOneTimeParentLixi(lixiIndex, account, command);
          const jobId = await this.lixiService.createSubLixies(lixiIndex + 1, account, command, lixi.id);

          return {
            lixi,
            jobId
          } as PostLixiResponseDto;
        }
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const error = new VError.WError(err as Error, 'Unable to create new lixi.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }

  @Post(':id/lock')
  async lockLixi(@Param('id') id: string, @Body() command: Account): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: command.mnemonicHash
        }
      });

      if (!account) {
        throw new Error('Could not find the associated account.');
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        throw Error('Could not find the associated account.');
      }

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }
      else {
        const lixi = await this.prisma.lixi.update({
          where: {
            id: lixiId
          },
          data: {
            status: 'locked',
            updatedAt: new Date()
          }
        });
        if (lixi) {
          let resultApi: LixiDto = {
            ...lixi,
            balance: 0,
            totalClaim: Number(lixi.totalClaim),
            expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
            activationAt: lixi.activationAt ? lixi.activationAt : undefined,
            country: lixi.country ? lixi.country : undefined,
            status: lixi.status,
            numberOfSubLixi: 0,
            parentId: lixi.parentId ?? undefined,
            isClaimed: lixi.isClaimed ?? false,
          };

          return resultApi;
        }
      }
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Could not locked the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/unlock')
  async unlockLixi(@Param('id') id: string, @Body() command: Account): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: command.mnemonicHash
        }
      });

      if (!account) {
        throw new Error('Could not find the associated account.');
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        throw Error('Could not find the associated account.');
      }

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }
      else {
        const lixi = await this.prisma.lixi.update({
          where: {
            id: lixiId
          },
          data: {
            status: 'active',
            updatedAt: new Date()
          }
        });
        if (lixi) {
          let resultApi: LixiDto = {
            ...lixi,
            balance: 0,
            totalClaim: Number(lixi.totalClaim),
            expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
            activationAt: lixi.activationAt ? lixi.activationAt : undefined,
            country: lixi.country ? lixi.country : undefined,
            status: lixi.status,
            numberOfSubLixi: 0,
            parentId: lixi.parentId ?? undefined,
            isClaimed: lixi.isClaimed ?? false,
          };

          return resultApi;
        }
      }

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Could not unlock the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/withdraw')
  async withdrawLixi(@Param('id') id: string, @Body() command: WithdrawLixiCommand) {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: command.mnemonicHash
        }
      });

      if (!account) {
        throw new Error('Could not find the associated account.');
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        throw Error('Could not find the associated account.');
      }

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }

      if (lixi.claimType === ClaimType.Single) {
        const lixiIndex = lixi.derivationIndex;
        const { address, keyPair } = await this.walletService.deriveAddress(mnemonicFromApi, lixiIndex);

        if (address !== lixi.address) {
          throw new Error('Invalid account. Unable to withdraw the lixi');
        }

        const lixiCurrentBalance: number = await this.xpiWallet.getBalance(lixi.address);

        if (lixiCurrentBalance === 0) {
          throw new VError('Unable to withdraw. The lixi is empty!');
        }

        const totalAmount: number = await this.walletService.onMax(lixi.address);
        const receivingAccount = [{ address: account.address, amountXpi: totalAmount, }]

        const amount: any = await this.walletService.sendAmount(lixi.address, receivingAccount, keyPair);

        let resultApi: LixiDto = {
          ...lixi,
          balance: amount ?? 0,
          totalClaim: Number(lixi.totalClaim),
          expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
          activationAt: lixi.activationAt ? lixi.activationAt : undefined,
          country: lixi.country ? lixi.country : undefined,
          numberOfSubLixi: 0,
          parentId: lixi.parentId ?? undefined,
          isClaimed: lixi.isClaimed ?? false,
        };

        return {
          lixi: resultApi
        } as PostLixiResponseDto;
      }

      else {
        // Withdraw for OneTime Code
        const jobData = {
          parentId: lixiId,
          mnemonic: mnemonicFromApi,
          accountAddress: account.address
        };

        const job = await this.withdrawSubLixiesQueue.add(LIXI_JOB_NAMES.WITHDRAW_ALL_SUB_LIXIES, jobData);
        let resultApi: LixiDto = {
          ...lixi,
          balance: 0,
          totalClaim: Number(lixi.totalClaim),
          expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
          activationAt: lixi.activationAt ? lixi.activationAt : undefined,
          country: lixi.country ? lixi.country : undefined,
          numberOfSubLixi: 0,
          parentId: lixi.parentId ?? undefined,
          isClaimed: lixi.isClaimed ?? false,
        };

        return {
          lixi: resultApi,
          jobId: job.id
        } as PostLixiResponseDto;
      }

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        logger.error(err);
        const error = new VError.WError(err as Error, 'Could not export the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/export')
  async exportLixies(
    @Param('id') id: string,
    @Body() command: ExportLixiCommand,
    @Headers('account-secret') accountSecret: string,
  ) {
    const lixiId = _.toSafeInteger(id);
    try {

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
        }
      });

      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }

      const jobData = {
        parentId: lixiId,
        secret: accountSecret,
      };

      const job = await this.exportSubLixiesQueue.add(LIXI_JOB_NAMES.EXPORT_ALL_SUB_LIXIES, jobData);

      return {
        jobId: job.id
      };
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Could not export the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

  }

  @Get(':id/claims')
  async getLixiClaims(
    @Param('id') id: string,
    @Query() { startId, limit }: PaginationParams
  ): Promise<PaginationResult<Claim>> {
    const lixiId = _.toSafeInteger(id);
    const take = limit ? _.toSafeInteger(limit) : 4;

    try {
      let claims: ClaimDb[] = [];

      const count = await this.prisma.claim.count({
        where: {
          lixiId: lixiId
        }
      });

      if (!startId) {
        // No start id, we should return the normal data without the cursor
        claims = await this.prisma.claim.findMany({
          where: {
            lixiId: lixiId
          },
          orderBy: [
            {
              id: 'asc'
            }
          ],
          take: take,
          skip: startId ? 1 : 0,
        });
      } else {
        // Query with the cursor
        claims = await this.prisma.claim.findMany({
          where: {
            lixiId: lixiId
          },
          orderBy: [
            {
              id: 'asc'
            }
          ],
          take: take,
          skip: 1,
          cursor: {
            id: _.toSafeInteger(startId)
          }
        });
      }

      const results = claims.map(item => {
        return {
          ...item,
          amount: Number(item.amount)
        } as Claim;
      });

      const startCursor = results.length > 0 ? _.first(results)?.id : null;
      const endCursor = results.length > 0 ? _.last(results)?.id : null;
      const countAfter = !endCursor ? 0 : await this.prisma.claim.count({
        where: {
          lixiId: lixiId
        },
        orderBy: [
          {
            id: 'asc'
          }
        ],
        cursor: {
          id: _.toSafeInteger(endCursor)
        },
        skip: 1
      });

      const hasNextPage = countAfter > 0;

      return {
        data: results ?? [],
        pageInfo: {
          hasNextPage,
          startCursor,
          endCursor
        },
        totalCount: count
      } as PaginationResult<Claim>

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get claim list of the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Patch(':id/rename')
  async renameLixi(@Param('id') id: string, @Body() command: RenameLixiCommand): Promise<LixiDto> {
    if (command) {
      try {
        const mnemonicFromApi = command.mnemonic;
        const account = await this.prisma.account.findFirst({
          where: {
            mnemonicHash: command.mnemonicHash
          }
        });

        if (!account) {
          throw new Error('Could not find the associated account.');
        }

        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
        if (mnemonicFromApi !== mnemonicToValidate) {
          throw new VError('Invalid account! Could not update the lixi.');
        }

        const lixi = await this.prisma.lixi.findUnique({
          where: {
            id: _.toSafeInteger(id)
          }
        });
        if (!lixi)
          throw new VError('The lixi does not exist in the database.');

        const nameExist = await this.prisma.lixi.findFirst({
          where: {
            name: command.name,
            accountId: lixi.accountId
          }
        });
        if (nameExist)
          throw new VError('The name is already taken.');

        const updatedLixi: Lixi = await this.prisma.lixi.update({
          where: {
            id: _.toSafeInteger(id),
          },
          data: {
            name: command.name,
            updatedAt: new Date(),
          }
        });

        if (updatedLixi) {
          let resultApi: LixiDto = {
            ...lixi,
            name: updatedLixi.name,
            totalClaim: Number(lixi.totalClaim),
            expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
            activationAt: lixi.activationAt ? lixi.activationAt : undefined,
            country: lixi.country ? lixi.country : undefined,
            status: lixi.status,
            numberOfSubLixi: lixi.numberOfSubLixi ?? 0,
            parentId: lixi.parentId ?? undefined,
            isClaimed: lixi.isClaimed ?? false,
          };

          return resultApi;
        }
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const error = new VError.WError(err as Error, 'Unable to update lixi.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }
}
