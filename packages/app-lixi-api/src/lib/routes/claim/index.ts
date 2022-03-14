import axios from 'axios';
import BigNumber from 'bignumber.js';
import config from 'config';
import express, { NextFunction } from 'express';
import geoip from 'geoip-country';
import _ from 'lodash';
import moment from 'moment';
import Container from 'typedi';
import VError from 'verror';

import {
  countries, CreateClaimDto, fromSmallestDenomination, ClaimDto, toSmallestDenomination,
  LixiType, ViewClaimDto
} from '@bcpros/lixi-models';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import BCHJS from '@abcpros/xpi-js';
import { PrismaClient } from '@prisma/client';

import logger from '../../logger';
import { WalletService } from '../../services/wallet';
import { aesGcmDecrypt, base58ToNumber } from '../../utils/encryptionMethods';
import { ClaimType } from '@bcpros/lixi-models';

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

router.get('/claims/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {

  const { id } = req.params;
  try {
    const claim = await prisma.claim.findUnique({
      where: {
        id: _.toSafeInteger(id)
      },
      include: {
        lixi: {
          include: {
            envelope: true
          }
        }
      }
    });
    if (!claim) throw new VError('The claim does not exist in the database.');

    let result: ViewClaimDto = {
      id: claim.id,
      lixiId: claim.lixiId,
      image: claim.lixi.envelope?.image ?? '',
      thumbnail: claim.lixi.envelope?.thumbnail ?? '',
      amount: Number(claim.amount),
      message: claim.lixi.envelopeMessage
    };
    return res.json(result);
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get the claim.');
      return next(error);
    }
  }
});

