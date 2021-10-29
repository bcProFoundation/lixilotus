import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ImportVaultDto, VaultDto } from '@abcpros/givegift-models/src/lib/vault'
import { aesGcmDecrypt, aesGcmEncrypt, base62ToNumber } from '../utils/encryptionMethods';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/vaults/:id/', async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  try {
    const vault = await prisma.vault.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    return res.json(vault);
  } catch (error) {
    return res.status(400).json({
      error: `Vault with Id ${id} does not exist in the database.`
    });
  }
});

router.post('/vaults', async (req: express.Request, res: express.Response) => {
  const vaultApi: VaultDto = req.body;
  if (vaultApi) {
    try {
      const vaultToInsert = {
        ...vaultApi,
      };
      const createdVault = await prisma.vault.create({ data: vaultToInsert });

      const resultApi: VaultDto = {
        ...createdVault,
        totalRedeem: Number(createdVault.totalRedeem)
      };

      res.json(resultApi);
    } catch (error) {
      return res.status(400).json({
        error: `Could not insert vault to the database.`
      });
    }
  }

});

router.use('/vaults', express.Router().post('/import', async (req: express.Request, res: express.Response) => {
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
}))

export { router };