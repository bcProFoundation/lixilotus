import express from 'express';
import Container from 'typedi';
import { PrismaClient } from '@prisma/client';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import { RedeemApi } from '@abcpros/givegift-models/src/lib/redeem'
import { toSmallestDenomination } from '@abcpros/givegift-models/src/utils/cashMethods';
import { aesGcmDecrypt, base62ToNumber } from '../utils/encryptionMethods';

import { WalletService } from '../services/wallet';
import BigNumber from 'bignumber.js';
import logger from '../logger';


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
      const vaultId = base62ToNumber(encodedVaultId);

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
          error: 'Invalid vault.'
        });
      }

      const mnemonic = await aesGcmDecrypt(vault.encryptedMnemonic, password);

      const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
      await xpiWallet.create(mnemonic);
      if (!xpiWallet.walletInfoCreated) {
        throw new Error('Could not create the vault wallet');
      }
      const vaultAddress: string = (xpiWallet as any).walletInfo.address;
      const balance = await xpiWallet.getBalance(vaultAddress);

      if (balance === 0) {
        throw new Error('insufficient fund.');
      }

      let satoshisToSend;
      if (vault.isRandomGive) {
        const maxSatoshis = toSmallestDenomination(new BigNumber(vault.maxValue));
        const minSatoshis = toSmallestDenomination(new BigNumber(vault.minValue));
        satoshisToSend = maxSatoshis.minus(minSatoshis).times(new BigNumber(Math.random())).plus(minSatoshis);
      } else {
        satoshisToSend = toSmallestDenomination(new BigNumber(vault.defaultValue));
      }

      const satoshisBalance = new BigNumber(balance);

      if (satoshisToSend.lt(546) && satoshisToSend.gte(satoshisBalance)) {
        throw new Error('Insufficient fund.');
      }

      const outputs = [{
        address: redeemApi.redeemAddress,
        amountSat: Math.floor(satoshisToSend.toNumber())
      }];

      try {
        const txid = await xpiWallet.send(outputs);

        const createdReem = await prisma.redeem.create({
          data: {
            ipaddress: ip,
            vaultId: vault.id,
            transactionId: txid,
            redeemAddress: redeemApi.redeemAddress
          }
        });

        return res.json(createdReem);
      } catch (err) {
        logger.error((err as any).toString());
        throw new Error('Unable to send transaction')
      }
    } catch (error) {
      return res.status(400).json(new Error('Unable to redeem.'));
    }

  }

})

export { router };