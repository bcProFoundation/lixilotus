import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import VError from 'verror';
import { PrismaClient, Vault as VaultDb } from '@prisma/client';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import { Account, CreateVaultCommand, Vault, VaultDto } from '@abcpros/givegift-models';
import { router as vaultChildRouter } from './vault';
import { logger } from '../../logger';
import { aesGcmDecrypt, aesGcmEncrypt, numberToBase62 } from '../../utils/encryptionMethods';
import Container from 'typedi';
import { WalletService } from '../../services/wallet';
import BCHJS from '@abcpros/xpi-js';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/vaults/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const vault = await prisma.vault.findUnique({
      where: {
        id: _.toSafeInteger(id)
      },
      include: {
        envelope: true
      }
    });
    if (!vault) throw new VError('The vault does not exist in the database.');

    const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
    const balance: number = await xpiWallet.getBalance(vault.address);
    let result = {
      ...vault,
      balance: balance,
      totalRedeem: Number(vault.totalRedeem),
      envelope: vault.envelope
    } as VaultDto;
    result = _.omit(result, 'encryptedXPriv');
    return res.json(result);
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get vault.');
      return next(error);
    }
  }
});

router.post('/vaults', async (req: express.Request, res: express.Response, next: NextFunction) => {

  // Add mnemonic and required field to CreateVaultCommand
  const command: CreateVaultCommand = req.body;
  if (command) {
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await prisma.account.findFirst({
        where: {
          id: command.accountId,
          mnemonicHash: command.mnemonicHash
        },
      });

      if (!account) {
        throw new Error('Could not find the associated account.');
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        throw Error('Could not create vault because the account is invalid.');
      }

      // find the latest vault created
      const latestVault: VaultDb | null = await prisma.vault.findFirst({
        where: {
          accountId: account.id,
        },
        orderBy: {
          id: 'desc'
        }
      });

      // Find the latest derivation index:
      let vaultIndex = 1;
      if (latestVault) {
        vaultIndex = latestVault.derivationIndex + 1;
      }

      const walletService: WalletService = Container.get(WalletService);
      const { address, xpriv } = await walletService.deriveAddress(mnemonicFromApi, vaultIndex);
      const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
      const encryptedRedeemCode = await aesGcmEncrypt(command.password, command.mnemonic);

      const data = {
        ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password']),
        id: undefined,
        derivationIndex: vaultIndex,
        encryptedRedeemCode: encryptedRedeemCode,
        redeemedNum: 0,
        encryptedXPriv,
        status: 'active',
        expiryTime: null,
        address,
        totalRedeem: BigInt(0),
        envelopeId: command.envelopeId ?? null,
        envelopeMessage: ''
      };
      const vaultToInsert = _.omit(data, 'password');
      const createdVault: VaultDb = await prisma.vault.create({ data: vaultToInsert });

      const { keyPair } = await walletService.getWalletDetails(command.mnemonic, 0)
      const amount: any = await walletService.sendAmount(account.address, createdVault.address, command.amount, keyPair)

      let resultApi = _.omit({
        ...createdVault,
        balance: amount ?? 0,
        totalRedeem: Number(createdVault.totalRedeem),
        expiryAt: createdVault.expiryAt ? createdVault.expiryAt : undefined,
        country: createdVault.country ? createdVault.country : undefined,
      }, 'encryptedXPriv');

      res.json(resultApi);
    } catch (err) {
      if (err instanceof VError) {
        return next(err);
      } else {
        const error = new VError.WError(err as Error, 'Unable to create new vault.');
        logger.error(err);
        return next(error);
      }
    }
  }

});


router.post('/vaults/:id/lock', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = _.toSafeInteger(id);

  const command: Account = req.body
  try {
    const mnemonicFromApi = command.mnemonic;

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: command.mnemonicHash
      }
    });

    if (!account) {
      throw new Error('Could not find the associated account.');
    }

    // Decrypt to validate the mnemonic
    const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
    if (mnemonicFromApi !== mnemonicToValidate) {
      throw Error('Could not find the associated account.');
    }

    const vault = await prisma.vault.findFirst({
      where: {
        id: vaultId,
        accountId: account.id
      }
    });
    if (!vault) {
      throw new Error('Could not found the vault in the database.');
    }
    else {
      const vault = await prisma.vault.update({
        where: {
          id: vaultId
        },
        data: {
          status: 'locked'
        }
      });
      if (vault) {
        let resultApi: VaultDto = {
          ...vault,
          balance: 0,
          totalRedeem: Number(vault.totalRedeem),
          expiryAt: vault.expiryAt ? vault.expiryAt : undefined,
          country: vault.country ? vault.country : undefined,
          status: vault.status
        };

        res.json(resultApi);
      }
    }

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not locked the vault.');
      return next(error);
    }
  }
});

router.post('/vaults/:id/unlock', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = _.toSafeInteger(id);

  const command: Account = req.body
  try {
    const mnemonicFromApi = command.mnemonic;

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: command.mnemonicHash
      }
    });

    if (!account) {
      throw new Error('Could not find the associated account.');
    }

    // Decrypt to validate the mnemonic
    const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
    if (mnemonicFromApi !== mnemonicToValidate) {
      throw Error('Could not find the associated account.');
    }

    const vault = await prisma.vault.findFirst({
      where: {
        id: vaultId,
        accountId: account.id
      }
    });
    if (!vault) {
      throw new Error('Could not found the vault in the database.');
    }
    else {
      const vault = await prisma.vault.update({
        where: {
          id: vaultId
        },
        data: {
          status: 'active'
        }
      });
      if (vault) {
        let resultApi: VaultDto = {
          ...vault,
          balance: 0,
          totalRedeem: Number(vault.totalRedeem),
          expiryAt: vault.expiryAt ? vault.expiryAt : undefined,
          country: vault.country ? vault.country : undefined,
          status: vault.status
        };

        res.json(resultApi);
      }
    }

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not actived the vault.');
      return next(error);
    }
  }
});

router.use('/vaults', vaultChildRouter);

export { router };
