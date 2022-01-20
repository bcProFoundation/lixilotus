import express, { NextFunction } from 'express';
import Container from 'typedi';
import config from 'config';
import { PrismaClient } from '@prisma/client';
import BigNumber from 'bignumber.js';
import VError from 'verror';
import _ from 'lodash';
import moment from 'moment';
import BCHJS from '@abcpros/xpi-js';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import { CreateRedeemDto, fromSmallestDenomination, RedeemDto, ViewRedeemDto, VaultType } from '@abcpros/givegift-models'
import { toSmallestDenomination } from '@abcpros/givegift-models';
import { countries } from '@abcpros/givegift-models';
import { aesGcmDecrypt, base62ToNumber } from '../../utils/encryptionMethods';
import SlpWallet from '@abcpros/minimal-xpi-slp-wallet';
import logger from '../../logger';
import axios from 'axios';
import geoip from 'geoip-country';

const xpiRestUrl = config.has('xpiRestUrl') ? config.get('xpiRestUrl') : 'https://api.sendlotus.com/v4/';

const PRIVATE_KEY = 'AIzaSyCFY2D4NRLjDTpJfk0jjJNADalSceqC4qs';
const SITE_KEY = "6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb";
const PROJECT_ID = 'lixilotus';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

prisma.$on('query', (e) => {
  logger.info('Query: ' + e.query);
  logger.info('Duration: ' + e.duration + 'ms');
});

prisma.$on('error', (e) => {
  logger.error('Error: ' + e.message);
});

prisma.$on('warn', (e) => {
  logger.warn('Warn: ' + e.message);
});

let router = express.Router();

router.get('/redeems/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {

  const { id } = req.params;
  try {
    const redeem = await prisma.redeem.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        vault: {
          include: {
            envelope: true
          }
        }
      }
    });
    if (!redeem) throw new VError('The redeem does not exist in the database.');

    let result: ViewRedeemDto = {
      id: redeem.id,
      vaultId: redeem.vaultId,
      image: redeem.vault.envelope?.image ?? '',
      thumbnail: redeem.vault.envelope?.thumbnail ?? '',
      amount: Number(redeem.amount),
      message: redeem.vault.envelopeMessage
    };
    return res.json(result);
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get the redeem.');
      return next(error);
    }
  }
});

router.post('/redeems', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const redeemApi: CreateRedeemDto = req.body;

  const captchaResBody = {
    event: {
      token: redeemApi.captchaToken,
      siteKey: SITE_KEY,
      expectedAction: "Redeem"
    }
  };

  const checkingCaptcha = async () => {
    try {
      const response = await axios.post<any>(
        `https://recaptchaenterprise.googleapis.com/v1beta1/projects/${PROJECT_ID}/assessments?key=${PRIVATE_KEY}`,
        captchaResBody
      );

      logger.info(`Recaptcha: Score: ${response.data.score} | Reasons: ${response.data.reasons}`);

      // Extract result from the API response
      if (response.status !== 200 || response.data.score <= 0.5) {
        throw new VError('Incorrect capcha? Please redeem again!');
      }
    } catch (err) {
      next(err);
    }
  };

  if (redeemApi) {
    try {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

      const redeemCode = _.trim(redeemApi.redeemCode);
      const password = redeemCode.slice(0, 8);
      const encodedVaultId = redeemCode.slice(8);
      const vaultId = base62ToNumber(encodedVaultId);
      const address = _.trim(redeemApi.redeemAddress);

      const countRedeemAddress = await prisma.redeem.findMany({
        where: {
          AND: [
            { redeemAddress: address },
            { vaultId: vaultId }
          ]
        }
      });

      const countIpaddress = await prisma.redeem.count({
        where: {
          AND: [
            { ipaddress: ip },
            { vaultId: vaultId }
          ]
        }
      });

      const vault = await prisma.vault.findUnique({
        where: {
          id: vaultId
        }
      });


      // isFamilyFriendly == true
      if (vault?.isFamilyFriendly) {
        if (countRedeemAddress.length > 0 || countIpaddress >= 5) {
          throw new VError('You have reached the limit of redemptions for this code.');
        }
      }
      // isFamilyFriendly == false
      else {
        if (countRedeemAddress.length > 0 || countIpaddress > 0) {
          throw new VError('You have reached the limit of redemptions for this code.');
        }
      }

      if (process.env.NODE_ENV !== 'development') {
        await checkingCaptcha();
        const geolocation = geoip.lookup(ip);
        const country = countries.find(country => country.id === vault?.country)

        if (geolocation?.country != _.upperCase(country?.id) && !_.isNil(country?.id)) {
          throw new VError('You cannot redeem from outside the ' + country?.name + ' zone.');
        }
      }

      if (!vault) {
        throw new VError('Unable to redeem because the vault is invalid');
      }

      const vaultStatus = vault?.status;
      if (vaultStatus === 'locked') {
        throw new VError('Unable to redeem because the vault is locked');
      }

      const xPriv = await aesGcmDecrypt(vault.encryptedXPriv, password);

      const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
      const XPI: BCHJS = Container.get('xpijs');

      // Generate the HD wallet.
      const childNode = XPI.HDNode.fromXPriv(xPriv);
      const vaultAddress: string = XPI.HDNode.toXAddress(childNode);
      const keyPair = XPI.HDNode.toKeyPair(childNode);
      const balance = await xpiWallet.getBalance(vaultAddress);

      if (balance === 0) {
        throw new VError('Insufficient fund.');
      }

      if ((vault.maxRedeem != 0 && vault.redeemedNum == vault.maxRedeem) || moment().isAfter(vault.expiryAt)) {
        throw new VError('The program has ended.');
      }

      let satoshisToSend;
      if (vault.vaultType == VaultType.Random) {
        const xpiBalance = fromSmallestDenomination(balance);
        const maxXpiValue = xpiBalance < vault.maxValue ? xpiBalance : vault.maxValue;
        const maxSatoshis = toSmallestDenomination(new BigNumber(maxXpiValue));
        const minSatoshis = toSmallestDenomination(new BigNumber(vault.minValue));
        satoshisToSend = maxSatoshis.minus(minSatoshis).times(new BigNumber(Math.random())).plus(minSatoshis);
      } else if (vault.vaultType == VaultType.Fixed) {
        satoshisToSend = toSmallestDenomination(new BigNumber(vault.fixedValue));
      } else {
        // The payout unit is satoshi
        const payout = balance / vault.dividedValue;
        satoshisToSend = new BigNumber(payout);
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
            totalRedeem: vault.totalRedeem + BigInt(amountSats),
            redeemedNum: vault.redeemedNum + 1
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