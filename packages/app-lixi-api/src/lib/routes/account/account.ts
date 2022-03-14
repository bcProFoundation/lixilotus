import express, { NextFunction } from 'express';
import * as _ from 'lodash';
import { Container } from 'typedi';
import { VError } from 'verror';

import { AccountDto, ImportAccountCommand, Lixi } from '@bcpros/lixi-models';
import { Account as AccountDb, Lixi as LixiDb, PrismaClient } from '@prisma/client';

import { WalletService } from '../../services/wallet';
import { aesGcmDecrypt, aesGcmEncrypt, hashMnemonic } from '../../utils/encryptionMethods';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/import', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const importAccountCommand: ImportAccountCommand = req.body;
  const { mnemonic } = importAccountCommand;

  try {

    const mnemonicHash = importAccountCommand?.mnemonicHash ?? await hashMnemonic(mnemonic);

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: mnemonicHash
      }
    });

    if (!account) {
      const walletService: WalletService = Container.get(WalletService);

      // Validate mnemonic
      let isValidMnemonic = await walletService.validateMnemonic(mnemonic);
      if (!isValidMnemonic) {
        throw Error('The mnemonic is not valid');
      }

      // encrypt mnemonic
      let encryptedMnemonic = await aesGcmEncrypt(mnemonic, mnemonic);

      // create account in database
      const { address } = await walletService.deriveAddress(mnemonic, 0);
      const name = address.slice(12, 17);
      const accountToInsert = {
        name: name,
        encryptedMnemonic: encryptedMnemonic,
        mnemonicHash: mnemonicHash,
        id: undefined,
        address: address,
      };
      const createdAccount: AccountDb = await prisma.account.create({ data: accountToInsert });
      const resultApi: AccountDto = {
        ...createdAccount,
        address,
        balance: 0
      };

      res.json(resultApi);
    } else {

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
    }

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