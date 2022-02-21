import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import { VError } from 'verror';
import { PrismaClient, Vault as VaultDb } from '@prisma/client';
import { ImportAccountCommand, AccountDto, Vault } from '@abcpros/givegift-models';
import { Account as AccountDb, Prisma } from '@prisma/client';
import { aesGcmDecrypt, aesGcmEncrypt, hashMnemonic } from '../../utils/encryptionMethods';
import { WalletService } from '../../services/wallet';
import { Container } from 'typedi';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/import', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const importAccountCommand: ImportAccountCommand = req.body;
  const { mnemonic, mnemonicHash } = importAccountCommand;

  try {
    if (!mnemonicHash) {
      const walletService: WalletService = Container.get(WalletService);
      // Validate mnemonic
      let isValidMnemonic = await walletService.validateMnemonic(mnemonic);
      if (!isValidMnemonic) {
        throw Error('The mnemonic is not valid');
      }

      // Hash mnemonic
      const mnemonicHash = await hashMnemonic(mnemonic);

      // encrypt mnemonic
      let encryptedMnemonic = await aesGcmEncrypt(mnemonic, mnemonic);

      // Check Mnemonic Hash is existed in database
      const account = await prisma.account.findFirst({
        where: {
          mnemonicHash: mnemonicHash
        }
      });
      if (!account) {
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
      }
      else {
        const resultApi: AccountDto = {
          ...account,
          mnemonic: mnemonic,
          name: account.name,
          address: account.address
        };
  
        res.json(resultApi);
      }

    }
    else {
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
    }

  } catch (error) {
    return res.status(400).json({
      error: `Could not import the account.`
    });
  }
});

router.get('/:id/vaults', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const accountId = _.toSafeInteger(id);

  try {
    const vaults: VaultDb[] = await prisma.vault.findMany({
      where: {
        accountId: accountId
      },
      include: {
        envelope: true
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
      } as unknown as Vault;
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