import express from 'express';
import { PrismaClient } from '@prisma/client';
import { VaultDto } from '@abcpros/givegift-models/src/lib/vault'
import { router as vaultChildRouter } from './vault';

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
    const result = {
      ...vault,
      totalRedeem: Number(vault?.totalRedeem)
    } as VaultDto;
    return res.json(result);
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

router.use('/vaults', vaultChildRouter);

export { router };