router.post('/claims', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const claimApi: CreateClaimDto = req.body;
  const walletService: WalletService = Container.get(WalletService);

  const captchaResBody = {
    event: {
      token: claimApi.captchaToken,
      siteKey: SITE_KEY,
      expectedAction: "Claim"
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
        throw new VError('Incorrect capcha? Please claim again!');
      }
    } catch (err) {
      logger.error('Unable to check captcha');
      logger.error(JSON.stringify(err));
      next(err);
    }
  };

  if (claimApi) {
    try {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

      const claimCode = _.trim(claimApi.claimCode);
      const password = claimCode.slice(0, 8);
      const encodedLixiId = claimCode.slice(8);
      const lixiId = _.toSafeInteger(base58ToNumber(encodedLixiId));
      const address = _.trim(claimApi.claimAddress);

      if (!Number.isInteger(lixiId)) {
        throw new VError('Invalid claim code.');
      }

      const countClaimAddress = await prisma.claim.findMany({
        where: {
          AND: [
            { claimAddress: address },
            { lixiId: lixiId }
          ]
        }
      });

      const countIpaddress = await prisma.claim.count({
        where: {
          AND: [
            { ipaddress: ip },
            { lixiId: lixiId }
          ]
        }
      });

      const lixi = await prisma.lixi.findUnique({
        where: {
          id: lixiId
        }
      });


      // isFamilyFriendly == true
      if (lixi?.isFamilyFriendly) {
        if (countClaimAddress.length > 0 || countIpaddress >= 5) {
          throw new VError('You have reached the limit of redemptions for this code.');
        }
      }
      // isFamilyFriendly == false
      else {
        if (countClaimAddress.length > 0 || countIpaddress > 0) {
          throw new VError('You have reached the limit of redemptions for this code.');
        }
      }

      if (process.env.NODE_ENV !== 'development') {
        await checkingCaptcha();
        let geolocation;
        try {
          geolocation = geoip.lookup(ip);
        } catch (err) {
          logger.warn('Unable to detect geolocation of the claim');
        }
        const country = countries.find(country => country.id === lixi?.country)
        if (geolocation?.country != _.upperCase(country?.id) && !_.isNil(country?.id)) {
          throw new VError('You cannot claim from outside the ' + country?.name + ' zone.');
        }
      }

      if (!lixi) {
        throw new VError('Unable to claim because the lixi is invalid');
      }

      const lixiStatus = lixi?.status;
      if (lixiStatus === 'locked') {
        throw new VError('Unable to claim because the lixi is locked');
      }

      const xPriv = await aesGcmDecrypt(lixi.encryptedXPriv, password);

      const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
      const XPI: BCHJS = Container.get('xpijs');

      // Generate the HD wallet.
      const childNode = XPI.HDNode.fromXPriv(xPriv);
      const lixiAddress: string = XPI.HDNode.toXAddress(childNode);
      const keyPair = XPI.HDNode.toKeyPair(childNode);
      const balance = await xpiWallet.getBalance(lixiAddress);

      if (balance === 0) {
        throw new VError('Insufficient fund.');
      }

      if ((lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim) || moment().isAfter(lixi.expiryAt)) {
        throw new VError('The program has ended.');
      }

      const utxos = await XPI.Utxo.get(lixiAddress);
      const utxoStore = utxos[0];

      const xpiBalance = fromSmallestDenomination(balance);

      let satoshisToSend;
      if (lixi.claimType == ClaimType.OneTime) {
        const xpiValue = await walletService.onMax(lixiAddress);
        satoshisToSend = toSmallestDenomination(new BigNumber(xpiValue));
      } else if (lixi.lixiType == LixiType.Random) {
        const maxXpiValue = xpiBalance < lixi.maxValue ? xpiBalance : lixi.maxValue;
        const maxSatoshis = toSmallestDenomination(new BigNumber(maxXpiValue));
        const minSatoshis = toSmallestDenomination(new BigNumber(lixi.minValue));
        satoshisToSend = maxSatoshis.minus(minSatoshis).times(new BigNumber(Math.random())).plus(minSatoshis);
      } else if (lixi.lixiType == LixiType.Fixed) {
        const xpiValue = (xpiBalance <= lixi.fixedValue) ? await walletService.onMax(lixiAddress) : lixi.fixedValue;
        satoshisToSend = toSmallestDenomination(new BigNumber(xpiValue));
      } else {
        // The payout unit is satoshi
        const payout = balance / lixi.dividedValue;
        satoshisToSend = new BigNumber(payout);
      }

      const satoshisBalance = new BigNumber(balance);

      if (satoshisToSend.lt(546) && satoshisToSend.gte(satoshisBalance)) {
        throw new VError('Insufficient fund.');
      }

      const amountSats = Math.floor(satoshisToSend.toNumber());
      const outputs = [{
        address: claimApi.claimAddress,
        amountSat: amountSats
      }];



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
        transactionBuilder.addOutput(lixiAddress, change);
      }

      // Sign each UTXO that is about to be spent.
      necessaryUtxos.forEach((utxo, i) => {
        let claimScript

        transactionBuilder.sign(
          i,
          keyPair,
          claimScript,
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

        const createClaimOperation = prisma.claim.create({
          data: {
            ipaddress: ip,
            lixiId: lixi.id,
            transactionId: txid,
            claimAddress: claimApi.claimAddress,
            amount: amountSats
          }
        });

        const updateLixiOperation = prisma.lixi.update({
          where: { id: lixi.id },
          data: {
            totalClaim: lixi.totalClaim + BigInt(amountSats),
            claimedNum: lixi.claimedNum + 1,
            isClaimed: true,
          }
        });

        const result = await prisma.$transaction([createClaimOperation, updateLixiOperation]);

        const claimResult = {
          ...result[0],
          claimCode: claimApi.claimCode,
          amount: Number(result[0].amount)
        } as ClaimDto;
        res.json(claimResult);
      } catch (err) {
        throw new VError(err as Error, 'Unable to send transaction');
      }
    } catch (err) {
      if (err instanceof VError) {
        return next(err);
      } else {
        logger.error(err);
        const error = new VError.WError(err as Error, 'Unable to claim.');
        return next(error);
      }
    }
  }
})

export { router };