import express, { NextFunction } from 'express';
import VError from 'verror';
import { PrismaClient } from '@prisma/client';
import { VaultDto } from '@abcpros/givegift-models';
import { router as vaultChildRouter } from './vault';
import { logger } from '../../logger';

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

// router.post('/vaults', async (req: express.Request, res: express.Response, next: NextFunction) => {
//   const vaultApi: VaultDto = req.body;
//   if (vaultApi) {
//     try {
//       const vaultToInsert = {
//         ...vaultApi,
//       };
//       const createdVault = await prisma.vault.create({ data: vaultToInsert });

//       const resultApi: VaultDto = {
//         ...createdVault,
//         totalRedeem: Number(createdVault.totalRedeem)
//       };

//       res.json(resultApi);
//     } catch (err) {
//       if (err instanceof VError) {
//         return next(err);
//       } else {
//         const error = new VError.WError(err as Error, 'Unable to create new vault.');
//         return next(error);
//       }
//     }
//   }

// });

router.delete('/vaults/:id', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = parseInt(id);
  try {
    const vault = await prisma.vault.findUnique({
      where: {
        id: vaultId
      }
    });

    if (!vault) {
      return res.status(400).json({
        error: 'Could not found the vault in the database.'
      });

    }
    else {
      const vault = await prisma.vault.delete({
        where: {
          id: vaultId
        }
      });
      if (vault) {
        return res.status(200).json({
          message: 'The vault has been deleted sucessfully.'
        });
      }
    }
  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not delete the vault.');
      return next(error);
    }
  }
});

router.post('/vaults/:id/lock', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = parseInt(id);

  try {
    const vault = await prisma.vault.findUnique({
      where: {
        id: vaultId
      }
    });
    if (!vault) {
      return res.status(400).json({
        error: 'Could not found the vault in the database.'
      });

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
        return res.status(200).json({
          message: 'The vault has been locked sucessfully.'
        });
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

router.post('/vaults/:id/active', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const vaultId = parseInt(id);

  try {
    const vault = await prisma.vault.findUnique({
      where: {
        id: vaultId
      }
    });
    if (!vault) {
      return res.status(400).json({
        error: 'Could not found the vault in the database.'
      });

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
        return res.status(200).json({
          message: 'The vault has been actived sucessfully.'
        });
      }
    }
  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not active the vault.');
      return next(error);
    }
  }
});

router.use('/vaults', vaultChildRouter);

export { router };