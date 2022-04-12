import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Patch, Query, Header, Headers } from '@nestjs/common';
import * as _ from 'lodash';
import logger from 'src/logger';

import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Lixi, Lixi as LixiDb, Claim as ClaimDb } from '@prisma/client';
import {
  Account,
  CreateLixiCommand, fromSmallestDenomination, Claim, LixiDto, ClaimType, LixiType,
  RenameLixiCommand,
  PostLixiResponseDto,
  PaginationResult
} from '@bcpros/lixi-models';
import { WalletService } from "src/services/wallet.service";
import { aesGcmDecrypt, aesGcmEncrypt, numberToBase58, generateRandomBase58Str } from 'src/utils/encryptionMethods';
import sleep from '../utils/sleep';
import { VError } from 'verror';
import { PrismaService } from '../services/prisma/prisma.service';
import { LixiService } from 'src/services/lixi/lixi.service';
import { PaginationParams } from 'src/common/models/paginationParams';

@Controller('lixies')
export class LixiController {

  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly lixiService: LixiService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private XPI: BCHJS
  ) { }

  @Get(':id')
  async getLixi(@Param('id') id: string): Promise<any> {
    try {
      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: _.toSafeInteger(id)
        },
        include: {
          envelope: true
        }
      });

      const childrenLixies = await this.prisma.lixi.findMany({
        take: 10,
        where: {
          parentId: _.toSafeInteger(id),
        }
      });

      if (!lixi) throw new VError('The lixi does not exist in the database.');

      const balance: number = await this.xpiWallet.getBalance(lixi.address);

      let resultApi: any
      resultApi = _.omit({
        ...lixi,
        isClaimed: lixi.isClaimed,
        balance: balance,
        totalClaim: Number(lixi.totalClaim),
        envelope: lixi.envelope,
      } as unknown as LixiDto, 'encryptedXPriv');

      let childrenApi = childrenLixies.map(item => {
        return _.omit({
          ...item,
          totalClaim: Number(item.totalClaim),
          expiryAt: item.expiryAt ? item.expiryAt : undefined,
          country: item.country ? item.country : undefined,
        }, 'encryptedXPriv');
      })
      return {
        lixi: resultApi,
        children: childrenApi
      };
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
  async getSubLixi (
    @Param('id') id: string,
    @Query() { startId, limit }: PaginationParams,
    @Headers('Mnemonic') mnemonic: string
  ): Promise<PaginationResult<LixiDto>> {
    const lixiId = _.toSafeInteger(id);
    const take = limit ? _.toSafeInteger(limit) : 5;
      
    try {
      let subLixies: Lixi[] = [];

      const count = await this.prisma.lixi.count({
        where: {
          id: lixiId
        }
      });

      subLixies = startId ? 
        await this.prisma.lixi.findMany({
          take: take,
          skip: 1,
          where: {
            parentId: lixiId,
          },
          cursor: {
            id: startId,
          },
        }) : 
        await this.prisma.lixi.findMany({
          take: take,
          where: {
            parentId: lixiId,
          },
        })
      
      const resultApi = subLixies.map(subLixi => {
        return _.omit({
          ...subLixi,
          totalClaim: Number(subLixi.totalClaim),
        } as unknown as LixiDto, 'encryptedXPriv');
      })

      const startCursor = resultApi.length > 0 ? _.first(resultApi)?.id : null;
      const endCursor = resultApi.length > 0 ? _.last(resultApi)?.id : null;
      const countAfter = !endCursor ? 0 : await this.prisma.claim.count({
        where: {
          lixiId: lixiId
        },
        cursor: {
          id: _.toSafeInteger(endCursor)
        },
        skip: 1
      });

      const hasNextPage = countAfter > 0;

      return {
        data: resultApi ?? [],
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
  async createLixi(@Body() command: CreateLixiCommand): Promise<PostLixiResponseDto | undefined> {
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
        const latestLixi: LixiDb | null = await this.prisma.lixi.findFirst({
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
          lixi = await this.lixiService.createSingleLixi(lixiIndex, account as Account, command);
          return {
            lixi
          } as PostLixiResponseDto;
        } else {
          // One time child codes type
          lixi = await this.lixiService.createOneTimeParentLixi(lixiIndex, account as Account, command);
          const jobId = await this.lixiService.createSubLixies(lixiIndex + 1, account as Account, command, lixi);
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
  async withdrawLixi(@Param('id') id: string, @Body() command: Account) {
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

        return resultApi;
      }

      else {
        // Withdraw for OneTime Code
        const subLixies = await this.prisma.lixi.findMany({
          where: {
            parentId: lixiId
          }
        });

        for (let item in subLixies) {
          const subLixiAddress = subLixies[item].address;
          const subLixiDerivationIndex = subLixies[item].derivationIndex;

          const subLixiIndex = subLixiDerivationIndex;
          const { keyPair } = await this.walletService.deriveAddress(mnemonicFromApi, subLixiIndex);

          try {
            const totalAmount: number = await this.walletService.onMax(subLixiAddress);
            const receivingAccount = [{ address: account.address, amountXpi: totalAmount }];
            const amount: any = await this.walletService.sendAmount(subLixiAddress, receivingAccount, keyPair);

            const updatedSubLixies = await this.prisma.lixi.update({
              where: {
                id: subLixies[item].id
              },
              data: {
                amount: 0
              }
            });
          } catch (err) {
            continue;
          }
        }

        let resultApi: LixiDto = {
          ...lixi,
          amount: lixi.amount ?? 0,
          totalClaim: Number(lixi.totalClaim),
          expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
          activationAt: lixi.activationAt ? lixi.activationAt : undefined,
          country: lixi.country ? lixi.country : undefined,
          numberOfSubLixi: 0,
          parentId: lixi.parentId ?? undefined,
          isClaimed: lixi.isClaimed ?? false,
        };

        return resultApi;
      }

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        logger.error(err);
        const error = new VError.WError(err as Error, 'Could not withdraw the lixi.');
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

        const updatedLixi: LixiDb = await this.prisma.lixi.update({
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
