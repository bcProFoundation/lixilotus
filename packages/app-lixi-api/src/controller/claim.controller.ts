import { Body, Controller, Get, Headers, HttpException, HttpStatus, Inject, Param, Post } from '@nestjs/common';
import * as _ from 'lodash';
import axios from 'axios';
import { PrismaService } from '../services/prisma/prisma.service';
import BigNumber from 'bignumber.js';
import geoip from 'geoip-country';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import {
  countries, CreateClaimDto, fromSmallestDenomination, ClaimDto, toSmallestDenomination,
  LixiType, ViewClaimDto
} from '@bcpros/lixi-models';
import { WalletService } from "src/services/wallet.service";
import moment from 'moment';
import { aesGcmDecrypt, base58ToNumber } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import logger from 'src/logger';
import { ReqSocket } from 'src/decorators/req.socket.decorator';

const PRIVATE_KEY = 'AIzaSyCFY2D4NRLjDTpJfk0jjJNADalSceqC4qs';
const SITE_KEY = "6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb";
const PROJECT_ID = 'lixilotus';

@Controller('claims')
export class ClaimController {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private XPI: BCHJS) { }

  @Get(':id')
  async getEnvelope(@Param('id') id: string): Promise<ViewClaimDto> {
    try {
      const claim = await this.prisma.claim.findUnique({
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
      return result;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get the claim.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async claim(@Headers('x-forwarded-for') headerIp: string, @ReqSocket() socket: any, @Body() claimApi: CreateClaimDto): Promise<ClaimDto | any> {
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
        throw err;
      }
    };

    if (claimApi) {
      try {
        const ip = (headerIp || socket.remoteAddress) as string;

        const claimCode = _.trim(claimApi.claimCode);
        const password = claimCode.slice(0, 8);
        const encodedLixiId = claimCode.slice(8);
        const lixiId = _.toSafeInteger(base58ToNumber(encodedLixiId));
        const address = _.trim(claimApi.claimAddress);

        if (!Number.isInteger(lixiId)) {
          throw new VError('Invalid claim code.');
        }

        const countClaimAddress = await this.prisma.claim.findMany({
          where: {
            AND: [
              { claimAddress: address },
              { lixiId: lixiId }
            ]
          }
        });

        const countIpaddress = await this.prisma.claim.count({
          where: {
            AND: [
              { ipaddress: ip },
              { lixiId: lixiId }
            ]
          }
        });

        const lixi = await this.prisma.lixi.findUnique({
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
          const geolocation = geoip.lookup(ip);
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

        const claimAddressBalance = await this.xpiWallet.getBalance(address);
        if (claimAddressBalance < lixi.minStaking) {
          throw new VError('You must have at least ' + lixi.minStaking + ' XPI in your account to claim this offer.');
        }

        const xPriv = await aesGcmDecrypt(lixi.encryptedXPriv, password);

        // Generate the HD wallet.
        const childNode = this.XPI.HDNode.fromXPriv(xPriv);
        const lixiAddress: string = this.XPI.HDNode.toXAddress(childNode);
        const keyPair = this.XPI.HDNode.toKeyPair(childNode);
        const balance = await this.xpiWallet.getBalance(lixiAddress);

        if (balance === 0) {
          throw new VError('Insufficient fund.');
        }

        if ((lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim) || moment().isAfter(lixi.expiryAt)) {
          throw new VError('The program has ended.');
        }

        const utxos = await this.XPI.Utxo.get(lixiAddress);
        const utxoStore = utxos[0];

        const xpiBalance = fromSmallestDenomination(balance);

        let satoshisToSend;
        if (lixi.lixiType == LixiType.Random) {
          const maxXpiValue = xpiBalance < lixi.maxValue ? xpiBalance : lixi.maxValue;
          const maxSatoshis = toSmallestDenomination(new BigNumber(maxXpiValue));
          const minSatoshis = toSmallestDenomination(new BigNumber(lixi.minValue));
          satoshisToSend = maxSatoshis.minus(minSatoshis).times(new BigNumber(Math.random())).plus(minSatoshis);
        } else if (lixi.lixiType == LixiType.Fixed) {
          const xpiValue = xpiBalance < lixi.fixedValue ? await this.walletService.onMax(lixiAddress) : lixi.fixedValue;
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
        const { necessaryUtxos, change } = this.xpiWallet.sendBch.getNecessaryUtxosAndChange(
          outputs,
          (utxoStore as any).bchUtxos,
          1.0
        );

        // Create an instance of the Transaction Builder.
        const transactionBuilder: any = new this.XPI.TransactionBuilder();

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
          const txid = await this.XPI.RawTransactions.sendRawTransaction(hex);
          // const txid = await xpiWallet.send(outputs);

          const createClaimOperation = this.prisma.claim.create({
            data: {
              ipaddress: ip,
              lixiId: lixi.id,
              transactionId: txid,
              claimAddress: claimApi.claimAddress,
              amount: amountSats
            }
          });

          const updateLixiOperation = this.prisma.lixi.update({
            where: { id: lixi.id },
            data: {
              totalClaim: lixi.totalClaim + BigInt(amountSats),
              claimedNum: lixi.claimedNum + 1
            }
          });

          const result = await this.prisma.$transaction([createClaimOperation, updateLixiOperation]);

          const claimResult = {
            ...result[0],
            claimCode: claimApi.claimCode,
            amount: Number(result[0].amount)
          } as ClaimDto;
          return claimResult;
        } catch (err) {
          throw new VError(err as Error, 'Unable to send transaction');
        }
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          logger.error(err);
          const error = new VError.WError(err as Error, 'Unable to claim.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }
}
