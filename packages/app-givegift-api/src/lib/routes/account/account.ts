import express, { NextFunction } from 'express';
import { VError } from 'verror';
import { PrismaClient, Vault as VaultDb } from '@prisma/client';
import { ImportAccountCommand, AccountDto, Vault } from '@abcpros/givegift-models';
import { aesGcmDecrypt } from '../../utils/encryptionMethods';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/import', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const importAccountCommand: ImportAccountCommand = req.body;
  const { mnemonic, mnemonicHash } = importAccountCommand;

  try {

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: mnemonicHash
      }
    });

    if (!account) {
      throw Error('Could not found import account.');
    }

    // Decrypt to validate the mnemonic
    const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonic);
    if (mnemonic !== mnemonicToValidate) {
      throw Error('Could not found import account.');
    }

    const resultApi: AccountDto = {
      ...account,
      name: account.name
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