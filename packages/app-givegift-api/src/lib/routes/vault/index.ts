import express, { NextFunction } from 'express';
import VError from 'verror';
import { PrismaClient } from '@prisma/client';
import { VaultDto } from '@abcpros/givegift-models';
import { router as vaultChildRouter } from './vault';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/vaults/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
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
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get vault.');
      return next(error);
    }
  }
});

router.post('/vaults', async (req: express.Request, res: express.Response, next: NextFunction) => {
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
      if (err instanceof VError) {
        return next(err);
      } else {
        const error = new VError.WError(err as Error, 'Unable to create new vault.');
        return next(error);
      }
    }
  }

});

router.use('/vaults', vaultChildRouter);

export { router };