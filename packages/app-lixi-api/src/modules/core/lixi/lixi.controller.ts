import {
  Account,
  Claim,
  ClaimType,
  CreateLixiCommand,
  ExportLixiCommand,
  LixiDto,
  PaginationResult,
  PostLixiResponseDto,
  RenameLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Claim as ClaimDb, Lixi, Upload as UploadDb } from '@prisma/client';
import { Queue } from 'bullmq';
import * as _ from 'lodash';
import { PaginationParams } from 'src/common/models/paginationParams';
import { NOTIFICATION_TYPES } from 'src/common/modules/notifications/notification.constants';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { EXPORT_SUB_LIXIES_QUEUE, LIXI_JOB_NAMES, WITHDRAW_SUB_LIXIES_QUEUE } from 'src/modules/core/lixi/constants/lixi.constants';
import logger from 'src/logger';
import { LixiService } from 'src/modules/core/lixi/lixi.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { aesGcmDecrypt, numberToBase58, hexSha256 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { createReadStream } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from 'src/modules/auth/jwtauth.guard';
import {
  FastifyRequest,
  FastifyReply
} from 'fastify';
import moment from 'moment';
import { extname } from 'path'
import { UploadGuard } from 'src/utils/upload.guard';
import { File } from 'src/utils/file.decorator';
import fs from 'fs';
import sharp from 'sharp';

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
  async getLixi(
    @Param('id') id: string,
    @Headers('account-secret') accountSecret: string,
    @I18n() i18n: I18nContext
  ): Promise<any> {
    try {
      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: _.toSafeInteger(id)
        },
        include: {
          envelope: true
        }
      });

      if (!lixi) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new VError(lixiNotExist);
      }

      const balance: number = await this.xpiWallet.getBalance(lixi.address);

      let resultApi: any;
      resultApi = _.omit(
        {
          ...lixi,
          activationAt: lixi.activationAt ? lixi.activationAt.toISOString() : null,
          isClaimed: lixi.isClaimed,
          balance: balance,
          totalClaim: Number(lixi.totalClaim),
          envelope: lixi.envelope
        } as unknown as LixiDto,
        'encryptedXPriv',
        'encryptedClaimCode'
      );

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
        const unableToGetLixi = await i18n.t('lixi.messages.unableToGetLixi');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/children')
  async getSubLixi(
    @Param('id') id: string,
    @Query('startId') startId: number,
    @Query('limit') limit: number,
    @Headers('account-secret') accountSecret: string,
    @I18n() i18n: I18nContext
  ): Promise<PaginationResult<LixiDto>> {
    const lixiId = _.toSafeInteger(id);
    const take = limit ? _.toSafeInteger(limit) : 10;
    const cursor = startId ? _.toSafeInteger(startId) : null;

    try {
      let subLixies: Lixi[] = [];
      const count = await this.prisma.lixi.count({
        where: {
          parentId: lixiId
        }
      });

      subLixies = cursor
        ? await this.prisma.lixi.findMany({
          take: take,
          skip: 1,
          where: {
            parentId: lixiId
          },
          cursor: {
            id: cursor
          }
        })
        : await this.prisma.lixi.findMany({
          take: take,
          where: {
            parentId: lixiId
          }
        });

      const childrenApiResult: LixiDto[] = [];

      for (let item of subLixies) {
        const childResult = _.omit(
          {
            ...item,
            totalClaim: Number(item.totalClaim),
            expiryAt: item.expiryAt ? item.expiryAt : undefined,
            country: item.country ? item.country : undefined
          } as LixiDto,
          'encryptedXPriv',
          'encryptedClaimCode'
        );

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
      const countAfter = !endCursor
        ? 0
        : await this.prisma.lixi.count({
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
      } as PaginationResult<LixiDto>;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetLixi = await i18n.t('lixi.messages.unableToGetLixi');
        const error = new VError.WError(err as Error, unableToGetLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async createLixi(
    @Body() command: CreateLixiCommand,
    @I18n() i18n: I18nContext
  ): Promise<PostLixiResponseDto | undefined> {
    if (command) {
      try {
        const mnemonicFromApi = command.mnemonic;

        const account = await this.prisma.account.findFirst({
          where: {
            id: command.accountId,
            mnemonicHash: command.mnemonicHash
          }
        });

        if (!account) {
          const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
          throw new Error(couldNotFindAccount);
        }

        // Decrypt to validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
        if (mnemonicFromApi !== mnemonicToValidate) {
          const couldNotCreateLixi = await i18n.t('lixi.messages.couldNotCreateLixi');
          throw Error(couldNotCreateLixi);
        }

        // find the latest lixi created
        const latestLixi: Lixi | null = await this.prisma.lixi.findFirst({
          where: {
            accountId: account.id
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
          lixi = await this.lixiService.createSingleLixi(lixiIndex, account, command, i18n);
          return {
            lixi
          } as PostLixiResponseDto;
        } else {
          // One time child codes type
          lixi = await this.lixiService.createOneTimeParentLixi(lixiIndex, account, command, i18n);
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
          const unableCreateLixi = await i18n.t('lixi.messages.unableCreateLixi');
          const error = new VError.WError(err as Error, unableCreateLixi);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }

  @Post(':id/archive')
  async lockLixi(
    @Param('id') id: string,
    @Body() command: Account,
    @I18n() i18n: I18nContext
  ): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: command.mnemonicHash
        }
      });

      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw Error(couldNotFindAccount);
      }

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new Error(lixiNotExist);
      } else {
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
            isClaimed: lixi.isClaimed ?? false
          };

          return resultApi;
        }
      }
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const couldNotLockLixi = await i18n.t('lixi.messages.couldNotLockLixi');
        const error = new VError.WError(err as Error, couldNotLockLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/unarchive')
  async unlockLixi(
    @Param('id') id: string,
    @Body() command: Account,
    @I18n() i18n: I18nContext
  ): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: command.mnemonicHash
        }
      });

      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw Error(couldNotFindAccount);
      }

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        const couldNotFindLixi = await i18n.t('lixi.messages.couldNotFindLixi');
        throw new Error(couldNotFindLixi);
      } else {
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
            isClaimed: lixi.isClaimed ?? false
          };

          return resultApi;
        }
      }
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const couldNotUnlockLixi = await i18n.t('lixi.messages.couldNotUnlockLixi');
        const error = new VError.WError(err as Error, couldNotUnlockLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/withdraw')
  async withdrawLixi(@Param('id') id: string, @Body() command: Account, @I18n() i18n: I18nContext) {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: command.mnemonicHash
        }
      });

      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw Error(couldNotFindAccount);
      }

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        const couldNotFindLixi = await i18n.t('lixi.messages.couldNotFindLixi');
        throw new Error(couldNotFindLixi);
      }

      if (lixi.claimType === ClaimType.Single) {
        const lixiIndex = lixi.derivationIndex;
        const { address, keyPair } = await this.walletService.deriveAddress(mnemonicFromApi, lixiIndex);

        if (address !== lixi.address) {
          const invalidAccount = await i18n.t('lixi.messages.invalidAccount');
          throw new Error(invalidAccount);
        }

        const lixiCurrentBalance: number = await this.xpiWallet.getBalance(lixi.address);

        if (lixiCurrentBalance === 0) {
          const unableWithdraw = await i18n.t('lixi.messages.unableWithdraw');
          throw new VError(unableWithdraw);
        }

        const totalAmount: number = await this.walletService.onMax(lixi.address);
        const receivingAccount = [{ address: account.address, amountXpi: totalAmount }];

        const amount: any = await this.walletService.sendAmount(lixi.address, receivingAccount, keyPair, i18n);

        let resultApi: LixiDto = {
          ...lixi,
          balance: amount ?? 0,
          totalClaim: Number(lixi.totalClaim),
          expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
          activationAt: lixi.activationAt ? lixi.activationAt : undefined,
          country: lixi.country ? lixi.country : undefined,
          numberOfSubLixi: 0,
          parentId: lixi.parentId ?? undefined,
          isClaimed: lixi.isClaimed ?? false
        };

        return {
          lixi: resultApi
        } as PostLixiResponseDto;
      } else {
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
          isClaimed: lixi.isClaimed ?? false
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
        const couldNotWithdraw = await i18n.t('lixi.messages.couldNotWithdraw');
        const error = new VError.WError(err as Error, couldNotWithdraw);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/export')
  async exportLixies(
    @Param('id') id: string,
    @Body() command: ExportLixiCommand,
    @Headers('account-secret') accountSecret: string
  ) {
    const lixiId = _.toSafeInteger(id);
    try {
      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId
        }
      });

      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }

      const jobData = {
        parentId: lixiId,
        secret: accountSecret
      };

      const job = await this.exportSubLixiesQueue.add(LIXI_JOB_NAMES.EXPORT_ALL_SUB_LIXIES, jobData);

      return {
        fileName: `${lixiId}.csv`,
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
    @Query() { startId, limit }: PaginationParams,
    @I18n() i18n: I18nContext
  ): Promise<PaginationResult<Claim>> {
    const lixiId = _.toSafeInteger(id);
    const take = limit ? _.toSafeInteger(limit) : 4;

    try {
      let claims: ClaimDb[] = [];

      const subLixies = await this.prisma.lixi.findMany({
        where: {
          parentId: lixiId
        }
      })

      const subLixiesIds = subLixies.map(item => item.id);
      subLixiesIds.push(lixiId)

      const count = await this.prisma.claim.count({
        where: {
          lixiId: { in: subLixiesIds }
        }
      });

      if (!startId) {
        // No start id, we should return the normal data without the cursor
        claims = await this.prisma.claim.findMany({
          where: {
            lixiId: { in: subLixiesIds }
          },
          orderBy: [
            {
              id: 'asc'
            }
          ],
          take: take,
          skip: startId ? 1 : 0
        });
      } else {
        // Query with the cursor
        claims = await this.prisma.claim.findMany({
          where: {
            lixiId: { in: subLixiesIds }
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
      const countAfter = !endCursor
        ? 0
        : await this.prisma.claim.count({
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
      } as PaginationResult<Claim>;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToGetClaimListLixi = await i18n.t('lixi.messages.unableToGetClaimListLixi');
        const error = new VError.WError(err as Error, unableToGetClaimListLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Patch(':id/rename')
  async renameLixi(
    @Param('id') id: string,
    @Body() command: RenameLixiCommand,
    @I18n() i18n: I18nContext
  ): Promise<LixiDto> {
    if (command) {
      try {
        const mnemonicFromApi = command.mnemonic;
        const account = await this.prisma.account.findFirst({
          where: {
            mnemonicHash: command.mnemonicHash
          }
        });

        if (!account) {
          const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
          throw new Error(couldNotFindAccount);
        }

        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
        if (mnemonicFromApi !== mnemonicToValidate) {
          const invalidAccount = await i18n.t('lixi.messages.invalidAccountCouldNotUpdateLixi');
          throw new VError(invalidAccount);
        }

        const lixi = await this.prisma.lixi.findUnique({
          where: {
            id: _.toSafeInteger(id)
          }
        });
        if (!lixi) {
          const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
          throw new VError(lixiNotExist);
        }

        const nameExist = await this.prisma.lixi.findFirst({
          where: {
            name: command.name,
            accountId: lixi.accountId
          }
        });
        if (nameExist) {
          const nameAlreadyTaken = await i18n.t('lixi.messages.nameAlreadyTaken');
          throw new VError(nameAlreadyTaken);
        }

        const updatedLixi: Lixi = await this.prisma.lixi.update({
          where: {
            id: _.toSafeInteger(id)
          },
          data: {
            name: command.name,
            updatedAt: new Date()
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
            isClaimed: lixi.isClaimed ?? false
          };

          return resultApi;
        }
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableToUpdateLixi = await i18n.t('lixi.messages.unableToUpdateLixi');
          const error = new VError.WError(err as Error, unableToUpdateLixi);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadExportedLixies(
    @Param('id') id: string,
    @Query('file') fileName: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @I18n() i18n: I18nContext
  ): Promise<StreamableFile> {
    try {

      const account = (req as any).account;

      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }

      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });
      if (!lixi) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new VError(lixiNotExist);
      }

      var timestamp = moment().format('YYYYMMDD');
      if (fileName !== `${lixi?.id}_${timestamp}.csv`) {
        const fileNameNotExist = await i18n.t('lixi.messages.fileNameNotExist');
        throw new VError(fileNameNotExist);
      }

      const file = createReadStream(join(process.cwd(), 'public', "download", fileName));

      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename=${fileName}`);

      return new StreamableFile(file);
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToDownloadLixi = await i18n.t('lixi.messages.unableToDownloadLixi');
        const error = new VError.WError(err as Error, unableToDownloadLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('custom-envelope')
  @UseGuards(JwtAuthGuard)
  @UseGuards(UploadGuard)
  async upload(
    @File() file: Storage.MultipartFile,
    @Req() req: FastifyRequest,
    @I18n() i18n: I18nContext,
  ) {
    try {
      const account = (req as any).account;
      const originalName = file.filename.replace(/\.[^/.]+$/, "")
      const sha = await hexSha256(originalName);
      const uploaded = await this.prisma.upload.findFirst({
        where: {
          sha: sha
        }
      })

      if(!uploaded) {
        const dir = `uploads`
        const buffer = await file.toBuffer();
        const fileExtension = extname(file.filename);
        const folderName = sha.substring(0,2);
        const fileUrl = `${dir}/${folderName}/${sha}`;

        if (!account) {
          const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
          throw new Error(couldNotFindAccount);
        }

        //create new folder if there are no existing is founded
        if (!fs.existsSync(`./public/${dir}/${folderName}`)) {
          fs.mkdirSync(`./public/${dir}/${folderName}`);
        }

        //write image file to folder
        const originalImage = await sharp(buffer).toFile(`./public/${fileUrl}${fileExtension}`)
        const thumbnailImage = await sharp(buffer).resize(200).toFile(`./public/${fileUrl}-200${fileExtension}`);

        const uploadToInsert = {
          originalFilename : originalName,
          fileSize: originalImage.size,
          width: originalImage.width,
          height: originalImage.height,
          url: `${process.env.BASE_URL}/api/${fileUrl}${fileExtension}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          sha: sha,
          extension: file.mimetype,
          thumbnailWidth: thumbnailImage.width,
          thumbnailHeight: thumbnailImage.height,
          type: '',
          account: {connect : {id: account.id}},
        }
        
        const resultImage: UploadDb = await this.prisma.upload.create({
            data: uploadToInsert
        });

        return resultImage;
      }

      return uploaded;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToUpload = await i18n.t('lixi.messages.unableToUpload');
        const error = new VError.WError(err as Error, unableToUpload);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
