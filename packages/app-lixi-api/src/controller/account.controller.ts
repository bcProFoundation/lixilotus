import {
  Body,
  Controller,
  Headers,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import * as _ from 'lodash';
import { VError } from 'verror';
import { Account as AccountDb, Lixi as LixiDb } from '@prisma/client';
import {
  ImportAccountCommand,
  AccountDto,
  CreateAccountCommand,
  RenameAccountCommand,
  DeleteAccountCommand,
  Lixi,
  NotificationDto
} from '@bcpros/lixi-models';
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase58Str, hashMnemonic } from '../utils/encryptionMethods';
import { I18n, I18nContext } from 'nestjs-i18n';
import { WalletService } from '../services/wallet.service';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import { PrismaService } from '../services/prisma/prisma.service';

@Controller('accounts')
export class AccountController {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {}

  @Get(':id')
  async getAccount(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<AccountDto> {
    try {
      const account = await this.prisma.account.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });
      if (!account) {
        const accountNotExistMessage = await i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      const balance: number = await this.xpiWallet.getBalance(account.address);

      const result = {
        ...account,
        balance: balance
      } as AccountDto;

      return result;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetAccountMessage = await i18n.t('account.messages.unableGetAccount');
        const error = new VError.WError(err as Error, unableGetAccountMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('import')
  async import(@Body() importAccountCommand: ImportAccountCommand, @I18n() i18n: I18nContext): Promise<AccountDto> {
    const { mnemonic } = importAccountCommand;

    try {
      const mnemonicHash = importAccountCommand?.mnemonicHash ?? (await hashMnemonic(mnemonic));
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

      if (!account) {
        // Validate mnemonic
        let isValidMnemonic = await this.walletService.validateMnemonic(mnemonic);
        if (!isValidMnemonic) {
          const mnemonicNotValidMessage = await i18n.t('account.messages.mnemonicNotValid');
          throw Error(mnemonicNotValidMessage);
        }

        // encrypt mnemonic
        const encryptedMnemonic = await aesGcmEncrypt(mnemonic, mnemonic);
        // Create random account secret then encrypt it using mnemonic
        const encryptedSecret = await aesGcmDecrypt(generateRandomBase58Str(10), mnemonic);

        // create account in database
        const { address } = await this.walletService.deriveAddress(mnemonic, 0);
        const name = address.slice(12, 17);
        const accountToInsert = {
          name: name,
          encryptedMnemonic: encryptedMnemonic,
          encryptedSecret: encryptedSecret,
          mnemonicHash: mnemonicHash,
          id: undefined,
          address: address
        };
        const createdAccount: AccountDb = await this.prisma.account.create({
          data: accountToInsert
        });
        const balance: number = await this.xpiWallet.getBalance(createdAccount.address);

        const resultApi = _.omit(
          {
            ...createdAccount,
            name: createdAccount.name,
            address: createdAccount.address,
            balance: balance
          } as AccountDto,
          ['mnemonic', 'encryptedMnemonic']
        );

        return resultApi;
      } else {
        // Decrypt to validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonic);
        if (mnemonic !== mnemonicToValidate) {
          const importAccountNotFoundMessage = await i18n.t('account.messages.importAccountNotFound');
          throw Error(importAccountNotFoundMessage);
        }

        const balance: number = await this.xpiWallet.getBalance(account.address);

        const resultApi = _.omit(
          {
            ...account,
            name: account.name,
            address: account.address,
            balance: balance
          } as AccountDto,
          ['mnemonic', 'encryptedMnemonic']
        );

        return resultApi;
      }
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const importCouldNotImportAccountMessage = await i18n.t('account.messages.couldNotImportAccount');
        const error = new VError.WError(err as Error, importCouldNotImportAccountMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async createAccount(@Body() command: CreateAccountCommand, @I18n() i18n: I18nContext): Promise<AccountDto> {
    if (command) {
      try {
        const { address } = await this.walletService.deriveAddress(command.mnemonic, 0);
        const name = address.slice(12, 17);

        // Create random account secret then encrypt it using mnemonic
        const accountSecret: string = generateRandomBase58Str(10);
        const encryptedSecret = await aesGcmEncrypt(accountSecret, command.mnemonic);

        const accountToInsert = {
          name: name,
          encryptedMnemonic: command.encryptedMnemonic,
          encryptedSecret: encryptedSecret,
          mnemonicHash: command.mnemonicHash,
          id: undefined,
          address: address
        };

        const createdAccount: AccountDb = await this.prisma.account.create({
          data: accountToInsert
        });

        const resultApi: AccountDto = _.omit(
          {
            ...command,
            ...createdAccount,
            secret: accountSecret,
            address
          },
          ['mnemonic', 'encryptedMnemonic', 'encryptedSecret']
        );

        return resultApi;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableCreateAccountMessage = await i18n.t('account.messages.unableCreateAccount');
          const error = new VError.WError(err as Error, unableCreateAccountMessage);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }

  @Patch(':id')
  async updateAccounts(
    @Param('id') id: string,
    @Body() command: RenameAccountCommand,
    @I18n() i18n: I18nContext
  ): Promise<AccountDto> {
    if (command) {
      try {
        const account = await this.prisma.account.findUnique({
          where: {
            id: _.toSafeInteger(id)
          }
        });
        if (!account) {
          const accountDoesNotExistMessage = await i18n.t('account.messages.accountNotExist');
          throw new VError(accountDoesNotExistMessage);
        }

        // Validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, command.mnemonic);
        if (command.mnemonic !== mnemonicToValidate) {
          const invalidAccountMessage = await i18n.t('account.messages.invalidAccount');
          throw new VError(invalidAccountMessage);
        }

        const updatedAccount: AccountDb = await this.prisma.account.update({
          where: {
            id: _.toSafeInteger(id)
          },
          data: {
            name: command.name,
            updatedAt: new Date()
          }
        });

        const resultApi: AccountDto = _.omit(
          {
            ...command,
            ...updatedAccount,
            address: updatedAccount.address as string
          },
          ['mnemonic', 'encryptedMnemonic']
        );

        return resultApi;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableUpdateAccountMessage = await i18n.t('account.messages.unableUpdateAccount');
          const error = new VError.WError(err as Error, unableUpdateAccountMessage);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteAccounts(
    @Param('id') id: string,
    @Body() command: DeleteAccountCommand,
    @I18n() i18n: I18nContext
  ): Promise<AccountDto> {
    const accountId = _.toSafeInteger(id);
    try {
      const account = await this.prisma.account.findUnique({
        where: {
          id: _.toSafeInteger(id)
        },
        include: {
          lixies: true
        }
      });

      if (account) {
        // Validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, command.mnemonic);
        if (command.mnemonic !== mnemonicToValidate) {
          const invalidAccountMessage = await i18n.t('account.messages.invalidAccount');
          throw Error(invalidAccountMessage);
        }
      }

      let lixies = account && account.lixies ? account.lixies : [];

      if (lixies.length > 0) {
        // delete associated claims, lixies then account
        const claimDeleteCondition: Array<{ id: number }> = lixies.map(lixi => {
          return {
            id: _.toSafeInteger(lixi.id)
          };
        });
        await this.prisma.$transaction([
          this.prisma.claim.deleteMany({
            where: {
              OR: claimDeleteCondition
            }
          }),
          this.prisma.lixi.deleteMany({ where: { accountId: accountId } }),
          this.prisma.account.deleteMany({ where: { id: accountId } })
        ]);
      } else {
        this.prisma.account.deleteMany({ where: { id: accountId } });
      }

      return null as any;
    } catch (err) {
      if ((err as any).code === 'P2025') {
        // Record to delete does not exist.
        return null as any;
      }
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableDeleteAccountMessage = await i18n.t('account.messages.unableDeleteAccount');
        const error = new VError.WError(err as Error, unableDeleteAccountMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/lixies')
  async getLixies(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<any> {
    const accountId = _.toSafeInteger(id);
    try {
      const lixies: LixiDb[] = await this.prisma.lixi.findMany({
        where: {
          accountId: accountId
        },
        include: {
          envelope: true
        }
      });

      const results = lixies.map(item => {
        return {
          ...item,
          totalClaim: Number(item.totalClaim),
          lixiType: Number(item.lixiType),
          maxClaim: Number(item.maxClaim),
          claimedNum: Number(item.claimedNum),
          dividedValue: Number(item.dividedValue)
        } as unknown as Lixi;
      });

      return results ?? [];
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetLixiListMessage = await i18n.t('account.messages.unableGetLixiList');
        const error = new VError.WError(err as Error, unableGetLixiListMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/notifications')
  async getNotifications(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Headers('mnemonic-hash') mnemonicHash?: string
  ): Promise<NotificationDto[]> {
    const accountId = _.toSafeInteger(id);

    try {
      // Find the associated account
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

      if (!account || account?.id !== accountId) {
        const noPermissionMessage = await i18n.t('account.messages.noPermission');
        throw Error(noPermissionMessage);
      }

      const notifications = await this.prisma.notification.findMany({
        where: {
          recipientId: accountId
        },
        include: {
          notificationType: true
        },
        orderBy: [
          {
            createdAt: 'desc'
          }
        ],
        take: 20
      });

      return notifications.map(item => {
        return {
          ...item
        } as NotificationDto;
      });
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetNotification = await i18n.t('account.messages.unableGetNotification');
        const error = new VError.WError(err as Error, unableGetNotification);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
