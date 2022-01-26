import express, { NextFunction } from 'express';
import * as _ from 'lodash';
import Container from 'typedi';
import VError from 'verror';

import {
  AccountDto, CreateAccountCommand, DeleteAccountCommand, RenameAccountCommand
} from '@abcpros/givegift-models';
import { Account as AccountDb, Prisma, PrismaClient } from '@prisma/client';

import { WalletService } from '../../services/wallet';
import { aesGcmDecrypt } from '../../utils/encryptionMethods';
import { router as accountChildRouter } from './account';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/accounts/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const account = await prisma.account.findUnique({
      where: {
        id: _.toSafeInteger(id)
      }
    });
    if (!account)
      throw new VError('The account does not exist in the database.');

    const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
    const balance: number = await xpiWallet.getBalance(account.address);

    const result = {
      ...account,
      encryptedMnemonic: String(account?.encryptedMnemonic),
      balance: balance
    } as AccountDto;
    return res.json(result);
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get account.');
      return next(error);
    }
  }
});

router.post('/accounts', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const command: CreateAccountCommand = req.body;
  if (command) {
    try {
      const walletService: WalletService = Container.get(WalletService);
      const { address } = await walletService.deriveAddress(command.mnemonic, 0);
      const name = address.slice(12, 17);

      const accountToInsert = {
        name: name,
        encryptedMnemonic: command.encryptedMnemonic,
        mnemonicHash: command.mnemonicHash,
        id: undefined,
        address: address,
      };

      const createdAccount: AccountDb = await prisma.account.create({ data: accountToInsert });

      const resultApi: AccountDto = {
        ...command, ...createdAccount, 
        address,
        balance: 0
      };

      res.json(resultApi);
    } catch (err) {
      if (err instanceof VError) {
        return next(err);
      } else {
        const error = new VError.WError(err as Error, 'Unable to create new account.');
        return next(error);
      }
    }
  }

});

router.patch('/accounts/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const command: RenameAccountCommand = req.body;
  if (command) {
    try {
      const account = await prisma.account.findUnique({
        where: {
          id: _.toSafeInteger(id)
        }
      });
      if (!account)
        throw new VError('The account does not exist in the database.');

      // Validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, command.mnemonic);
      if (command.mnemonic !== mnemonicToValidate) {
        throw Error('Invalid account! Could not update the account.');
      }

      const updatedAccount: AccountDb = await prisma.account.update({
        where: {
          id: _.toSafeInteger(id),
        },
        data: {
          name: command.name,
          updatedAt: new Date(),
        }
      });

      const resultApi: AccountDto = {
        ...command, ...updatedAccount,
        address: updatedAccount.address as string
      };

      res.json(resultApi);

    } catch (err) {
      if (err instanceof VError) {
        return next(err);
      } else {
        const error = new VError.WError(err as Error, 'Unable to create new account.');
        return next(error);
      }
    }
  }
});

router.delete('/accounts/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const accountId = _.toSafeInteger(id);
  const command: DeleteAccountCommand = req.body;
  try {
    const account = await prisma.account.findUnique({
      where: {
        id: _.toSafeInteger(id)
      },
      include: {
        vaults: true
      }
    });



    if (account) {
      // Validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, command.mnemonic);
      if (command.mnemonic !== mnemonicToValidate) {
        throw Error('Invalid account! Could not update the account.');
      }
    }

    let vaults = account && account.vaults ? account.vaults : [];

    if (vaults.length > 0) {
      // delete associated redeems, vaults then account
      const redeemDeleteCondition: Array<{ id: number }> = vaults.map(vault => {
        return {
          id: _.toSafeInteger(vault.id)
        };
      });
      await prisma.$transaction([
        prisma.redeem.deleteMany({
          where: {
            OR: redeemDeleteCondition
          }
        }),
        prisma.vault.deleteMany({ where: { accountId: accountId } }),
        prisma.account.deleteMany({ where: { id: accountId } }),
      ])
    } else {
      prisma.account.deleteMany({ where: { id: accountId } });
    }

    res.status(204).send();
  } catch (err) {
    if ((err as any).code === 'P2025') {
      // Record to delete does not exist.
      return res.status(204).send();
    }
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to delete the account.');
      return next(error);
    }
  }
});

router.use('/accounts', accountChildRouter);
export { router };