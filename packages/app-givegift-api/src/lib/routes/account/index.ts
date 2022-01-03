import express, { NextFunction } from 'express';
import VError from 'verror';

import {
  AccountDto, CreateAccountCommand, DeleteAccountCommand, RenameAccountCommand
} from '@abcpros/givegift-models';
import { Account as AccountDb, PrismaClient, Prisma } from '@prisma/client';

import { aesGcmDecrypt } from '../../utils/encryptionMethods';
import { router as accountChildRouter } from './account';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/accounts/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    if (!account)
      throw new VError('The account does not exist in the database.');

    const result = {
      ...account,
      encryptedMnemonic: String(account?.encryptedMnemonic)
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
      const accountToInsert = {
        ...command,
        id: undefined,
      };

      const createdAccount: AccountDb = await prisma.account.create({ data: accountToInsert });

      const resultApi: AccountDto = {
        ...command, ...createdAccount
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
          id: parseInt(id)
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
          id: parseInt(id),
        },
        data: {
          name: command.name,
          updatedAt: new Date()
        }
      });

      const resultApi: AccountDto = {
        ...command, ...updatedAccount
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
  const accountId = parseInt(id);
  const command: DeleteAccountCommand = req.body;
  try {
    const account = await prisma.account.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (account) {
      // Validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, command.mnemonic);
      if (command.mnemonic !== mnemonicToValidate) {
        throw Error('Invalid account! Could not update the account.');
      }
    }

    await prisma.$transaction([
      prisma.vault.deleteMany({ where: { accountId: accountId } }),
      prisma.account.deleteMany({ where: { id: accountId } }),
    ])

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