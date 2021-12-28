import { PrismaClient } from "@prisma/client";
import express, { NextFunction } from "express";
import VError from "verror";
import { AccountDto } from '@abcpros/givegift-models/src/lib/account';
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
      });      if (!account) throw new VError('The account does not exist in the database.');
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
    const accountApi: AccountDto = req.body;
    if (accountApi) {
      try {
        const accountToInsert = {
          ...accountApi,
        };
        const createdAccount = await prisma.account.create({ data: accountToInsert });
  
        const resultApi: AccountDto = {
          ...createdAccount,
          encryptedMnemonic: String(createdAccount.encryptedMnemonic)
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

router.use('/accounts', accountChildRouter);
export { router };