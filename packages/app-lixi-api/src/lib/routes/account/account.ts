import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import { VError } from 'verror';
import { PrismaClient, Lixi as LixiDb } from '@prisma/client';
import { ImportAccountCommand, AccountDto, Lixi } from '@bcpros/lixi-models';
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
      mnemonic: mnemonic,
      name: account.name,
      address: account.address
    };

    res.json(resultApi);

  } catch (error) {
    return res.status(400).json({
      error: `Could not import the account.`
    });
  }
});

router.get('/:id/lixies', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const accountId = _.toSafeInteger(id);

  try {
    const lixies: LixiDb[] = await prisma.lixi.findMany({
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
        totalRedeem: Number(item.totalClaim),
        lixiType: Number(item.lixiType),
        maxClaim: Number(item.maxClaim),
        claimedNum: Number(item.claimedNum),
        dividedValue: Number(item.dividedValue)
      } as unknown as Lixi;
    });

    res.json(results ?? []);

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get lixi list of the account.');
      return next(error);
    }
  }
});

export { router };