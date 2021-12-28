import express, { NextFunction } from 'express';
import VError from 'verror';
import { PrismaClient, Vault as VaultDb } from '@prisma/client';
import { CreateVaultDto, VaultDto } from '@abcpros/givegift-models';
import { router as vaultChildRouter } from './vault';
import { logger } from '../../logger';
import { aesGcmDecrypt, aesGcmEncrypt } from '../../utils/encryptionMethods';
import Container from 'typedi';
import { WalletService } from 'src/lib/services/wallet';
import { orderBy } from 'lodash';

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
      totalRedeem: Number(vault.totalRedeem),
      encryptedPubKey: String(vault.encryptedPubKey),
      encryptedPrivKey: String(vault.encryptedPrivKey)
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

  // Add mnemonic and required field to CreateVaultDto
  const vaultApi: CreateVaultDto = req.body;
  if (vaultApi) {
    try {
      const mnemonicFromApi = vaultApi.mnemonic;
      const encryptedMnemonicFromApi = await aesGcmEncrypt(mnemonicFromApi, mnemonicFromApi);

      const account = await prisma.account.findFirst({
        where: {
          encryptedMnemonic: encryptedMnemonicFromApi
        }
      });

      if (!account) {
        return res.status(400).json({
          message: 'Could not find the associated account.'
        });
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
      let vaultIndex = 0;
      if (latestVault) {
        vaultIndex = latestVault.derivationIndex + 1;
        const walletService: WalletService = Container.get('WalletService');
        const walletDetail = await walletService.getWalletDetails(mnemonicFromApi, vaultIndex);
        return res.json({walletDetail});
      }


      // const vaultToInsert: VaultDb = {
      //   ...vaultApi,
      // };

      // if (!vaultToInsert.memnonic) {
      //   return res.status(400).json({
      //     message: 'The payload should be provided encrypted mnemonic'
      //   });
      // }
      // else {

      //   // else {
      //     const createdVault = await prisma.vault.create({ data: vaultToInsert });

      //     const resultApi: VaultDto = {
      //       ...createdVault,
      //       totalRedeem: Number(createdVault.totalRedeem)
      //     };
      //     res.json(resultApi);
      //   // }   
      
      //}
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

// router.delete('/vaults/:id', async (req: express.Request, res: express.Response, next: NextFunction) => {
//   const { id } = req.params;
//   const vaultId = parseInt(id);
//   try {
//     const vault = await prisma.vault.findUnique({
//       where: {
//         id: vaultId
//       }
//     });

//     if (!vault) {
//       return res.status(400).json({
//         totalRedeem: Number(vault.totalRedeem),
//       });

//     }
//     else {
//       const vault = await prisma.vault.delete({
//         where: {
//           id: vaultId
//         }
//       });
//       if (vault) {
//         return res.status(200).json({
//           message: 'The vault has been deleted sucessfully.'
//         });
//       }
//     }
//   } catch (err) {
//     if (err instanceof VError) {
//       return next(err);
//     } else {
//       const error = new VError.WError(err as Error, 'Could not delete the vault.');
//       logger.error(err);
//       return next(error);
//     }
//   }
// });

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