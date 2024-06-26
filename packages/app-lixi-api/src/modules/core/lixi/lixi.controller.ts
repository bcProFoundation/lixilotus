import {
  Account,
  Claim,
  ClaimType,
  CreateLixiCommand,
  ExportLixiCommand,
  fromSmallestDenomination,
  LixiDto,
  PaginationResult,
  PostLixiResponseDto,
  RegisterLixiPackCommand,
  RenameLixiCommand,
  SessionAction,
  SessionActionEnum
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
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Claim as ClaimDb, Lixi, PageMessageSessionStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createReadStream } from 'fs';
import * as _ from 'lodash';
import moment from 'moment';
import { I18n, I18nContext } from 'nestjs-i18n';
import { join } from 'path';
import { PaginationParams } from 'src/common/models/paginationParams';
import { NotificationService } from 'src/common/modules/notifications/notification.service';
import { PageAccountEntity } from 'src/decorators/pageAccount.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwtauth.guard';
import {
  EXPORT_SUB_LIXIES_QUEUE,
  LIXI_JOB_NAMES,
  WITHDRAW_SUB_LIXIES_QUEUE
} from 'src/modules/core/lixi/constants/lixi.constants';
import { LixiService } from 'src/modules/core/lixi/lixi.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { aesGcmDecrypt, base58ToNumber, numberToBase58 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationGateway } from 'src/common/modules/notifications/notification.gateway';

