import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import { VError } from 'verror';
import { PrismaClient, Vault as VaultDb } from '@prisma/client';
import { ImportAccountCommand, AccountDto, Vault } from '@abcpros/givegift-models';
import { Account as AccountDb, Prisma } from '@prisma/client';
import { aesGcmDecrypt, aesGcmEncrypt, hashMnemonic } from '../../utils/encryptionMethods';
import { WalletService } from '../../services/wallet';
import { Container } from 'typedi';
import BCHJS from "@abcpros/xpi-js";

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
    }
    else {
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
  const xpijs: BCHJS = Container.get('xpijs');

  try {
    const vaults: VaultDb[] = await prisma.vault.findMany({
      where: {
        accountId: accountId
      },
      include: {
        envelope: true
      }
    });

    const totalBalances = await xpijs.Electrumx.balance(vaults.map(v => v.address));
    const {balances} = totalBalances;
  
    const results = vaults.map((item,index) => {
      return {
        ...item,
        totalRedeem: Number(item.totalRedeem),
        vaultType: Number(item.vaultType),
        maxRedeem: Number(item.maxRedeem),
        redeemedNum: Number(item.redeemedNum),
        dividedValue: Number(item.dividedValue),
        balance: Number(balances[index].balance.confirmed) + Number(balances[index].balance.unconfirmed),
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