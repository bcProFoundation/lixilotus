import express from 'express';
import { PrismaClient } from '@prisma/client';
import { RedeemApi } from '@abcpros/givegift-models/src/lib/redeem'
import { aesGcmDecrypt } from '../utils/encryptionMethods';
import Container from 'typedi';

const prisma = new PrismaClient();
let router = express.Router();

router.post('/redeems', async (req: express.Request, res: express.Response) => {
  const redeemApi: RedeemApi = req.body;
  if (redeemApi) {
    try {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
      const redeemCode = redeemApi.redeemCode;
      const password = redeemCode.slice(0, 8);
      const encodedVaultId = redeemCode.slice(8);
      const vaultId = parseInt(encodedVaultId);

      const existedRedeems = await prisma.redeem.findMany({
        where: {
          OR: [
            { ipaddress: ip },
            { redeemAddress: redeemApi.redeemAddress }
          ],
          AND: {
            vaultId: vaultId
          }
        }
      });

      if (existedRedeems.length > 0) {
        return res.status(500).json({
          error: 'You have already redeemed this offer'
        });
      }

      const vault = await prisma.vault.findUnique({
        where: {
          id: vaultId
        }
      });

      if (!vault) {
        return res.status(500).json({
          error: 'Invalid vault'
        });
      }

      const seed = await aesGcmDecrypt(vault.encryptedMnemonic, password);

      const createdReem = await prisma.redeem.create({
        data: {
          ...redeemApi,
          ipaddress: ip,
          vaultId: vault.id,
          transactionId: ''
        }
      });

      // const walletService = Container.get('wallet.service');
      // console.log(walletService);

      res.json({});

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error: `Could not redeem.`
      });
    }

  }

})

export { router };