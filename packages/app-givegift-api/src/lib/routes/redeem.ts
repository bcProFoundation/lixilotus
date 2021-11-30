import express, { NextFunction } from 'express';
import config from 'config';
import { PrismaClient } from '@prisma/client';
import BigNumber from 'bignumber.js';
import VError from 'verror';
import _ from 'lodash';
import BCHJS from '@abcpros/xpi-js';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import { CreateRedeemDto, RedeemDto } from '@abcpros/givegift-models'
import { toSmallestDenomination } from '@abcpros/givegift-models';
import { aesGcmDecrypt, base62ToNumber } from '../utils/encryptionMethods';
const xpiRestUrl = config.has('xpiRestUrl') ? config.get('xpiRestUrl') : 'https://api.sendlotus.com/v4/';
import SlpWallet from '@abcpros/minimal-xpi-slp-wallet';
import logger from '../logger';
import axios from 'axios';



const prisma = new PrismaClient();
let router = express.Router();
let PRIVATE_KEY = '6LdLk2odAAAAAOkH6S0iSoC6d_Zr0WvHEQ-kkYqa';

router.post('/redeems', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const redeemApi: CreateRedeemDto = req.body;

  const response = await axios.post<any>(
    `https://www.google.com/recaptcha/api/siteverify?secret=${PRIVATE_KEY}&response=${redeemApi.captchaToken}`
  );
  
  // Extract result from the API response
  if(!response.data.success) {
    const error = new VError.WError('Incorrect capcha? Please redeem again!');
    return next(error);
  }

  if (redeemApi) {
    try {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
      const redeemCode = _.trim(redeemApi.redeemCode);
      const password = redeemCode.slice(0, 8);
      const encodedVaultId = redeemCode.slice(8);
      const vaultId = base62ToNumber(encodedVaultId);
      const address = _.trim(redeemApi.redeemAddress);

      const existedRedeems = await prisma.redeem.findMany({
        where: {
          OR: [
            { ipaddress: ip },
            { redeemAddress: address }
          ],
          AND: {
            vaultId: vaultId
          }
        }
      });

      if (existedRedeems.length > 0) {
        throw new VError('You have already redeemed this offer');
      }

      const vault = await prisma.vault.findUnique({
        where: {
          id: vaultId
        }
      });

      if (!vault) {
        throw new VError('Unable to redeem because the vault is invalid');
      }

      const mnemonic = await aesGcmDecrypt(vault.encryptedMnemonic, password);

      const hdPath = "m/44'/10605'/0'/0/0";
      const xpiWallet: MinimalBCHWallet = new SlpWallet(mnemonic, {
        restURL: xpiRestUrl,
        hdPath
      });
      const XPI: BCHJS = xpiWallet.bchjs;

      // Generate the HD wallet.
      const rootSeedBuffer = await XPI.Mnemonic.toSeed(mnemonic);
      const masterHDNode = XPI.HDNode.fromSeed(rootSeedBuffer);
      const childNode = masterHDNode.derivePath(hdPath);
      const vaultAddress: string = XPI.HDNode.toXAddress(childNode);
      const keyPair = XPI.HDNode.toKeyPair(childNode);
      const balance = await xpiWallet.getBalance(vaultAddress);

      if (balance === 0) {
        throw new VError('Insufficient fund.');
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

      const utxos = await XPI.Utxo.get(vaultAddress);
      const utxoStore = utxos[0];

      if (!utxoStore || !(utxoStore as any).bchUtxos || !(utxoStore as any).bchUtxos) {
        throw new VError('UTXO list is empty');
      }

      // Determine the UTXOs needed to be spent for this TX, and the change
      // that will be returned to the wallet.
      const { necessaryUtxos, change } = xpiWallet.sendBch.getNecessaryUtxosAndChange(
        outputs,
        (utxoStore as any).bchUtxos,
        1.0
      );

      // Create an instance of the Transaction Builder.
      const transactionBuilder: any = new XPI.TransactionBuilder();

      // Add inputs
      necessaryUtxos.forEach((utxo: any) => {
        transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos)
      });

      // Add outputs
      outputs.forEach(receiver => {
        transactionBuilder.addOutput(receiver.address, receiver.amountSat);
      });

      if (change && change > 546) {
        transactionBuilder.addOutput(vaultAddress, change);
      }

      // Sign each UTXO that is about to be spent.
      necessaryUtxos.forEach((utxo, i) => {
        let redeemScript

        transactionBuilder.sign(
          i,
          keyPair,
          redeemScript,
          transactionBuilder.hashTypes.SIGHASH_ALL,
          utxo.value
        )
      });

      const tx = transactionBuilder.build();
      const hex = tx.toHex();

      try {

        // Broadcast the transaction to the network.
        const txid = await XPI.RawTransactions.sendRawTransaction(hex);
        // const txid = await xpiWallet.send(outputs);

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
      if (err instanceof VError) {
        return next(err);
      } else {
        logger.error(err);
        const error = new VError.WError(err as Error, 'Unable to redeem.');
        return next(error);
      }
    }
  }
})

export { router };