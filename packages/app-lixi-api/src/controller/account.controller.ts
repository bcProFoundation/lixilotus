import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Param, Patch, Post } from '@nestjs/common';
import * as _ from 'lodash';
import { VError } from 'verror';
import { Account as AccountDb, Lixi as LixiDb, PrismaClient } from '@prisma/client';
import { ImportAccountCommand, AccountDto, CreateAccountCommand, RenameAccountCommand, DeleteAccountCommand, Lixi } from '@bcpros/lixi-models';
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase58Str, hashMnemonic } from '../utils/encryptionMethods';
import { WalletService } from "../services/wallet.service";
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import { PrismaService } from '../services/prisma/prisma.service';

@Controller('accounts')
export class AccountController {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) { }

  @Get(':id')
  async getAccount(@Param('id') id: string): Promise<AccountDto> {
    try {
      const account = await this.prisma.account.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });
      if (!account)
        throw new VError('The account does not exist in the database.');

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
        const error = new VError.WError(err as Error, 'Unable to get account.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('import')
  async import(@Body() importAccountCommand: ImportAccountCommand): Promise<AccountDto> {
    const { mnemonic } = importAccountCommand;

    try {
      const mnemonicHash = importAccountCommand?.mnemonicHash ?? await hashMnemonic(mnemonic);
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

      if (!account) {
        // Validate mnemonic
        let isValidMnemonic = await this.walletService.validateMnemonic(mnemonic);
        if (!isValidMnemonic) {
          throw Error('The mnemonic is not valid');
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
          address: address,
        };
        const createdAccount: AccountDb = await this.prisma.account.create({ data: accountToInsert });
        const balance: number = await this.xpiWallet.getBalance(createdAccount.address);

        const resultApi = _.omit({
          ...createdAccount,
          name: createdAccount.name,
          address: createdAccount.address,
          balance: balance
        } as AccountDto, ['mnemonic', 'encryptedMnemonic']);

        return resultApi;
      }
      else {
        // Decrypt to validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonic);
        if (mnemonic !== mnemonicToValidate) {
          throw Error('Could not found import account.');
        }

        const balance: number = await this.xpiWallet.getBalance(account.address);

        const resultApi = _.omit({
          ...account,
          name: account.name,
          address: account.address,
          balance: balance
        } as AccountDto, ['mnemonic', 'encryptedMnemonic']);

        return resultApi;
      }

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Could not import the account.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async createAccount(@Body() command: CreateAccountCommand): Promise<AccountDto> {
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
          address: address,
        };

        const createdAccount: AccountDb = await this.prisma.account.create({ data: accountToInsert });

        const resultApi: AccountDto = _.omit({
          ...command, ...createdAccount,
          address
        }, ['mnemonic', 'encryptedMnemonic']);

        return resultApi;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const error = new VError.WError(err as Error, 'Unable to create new account.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }

  @Patch(':id')
  async updateAccounts(@Param('id') id: string, @Body() command: RenameAccountCommand): Promise<AccountDto> {
    if (command) {
      try {
        const account = await this.prisma.account.findUnique({
          where: {
            id: _.toSafeInteger(id)
          }
        });
        if (!account)
          throw new VError('The account does not exist in the database.');

        // Validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, command.mnemonic);
        if (command.mnemonic !== mnemonicToValidate) {
          throw new VError('Invalid account! Could not update the account.');
        }

        const updatedAccount: AccountDb = await this.prisma.account.update({
          where: {
            id: _.toSafeInteger(id),
          },
          data: {
            name: command.name,
            updatedAt: new Date(),
          }
        });

        const resultApi: AccountDto = _.omit({
          ...command, ...updatedAccount,
          address: updatedAccount.address as string
        }, ['mnemonic', 'encryptedMnemonic']);

        return resultApi;

      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const error = new VError.WError(err as Error, 'Unable to update account.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteAccounts(@Param('id') id: string, @Body() command: DeleteAccountCommand): Promise<AccountDto> {
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
          throw Error('Invalid account! Could not update the account.');
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
          this.prisma.account.deleteMany({ where: { id: accountId } }),
        ])
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
        const error = new VError.WError(err as Error, 'Unable to delete the account.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/lixies')
  async getLixies(@Param('id') id: string): Promise<any> {
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
        const error = new VError.WError(err as Error, 'Unable to get vault list of the account.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
