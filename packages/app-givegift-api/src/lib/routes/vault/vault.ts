import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import Container from 'typedi';
import { PrismaClient } from '@prisma/client';
import { ImportVaultCommand, VaultDto } from '@abcpros/givegift-models'
import { aesGcmDecrypt, base62ToNumber, hexSha256 } from '../../utils/encryptionMethods';
import { Redeem } from '@abcpros/givegift-models';
import { VError } from 'verror';
import { WalletService } from '../../services/wallet';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/import', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const ImportVaultCommand: ImportVaultCommand = req.body;

  try {
    const { mnemonic, redeemCode } = ImportVaultCommand;
    const mnemonicHash = await hexSha256(mnemonic);

    // Find the associated account
    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: mnemonicHash
      }
    });

    if (!account) {
      throw new Error('Could not find the associated account. Please check your mnemonic seed.');
    }

    const password = redeemCode.slice(0, 8);
    const encodedVaultId = redeemCode.slice(8);
    const vaultId = base62ToNumber(encodedVaultId);
    const vault = await prisma.vault.findUnique({
      where: {
        id: vaultId
      }
    });

    if (!vault) {
      throw Error('Could not found a vault match your import.');
    }

    // Check if the redeem code is valid
    // by decrypt the xpriv and compare with the xpriv which is derive from the seed
    const derivationIndex = vault.derivationIndex;
    const encryptedXPriv = vault.encryptedXPriv;
    const xPrivFromRedeemCode = await aesGcmDecrypt(encryptedXPriv, password);

    const walletService: WalletService = Container.get(WalletService);
    const { xpriv } = await walletService.deriveVault(mnemonic, derivationIndex);

    if (xpriv !== xPrivFromRedeemCode) {
      throw Error('Invalid redeem code. Please try again.');
    }

    let resultApi: VaultDto = {
      ...vault,
      totalRedeem: Number(vault.totalRedeem),
      expiryAt: vault.expiryAt ? vault.expiryAt : undefined,
      country: vault.country ? vault.country : undefined
    };
    resultApi = _.omit(resultApi, 'encryptedXPriv');

    res.json(resultApi);

  } catch (error) {
    return res.status(400).json({
      error: `Could not import the vault.`
    });
  }
});

router.get('/:id/redeems', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = parseInt(id);

  try {
    const redeems = await prisma.redeem.findMany({
      where: {
        vaultId: vaultId
      }
    });

    const results = redeems.map(item => {
      return {
        ...item,
        amount: Number(item.amount)
      } as Redeem;
    });

    res.json(results ?? []);

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get redeem list of the vault.');
      return next(error);
    }
  }
});

export { router };