@SkipThrottle()
@Controller('lixies')
@UseInterceptors(ClassSerializerInterceptor)
@Injectable()
export class LixiController {
  private logger: Logger = new Logger(LixiController.name);

  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly lixiService: LixiService,
    private readonly notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private XPI: BCHJS,
    @InjectQueue(EXPORT_SUB_LIXIES_QUEUE) private exportSubLixiesQueue: Queue,
    @InjectQueue(WITHDRAW_SUB_LIXIES_QUEUE) private withdrawSubLixiesQueue: Queue
  ) {}

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
          envelope: true,
          distributions: true,
          pageMessageSession: {
            select: {
              id: true,
              status: true,
              page: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!lixi) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new VError(lixiNotExist);
      }

      const balance: number = await this.xpiWallet.getBalance(lixi.address);

      const subLixies = await this.prisma.lixi.aggregate({
        _sum: {
          amount: true,
          totalClaim: true
        },
        where: {
          parentId: lixi.id
        }
      });

      const subLixiBalance = subLixies._sum.amount;
      const subLixiTotalClaim = fromSmallestDenomination(Number(subLixies._sum.totalClaim));

      let resultApi: any;
      resultApi = _.omit(
        {
          ...lixi,
          activationAt: lixi.activationAt ? lixi.activationAt.toISOString() : null,
          isClaimed: lixi.isClaimed,
          balance: balance,
          totalClaim: Number(lixi.totalClaim),
          envelope: lixi.envelope,
          distributions: lixi.distributions,
          subLixiBalance: subLixiBalance,
          subLixiTotalClaim: subLixiTotalClaim
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
        this.logger.error(err);
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
          this.logger.error(err);
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
  @UseGuards(JwtAuthGuard)
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
          lixi = await this.lixiService.createOneTimeParentLixi(lixiIndex, account, command);
          const jobId = await this.lixiService.createSubLixies(lixiIndex + 1, account, command, lixi);

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

  @Patch('register')
  @UseGuards(JwtAuthGuard)
  async registerPackWithClaimCode(
    @PageAccountEntity() account: Account,
    @Body() command: RegisterLixiPackCommand,
    @Request() req: FastifyRequest,
    @I18n() i18n: I18nContext
  ): Promise<boolean | undefined> {
    try {
      if (!account) {
        const couldNotFindAccount = await i18n.t('lixi.messages.couldNotFindAccount');
        throw new Error(couldNotFindAccount);
      }
      const encodedLixiId = command.claimCode.slice(8);
      const lixiId = _.toSafeInteger(base58ToNumber(encodedLixiId));
      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId
        }
      });

      if (!lixi) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new VError(lixiNotExist);
      }

      if (lixi.accountId != account.id) {
        const haveNotAccess = await i18n.t('lixi.messages.haveNotAccess');
        throw new VError(haveNotAccess);
      }
      if (lixi?.claimType === ClaimType.Single) {
        const unableToRegister = await i18n.t('lixi.messages.unableToRegister');
        throw new VError(unableToRegister);
      }

      let parentLixi = await this.prisma.lixi.findUnique({
        where: {
          id: lixi.parentId as number
        },
        include: {
          distributions: true
        }
      });

      let numberOfDistributions!: number;
      if (parentLixi) {
        numberOfDistributions = parentLixi?.joinLotteryProgram
          ? parentLixi.distributions.length + 2
          : parentLixi.distributions.length + 1;
      }

      if (_.isNil(lixi.packageId)) {
        const packageUpdate = await this.prisma.package.create({
          data: {
            registrant: command.registrant
          }
        });

        await this.prisma.lixi.updateMany({
          where: {
            parentId: lixi.parentId
          },
          data: {
            packageId: packageUpdate.id
          }
        });
      } else {
        if (lixi.inventoryStatus === 'registered') {
          // if already register => ignore and return success
          return true;
        } else {
          const distributionAddRegister = numberOfDistributions + 1;

          const lixiListFind = await this.prisma.lixi.findMany({
            where: {
              packageId: lixi.packageId
            }
          });

          lixiListFind.map(lixi => {
            const totalAmountBeforeRegister = lixi.amount * numberOfDistributions;
            const amountFundingRegistered = totalAmountBeforeRegister / distributionAddRegister;

            return {
              ...lixi,
              amount: amountFundingRegistered,
              inventoryStatus: 'registered',
              updatedAt: new Date()
            };
          });

          const lixiListUpdate = await this.prisma.lixi.updateMany({
            where: {
              packageId: lixi.packageId
            },
            data: {
              inventoryStatus: 'registered',
              updatedAt: new Date()
            }
          });

          const packageRegistrant = await this.prisma.package.update({
            where: {
              id: lixi.packageId as number
            },
            data: {
              updatedAt: new Date(),
              registrant: command.registrant
            }
          });

          if (lixiListUpdate.count > 0 && !_.isNil(packageRegistrant)) {
            // if having lixiListUpdate update => return true noti update successfully
            return true;
          } else {
            // count === 0 => don't have any data to update
            const lixiPackNotRegister = await i18n.t('lixi.messages.lixiPackNotRegister');
            throw new VError(lixiPackNotRegister);
          }
        }
      }
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const lixiPackNotRegister = await i18n.t('lixi.messages.lixiPackNotRegister');
        const error = new VError.WError(err as Error, lixiPackNotRegister);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
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
      const mnemonicFromApi = command.mnemonic as string;

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
        let lixi = await this.prisma.lixi.findUnique({
          where: {
            id: lixiId
          }
        });

        lixi = await this.prisma.lixi.update({
          where: {
            id: lixiId
          },
          data: {
            status: 'locked',
            previousStatus: (lixi as any).status,
            updatedAt: new Date()
          }
        });

        const pageMessageSession = await this.prisma.pageMessageSession.findUnique({
          where: {
            lixiId: lixi.id
          }
        });

        if (pageMessageSession) {
          const result = await this.prisma.pageMessageSession.update({
            where: {
              id: pageMessageSession.id
            },
            data: {
              status: PageMessageSessionStatus.CLOSE,
              sessionClosedAt: new Date()
            },
            include: {
              account: true,
              lixi: {
                select: {
                  id: true,
                  name: true,
                  amount: true,
                  expiryAt: true,
                  activationAt: true,
                  status: true
                }
              },
              page: true
            }
          });

          const sessionAction: SessionAction = {
            type: SessionActionEnum.CLOSE,
            payload: result
          };

          this.notificationGateway.publishSessionAction(pageMessageSession.id, sessionAction);
        }

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
  @UseGuards(JwtAuthGuard)
  async unlockLixi(
    @Param('id') id: string,
    @Body() command: Account,
    @I18n() i18n: I18nContext
  ): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic as string;

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
        let lixi = await this.prisma.lixi.findUnique({
          where: {
            id: lixiId
          }
        });

        lixi = await this.prisma.lixi.update({
          where: {
            id: lixiId
          },
          data: {
            previousStatus: lixi?.status,
            status:
              lixi?.previousStatus == 'failed' || lixi?.previousStatus == 'withdrawn' ? lixi?.previousStatus : 'active',
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
  @UseGuards(JwtAuthGuard)
  async withdrawLixi(@Param('id') id: string, @Body() command: Account, @I18n() i18n: I18nContext) {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic as string;

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

        //If lixi is withdrew before session open then close session
        const pageMessageSession = await this.prisma.pageMessageSession.findUnique({
          where: {
            lixiId: lixi.id
          }
        });

        if (pageMessageSession) {
          const result = await this.prisma.pageMessageSession.update({
            where: {
              id: pageMessageSession.id
            },
            data: {
              status: PageMessageSessionStatus.CLOSE,
              sessionClosedAt: new Date()
            },
            include: {
              account: true,
              lixi: {
                select: {
                  id: true,
                  name: true,
                  amount: true,
                  expiryAt: true,
                  activationAt: true,
                  status: true
                }
              },
              page: true
            }
          });

          const sessionAction: SessionAction = {
            type: SessionActionEnum.CLOSE,
            payload: result
          };

          this.notificationGateway.publishSessionAction(pageMessageSession.id, sessionAction);
        }

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
        await this.prisma.lixi.update({
          where: {
            id: lixi.id
          },
          data: {
            amount: 0,
            status: 'withdrawn'
          }
        });

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
        this.logger.error(err);
        const couldNotWithdraw = await i18n.t('lixi.messages.couldNotWithdraw');
        const error = new VError.WError(err as Error, couldNotWithdraw);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/export')
  @UseGuards(JwtAuthGuard)
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
      });

      const subLixiesIds = subLixies.map(item => item.id);
      subLixiesIds.push(lixiId);

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
          message: '',
          image: '',
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
  @UseGuards(JwtAuthGuard)
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
    @PageAccountEntity() account: Account,
    @Param('id') id: string,
    @Query('file') fileName: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @I18n() i18n: I18nContext
  ): Promise<StreamableFile> {
    try {
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

      const file = createReadStream(join(process.cwd(), 'public', 'download', fileName));

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

  @Post('check-valid')
  async checkLixiBarcode(@Body() body: any, @I18n() i18n: I18nContext) {
    try {
      const { lixiBarcode } = body;

      const id = parseInt(lixiBarcode.slice(0, -1), 10);

      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });

      if (!lixi) {
        const lixiNotExist = await i18n.t('lixi.messages.lixiNotExist');
        throw new VError(lixiNotExist);
      }

      if (lixi.isClaimed) {
        const lixiClaimed = await i18n.t('lixi.messages.lixiClaimed');
        throw new VError(lixiClaimed);
      }

      const lixiValid = await i18n.t('lixi.messages.lixiValid');

      return lixiValid;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableToFindLixi = await i18n.t('lixi.messages.couldNotFindLixi');
        const error = new VError.WError(err as Error, unableToFindLixi);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
