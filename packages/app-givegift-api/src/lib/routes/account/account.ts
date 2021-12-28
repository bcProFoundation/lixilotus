import express, { NextFunction } from 'express';
import { Vault } from '@abcpros/givegift-models';
import { VError } from 'verror';
import { PrismaClient, Vault as VaultDb } from '@prisma/client';
import { ImportAccountDto, AccountDto } from '@abcpros/givegift-models/src/lib/account';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/import', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const importAccountDto: ImportAccountDto = req.body;

  try {
    const encryptedMnemonic = importAccountDto.encryptedMnemonic;
    const account = await prisma.account.findFirst({
      where: {
        encryptedMnemonic: encryptedMnemonic
      }
    });

    if (!account) {
      throw Error('Could not found a account match your import.');
    }

    const resultApi: AccountDto = {
      ...account,
      name: String(account.name)
    };

    res.json(resultApi);

  } catch (error) {
    return res.status(400).json({
      error: `Could not import the account.`
    });
  }
});

router.get('/:id/vaults', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const accountId = parseInt(id);

  try {
    const vaults: VaultDb[] = await prisma.vault.findMany({
      where: {
        accountId: accountId
      }
    });

    const results = vaults.map(item => {
      return {
        ...item,
        totalRedeem: Number(item.totalRedeem),
        vaultType: Number(item.vaultType),
        maxRedeem: Number(item.maxRedeem),
        redeemedNum: Number(item.redeemedNum),
        dividedValue: Number(item.dividedValue)
      } as Vault;
    });

    res.json(results ?? []);

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get vault list of the account.');
      return next(error);
    }
  }
});

export { router };