import express from 'express';
import Container from 'typedi';
import { PrismaClient } from '@prisma/client';
import VError from 'verror';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import { CreateRedeemDto, RedeemDto } from '@abcpros/givegift-models/src/lib/redeem'
import { toSmallestDenomination } from '@abcpros/givegift-models/src/utils/cashMethods';
import { aesGcmDecrypt, base62ToNumber } from '../utils/encryptionMethods';

import BigNumber from 'bignumber.js';
import logger from '../logger';


const prisma = new PrismaClient();
let router = express.Router();

router.post('/redeems', async (req: express.Request, res: express.Response) => {
  const redeemApi: CreateRedeemDto = req.body;
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
        const error = new VError('You have already redeemed this offer');
        return res.status(500).json(error.message);
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
        throw new VError('Could not create the vault wallet');
      }
      const vaultAddress: string = (xpiWallet as any).walletInfo.address;
      const balance = await xpiWallet.getBalance(vaultAddress);

      if (balance === 0) {
        throw new VError('insufficient fund.');
      }

      let satoshisToSend;
      if (vault.isRandomGive) {
        const maxSatoshis = toSmallestDenomination(new BigNumber(vault.maxValue));
        const minSatoshis = toSmallestDenomination(new BigNumber(vault.minValue));
        satoshisToSend = maxSatoshis.minus(minSatoshis).times(new BigNumber(Math.random())).plus(minSatoshis);
      } else {
        satoshisToSend = toSmallestDenomination(new BigNumber(vault.fixedValue));
      }

      const satoshisBalance = new BigNumber(balance);

      if (satoshisToSend.lt(546) && satoshisToSend.gte(satoshisBalance)) {
        throw new VError('Insufficient fund.');
      }

      const amountSats = Math.floor(satoshisToSend.toNumber());
      const outputs = [{
        address: redeemApi.redeemAddress,
        amountSat: amountSats
      }];

      try {
        const txid = await xpiWallet.send(outputs);

        const createRedeemOperation = prisma.redeem.create({
          data: {
            ipaddress: ip,
            vaultId: vault.id,
            transactionId: txid,
            redeemAddress: redeemApi.redeemAddress,
            amount: amountSats
          }
        });

        const updateVaultOperation = prisma.vault.update({
          where: { id: vault.id },
          data: {
            totalRedeem: vault.totalRedeem + BigInt(amountSats)
          }
        });

        const result = await prisma.$transaction([createRedeemOperation, updateVaultOperation]);

        const redeemResult = {
          ...result[0],
          redeemCode: redeemApi.redeemCode,
          amount: Number(result[0].amount)
        } as RedeemDto;
        res.json(redeemResult);
      } catch (err) {
        throw new VError(err as Error, 'Unable to send transaction');
      }
    } catch (err) {
      let error: VError;
      if (err instanceof VError) {
        error = err;
      } else {
        error = new VError.WError(err as Error, 'Unable to redeem.');
      }
      logger.error(error.message);
      return res.status(400).json(error);
    }
  }
})

export { router };