import express, { NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ImportVaultDto, VaultDto } from '@abcpros/givegift-models/src/lib/vault'
import { aesGcmDecrypt, base62ToNumber } from '../../utils/encryptionMethods';
import { Redeem } from '@abcpros/givegift-models/src/lib/redeem';
import { VError } from 'verror';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/import', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const importVaultDto: ImportVaultDto = req.body;

  try {
    const redeemCode = importVaultDto.redeemCode;
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

    const mnemonic = await aesGcmDecrypt(vault.encryptedMnemonic, password);

    if (mnemonic !== importVaultDto.mnemonic) {
      throw Error('Invalid redeem code. Please try again.');
    }

    const resultApi: VaultDto = {
      ...vault,
      totalRedeem: Number(vault.totalRedeem)
    };

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