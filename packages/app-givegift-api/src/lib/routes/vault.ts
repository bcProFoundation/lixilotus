import express from 'express';
import { PrismaClient } from '@prisma/client';
import { VaultApi } from '@abcpros/givegift-models/src/lib/vault'

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
  const vaultApi: VaultApi = req.body;
  if (vaultApi) {
    try {
      const vaultToInsert = {
        ...vaultApi,
      };
      const createdVault = await prisma.vault.create({ data: vaultToInsert });

      const resultApi: VaultApi = {
        ...createdVault,
      };

      res.json(resultApi);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: `Could not insert vault to the database.`
      });
    }

  }

})

export { router };