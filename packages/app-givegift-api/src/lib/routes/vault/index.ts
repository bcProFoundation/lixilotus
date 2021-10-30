import express from 'express';
import VError from 'verror';
import { PrismaClient } from '@prisma/client';
import { VaultDto } from '@abcpros/givegift-models/src/lib/vault'
import { router as vaultChildRouter } from './vault';
import logger from '../../logger';

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
    if (!vault) throw new VError('The vault does not exist in the database.');
    const result = {
      ...vault,
      totalRedeem: Number(vault?.totalRedeem)
    } as VaultDto;
    return res.json(result);
  } catch (err: unknown) {
    let error: VError;
    if (err instanceof VError) {
      error = err;
    } else {
      error = new VError.WError(err as Error, 'The vault does not exist.');
    }
    logger.error(error.message);
    return res.status(400).json(error);
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
    } catch (err) {
      const error = new VError.WError(err as Error, 'Could not create the vault.');
      logger.error(error.message);
      return res.status(400).json(error);
    }
  }

});

router.use('/vaults', vaultChildRouter);

export { router };