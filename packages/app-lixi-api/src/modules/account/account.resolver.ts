import { Account, AccountDto, CreateAccountInput, ImportAccountInput } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import { HttpException, HttpStatus, Inject, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { PubSub } from 'graphql-subscriptions';
import _ from 'lodash';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { AccountEntity } from 'src/decorators/account.decorator';
import { GqlHttpExceptionFilter } from 'src/middlewares/gql.exception.filter';
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase58Str, hashMnemonic } from 'src/utils/encryptionMethods';
import VError from 'verror';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwtauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';

const pubSub = new PubSub();

@SkipThrottle()
@Resolver(() => Account)
@UseFilters(GqlHttpExceptionFilter)
export class AccountResolver {
  constructor(
    private logger: Logger,
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @I18n() private i18n: I18nService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {}

  @Subscription(() => Account)
  accountCreated() {
    return pubSub.asyncIterator('accountCreated');
  }

  @Query(() => Account)
  @UseGuards(GqlJwtAuthGuard)
  async getAccountByAddress(
    @AccountEntity() myAccount: Account,
    @Args('address', { type: () => String }) address: string,
    @I18n() i18n: I18nContext
  ) {
    try {
      const account = await this.prisma.account.findFirst({
        where: {
          address: address
        },
        include: {
          pages: true,
          uploadDetail: true
        }
      });
      if (!account) {
        const accountNotExistMessage = await this.i18n.t('account.messages.accountNotExist');
        throw new VError(accountNotExistMessage);
      }

      let followersCount = 0;
      let followingsCount = 0;
      let followingPagesCount = 0;
      if (myAccount.id === account.id) {
        const followingsCountPromise = this.prisma.followAccount.count({
          where: { followerAccountId: myAccount.id }
        });
        const followersCountPromise = this.prisma.followAccount.count({
          where: { followingAccountId: myAccount.id }
        });
        const followingPagesCountPromise = this.prisma.followPage.count({
          where: { accountId: myAccount.id }
        });

        [followersCount, followingsCount, followingPagesCount] = await Promise.all([
          followersCountPromise,
          followingsCountPromise,
          followingPagesCountPromise
        ]);
      }

      const result = _.omit(
        {
          ...account,
          followersCount: followersCount,
          followingsCount: followingsCount,
          followingPagesCount: followingPagesCount
        },
        'encryptedMnemonic',
        'encryptedSecret',
        'mnemonicHash',
        'notifications'
      );

      return result;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetAccountMessage = await this.i18n.t('account.messages.unableGetAccount');
        const error = new VError.WError(err as Error, unableGetAccountMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Mutation(() => Account)
  async createAccount(@Args('data') data: CreateAccountInput) {
    if (data) {
      try {
        const { address, publicKey } = await this.walletService.deriveAddress(data.mnemonic, 0);
        const name = address.slice(12, 17);

        // Create random account secret then encrypt it using mnemonic
        const accountSecret: string = generateRandomBase58Str(10);
        const encryptedSecret = await aesGcmEncrypt(accountSecret, data.mnemonic);

        const accountToInsert = {
          name: name,
          encryptedMnemonic: data.encryptedMnemonic,
          encryptedSecret: encryptedSecret,
          mnemonicHash: data.mnemonicHash,
          id: undefined,
          address: address,
          publicKey: publicKey
        };

        const createdAccount = await this.prisma.account.create({
          data: accountToInsert
        });

        const resultApi = _.omit(
          {
            ...data,
            ..._.omit(createdAccount, 'publicKey'),
            secret: accountSecret,
            address
          },
          ['mnemonic', 'encryptedMnemonic', 'encryptedSecret']
        );

        pubSub.publish('accountCreated', { accountCreated: resultApi });
        return resultApi;
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const unableCreateAccountMessage = await this.i18n.t('account.messages.unableCreateAccount');
          const error = new VError.WError(err as Error, unableCreateAccountMessage);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }

  @Mutation(() => Account)
  async importAccount(@Args('data') data: ImportAccountInput) {
    const { mnemonic } = data;

    try {
      const mnemonicHash = data?.mnemonicHash ?? (await hashMnemonic(mnemonic));
      const account = await this.prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });

      if (!account) {
        // Validate mnemonic
        let isValidMnemonic = await this.walletService.validateMnemonic(mnemonic);
        if (!isValidMnemonic) {
          const mnemonicNotValidMessage = await this.i18n.t('account.messages.mnemonicNotValid');
          throw Error(mnemonicNotValidMessage);
        }

        // encrypt mnemonic
        const encryptedMnemonic = await aesGcmEncrypt(mnemonic, mnemonic);
        // Create random account secret then encrypt it using mnemonic
        const accountSecret: string = generateRandomBase58Str(10);
        const encryptedSecret = await aesGcmEncrypt(accountSecret, mnemonic);

        // create account in database
        const { address, publicKey } = await this.walletService.deriveAddress(mnemonic, 0);
        const name = address.slice(12, 17);
        const accountToInsert = {
          name: name,
          encryptedMnemonic: encryptedMnemonic,
          encryptedSecret: encryptedSecret,
          mnemonicHash: mnemonicHash,
          id: undefined,
          address: address,
          publicKey: publicKey
        };
        const createdAccount = await this.prisma.account.create({
          data: accountToInsert
        });
        const balance: number = await this.xpiWallet.getBalance(createdAccount.address);

        const resultApi = _.omit(
          {
            ..._.omit(createdAccount, 'publicKey'),
            name: createdAccount.name,
            address: createdAccount.address,
            balance: balance,
            secret: accountSecret
          },
          ['mnemonic', 'encryptedMnemonic']
        );

        return resultApi;
      } else {
        // Decrypt to validate the mnemonic
        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonic);
        if (mnemonic !== mnemonicToValidate) {
          const importAccountNotFoundMessage = await this.i18n.t('account.messages.importAccountNotFound');
          throw Error(importAccountNotFoundMessage);
        }

        const balance: number = await this.xpiWallet.getBalance(account.address);
        const accountSecret = await aesGcmDecrypt(account.encryptedSecret, mnemonic);

        const resultApi = _.omit(
          {
            ..._.omit(account, 'publicKey'),
            name: account.name,
            address: account.address,
            balance: balance,
            secret: accountSecret
          } as AccountDto,
          ['mnemonic', 'encryptedMnemonic']
        );

        pubSub.publish('accountImported', { accountImported: resultApi });
        return resultApi;
      }
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const importCouldNotImportAccountMessage = await this.i18n.t('account.messages.couldNotImportAccount');
        const error = new VError.WError(err as Error, importCouldNotImportAccountMessage);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
