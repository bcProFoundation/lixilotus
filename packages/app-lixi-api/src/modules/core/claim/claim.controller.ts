import {
  ClaimDto,
  ClaimType,
  countries,
  CreateClaimDto,
  fromSmallestDenomination,
  LixiType,
  LotteryAddress,
  NetworkType,
  toSmallestDenomination,
  ViewClaimDto
} from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Body, Controller, Get, Headers, HttpException, HttpStatus, Inject, Logger, Param, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Info } from '@nestjs/graphql';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import geoip from 'geoip-country';
import * as _ from 'lodash';
import moment from 'moment';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ReqSocket } from 'src/decorators/req.socket.decorator';
import { LixiService } from 'src/modules/core/lixi/lixi.service';
import { LixiNftService } from 'src/modules/nft/lixinft.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { aesGcmDecrypt, base58ToNumber } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';

const PRIVATE_KEY = 'AIzaSyCFY2D4NRLjDTpJfk0jjJNADalSceqC4qs';
const SITE_KEY = '6Lc1rGwdAAAAABrD2AxMVIj4p_7ZlFKdE5xCFOrb';
const PROJECT_ID = 'lixilotus';

@Controller('claims')
export class ClaimController {
  private logger: Logger = new Logger(ClaimController.name);
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly lixiService: LixiService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private XPI: BCHJS,
    private readonly config: ConfigService,
    private readonly lixiNftService: LixiNftService
  ) {}

  @Get(':id')
  async getClaim(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<ViewClaimDto> {
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
      if (!claim) {
        const claimDoesNotExist = await i18n.t('claim.messages.claimDoesNotExist');
        throw new VError(claimDoesNotExist);
      }

      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: claim.lixiId
        },
        include: {
          package: true,
          uploadDetail: true
        }
      });

      let image, thumbnail;

      if (lixi?.parentId) {
        const parentLixi = await this.prisma.lixi.findFirst({
          where: {
            id: lixi.parentId
          },
          include: {
            uploadDetail: true
          }
        });
        if (parentLixi!.uploadDetail) {
          const upload = await this.prisma.upload.findFirst({
            where: {
              id: parentLixi!.uploadDetail.uploadId
            }
          });
          image = upload?.url;
          thumbnail = upload?.url?.replace(/(\.[\w\d_-]+)$/i, '-200$1');
        }
      } else {
        if (lixi?.uploadDetail) {
          const upload = await this.prisma.upload.findFirst({
            where: {
              id: lixi.uploadDetail.uploadId
            }
          });
          image = upload?.url;
          thumbnail = upload?.url?.replace(/(\.[\w\d_-]+)$/i, '-200$1');
        }
      }

      let result: ViewClaimDto = {
        id: claim.id,
        lixiId: claim.lixiId,
        image: image ? image : claim.lixi.envelope?.image || '',
        thumbnail: thumbnail ? thumbnail : claim.lixi.envelope?.thumbnail || '',
        amount: Number(claim.amount),
        message: claim.lixi.envelopeMessage,
        nftTokenId: claim.nftTokenId,
        nftTokenUrl: claim.nftTokenUrl,
        createDate: claim.createdAt
      };
      return result;
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const unableGetClaim = await i18n.t('claim.messages.unableGetClaim');
        const error = new VError.WError(err as Error, unableGetClaim);
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async claim(
    @Headers('x-forwarded-for') headerIp: string,
    @ReqSocket() socket: any,
    @Body() claimApi: CreateClaimDto,
    @I18n() i18n: I18nContext
  ): Promise<ClaimDto | any> {
    const captchaResBody = {
      event: {
        token: claimApi?.captchaToken || '',
        siteKey: SITE_KEY,
        expectedAction: 'Claim'
      }
    };

    const checkingCaptcha = async () => {
      try {
        const response = await axios.post<any>(
          `https://recaptchaenterprise.googleapis.com/v1beta1/projects/${PROJECT_ID}/assessments?key=${PRIVATE_KEY}`,
          captchaResBody
        );

        this.logger.log(`Recaptcha: Score: ${response.data.score} | Reasons: ${response.data.reasons}`);

        // Extract result from the API response
        if (response.status !== 200 || response.data.score <= 0.5) {
          const incorrectCaptcha = await i18n.t('claim.messages.incorrectCaptcha');
          throw new VError(incorrectCaptcha);
        }
      } catch (err) {
        throw err;
      }
    };

    if (claimApi) {
      try {
        const ip = (headerIp || socket.remoteAddress) as string;

        let claimCode = _.trim(claimApi.claimCode) ?? '';
        if (claimCode && claimApi.claimCode.includes('lixi_')) {
          const matches = claimCode.match('(?<=lixi_).*');
          if (matches && matches[0]) {
            claimCode = matches[0];
          }
        }
        const password = claimCode.slice(0, 8);
        const encodedLixiId = claimCode.slice(8);
        const lixiId = _.toSafeInteger(base58ToNumber(encodedLixiId));
        const address = _.trim(claimApi.claimAddress);

        if (!Number.isInteger(lixiId)) {
          const invalidClaimCode = await i18n.t('claim.messages.invalidClaimCode');
          throw new VError(invalidClaimCode);
        }

        const countClaimAddress = await this.prisma.claim.findMany({
          where: {
            AND: [{ claimAddress: address }, { lixiId: lixiId }]
          }
        });

        const countIpaddress = await this.prisma.claim.count({
          where: {
            AND: [{ ipaddress: ip }, { lixiId: lixiId }]
          }
        });

        const lixi = await this.prisma.lixi.findUnique({
          where: {
            id: lixiId
          },
          include: {
            package: true,
            uploadDetail: true
          }
        });

        const page = await this.prisma.page.findUnique({
          where: {
            pageAccountId: _.toSafeInteger(lixi?.accountId)
          }
        });

        const networkType = lixi?.networkType as string;
        switch (networkType) {
          case NetworkType.FamilyFriendly:
            if (countClaimAddress.length > 0 || countIpaddress >= 5) {
              const limitRedemptions = await i18n.t('claim.messages.limitRedemptions');
              throw new VError(limitRedemptions);
            }
          case NetworkType.NoWifiRestriction:
            if (countClaimAddress.length > 0) {
              const limitRedemptions = await i18n.t('claim.messages.limitRedemptions');
              throw new VError(limitRedemptions);
            }
          default:
            if (countClaimAddress.length > 0 || countIpaddress > 0) {
              const limitRedemptions = await i18n.t('claim.messages.limitRedemptions');
              throw new VError(limitRedemptions);
            }
        }

        if (process.env.NODE_ENV === 'production' && claimApi.captchaToken !== 'isAbcpay') {
          await checkingCaptcha();
          const geolocation = geoip.lookup(ip);
          const country = countries.find(country => country.id === lixi?.country);

          if (geolocation?.country != _.upperCase(country?.id) && !_.isNil(country?.id)) {
            const claimOutsideZone = await i18n.t('claim.messages.claimOutsideZone', {
              args: { countryName: country?.name }
            });
            throw new VError(claimOutsideZone);
          }
        }

        if (!lixi) {
          const unableClaimLixi = await i18n.t('claim.messages.unableClaimLixi');
          throw new VError(unableClaimLixi);
        }

        const lixiStatus = lixi?.status;
        if (lixiStatus === 'locked') {
          const unableClaimLockedLixi = await i18n.t('claim.messages.unableClaimLockedLixi');
          throw new VError(unableClaimLockedLixi);
        }

        //check if lixi is one time code
        let parentLixi;
        if (lixi.parentId != null) {
          parentLixi = await this.prisma.lixi.findUnique({
            where: {
              id: lixi.parentId
            },
            include: {
              distributions: true
            }
          });

          if (parentLixi?.status == 'locked') {
            const unableClaimParentLockedLixi = await i18n.t('claim.messages.unableClaimParentLockedLixi');
            throw new VError(unableClaimParentLockedLixi);
          }

          if (parentLixi?.expiryAt != null || parentLixi?.activationAt != null) {
            this.lixiService.checkDate(lixi.expiryAt!, lixi.activationAt!);
          }
        }

        if (lixi.expiryAt != null || lixi.activationAt != null) {
          this.lixiService.checkDate(lixi.expiryAt!, lixi.activationAt!);
        }

        const claimAddressBalance = await this.xpiWallet.getBalance(address);

        if (claimAddressBalance < toSmallestDenomination(new BigNumber(lixi.minStaking))) {
          const minStakingToClaim = await i18n.t('claim.messages.minStakingToClaim', {
            args: { minStaking: lixi.minStaking }
          });
          throw new VError(minStakingToClaim);
        }

        const xPriv = await aesGcmDecrypt(lixi.encryptedXPriv, password);

        // Generate the HD wallet.
        const childNode = this.XPI.HDNode.fromXPriv(xPriv);
        const lixiAddress: string = this.XPI.HDNode.toXAddress(childNode);
        const keyPair = this.XPI.HDNode.toKeyPair(childNode);
        const balance = await this.xpiWallet.getBalance(lixiAddress);

        if (balance === 0) {
          const insufficientFund = await i18n.t('claim.messages.insufficientFund');
          throw new VError(insufficientFund);
        }

        if ((lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim) || moment().isAfter(lixi.expiryAt)) {
          const programEnded = await i18n.t('claim.messages.programEnded');
          throw new VError(programEnded);
        }

        const utxos = await this.XPI.Utxo.get(lixiAddress);
        const utxoStore = utxos[0];

        const xpiBalance = fromSmallestDenomination(balance);

        let numberOfDistributions = 1;
        let addRegistered = 1;
        let satoshisToSend;
        !_.isNil(lixi.package?.registrant) && (addRegistered += numberOfDistributions);
        if (parentLixi && parentLixi.claimType == ClaimType.OneTime) {
          numberOfDistributions = parentLixi.joinLotteryProgram
            ? parentLixi.distributions.length + 2
            : parentLixi.distributions.length + 1;

          const totalAmountBeforeRegister = lixi.amount * numberOfDistributions;
          const amountFundingRegistered = totalAmountBeforeRegister / addRegistered;

          const xpiValue = amountFundingRegistered;
          satoshisToSend = toSmallestDenomination(new BigNumber(xpiValue));
        } else if (lixi.lixiType == LixiType.Random) {
          const maxXpiValue = xpiBalance < lixi.maxValue ? xpiBalance : lixi.maxValue;
          const maxSatoshis = toSmallestDenomination(new BigNumber(maxXpiValue));
          const minSatoshis = toSmallestDenomination(new BigNumber(lixi.minValue));
          satoshisToSend = maxSatoshis.minus(minSatoshis).times(new BigNumber(Math.random())).plus(minSatoshis);
        } else if (lixi.lixiType == LixiType.Fixed) {
          const xpiValue =
            xpiBalance <= lixi.fixedValue ? await this.walletService.onMax(lixiAddress) : lixi.fixedValue;
          satoshisToSend = toSmallestDenomination(new BigNumber(xpiValue));
        } else {
          // The payout unit is satoshi
          const payout = balance / lixi.dividedValue;
          satoshisToSend = new BigNumber(payout);
        }

        const satoshisBalance = new BigNumber(balance);

        if (satoshisToSend.lt(546) && satoshisToSend.gte(satoshisBalance)) {
          const insufficientFund = await i18n.t('claim.messages.insufficientFund');
          throw new VError(insufficientFund);
        }

        const amountSats = Math.floor(satoshisToSend.toNumber());

        let outputs: { address: string; amountSat: number }[] = [];

        // registrant
        !_.isNil(lixi.package?.registrant)
          ? outputs.push(
              {
                address: claimApi.claimAddress,
                amountSat: amountSats
              },
              {
                address: lixi.package?.registrant as unknown as string,
                amountSat: amountSats
              }
            )
          : (outputs = [
              {
                address: claimApi.claimAddress,
                amountSat: amountSats
              }
            ]);

        // distributions
        if (parentLixi && parentLixi.claimType == ClaimType.OneTime && parentLixi?.distributions) {
          _.map(parentLixi.distributions, item => {
            outputs.push({
              address: item.address,
              amountSat: amountSats
            });
          });
        }
        if (parentLixi?.joinLotteryProgram === true) {
          outputs.push({
            address: LotteryAddress,
            amountSat: amountSats
          });
        }

        if (!utxoStore || (!(utxoStore as any).bchUtxos && !(utxoStore as any).nullUtxos)) {
          const utxoEmpty = await i18n.t('claim.messages.utxoEmpty');
          throw new VError(utxoEmpty);
        }

        // Determine the UTXOs needed to be spent for this TX, and the change
        // that will be returned to the wallet.
        const utxosStore = (utxoStore as any).bchUtxos.concat((utxoStore as any).nullUtxos);
        const { necessaryUtxos, change } = this.xpiWallet.sendBch.getNecessaryUtxosAndChange(outputs, utxosStore, 1.0);

        // Create an instance of the Transaction Builder.
        const transactionBuilder: any = new this.XPI.TransactionBuilder();

        // Add inputs
        necessaryUtxos.forEach((utxo: any) => {
          transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos);
        });

        // Add outputs
        outputs.forEach(receiver => {
          transactionBuilder.addOutput(receiver.address, receiver.amountSat);
        });

        // No need the change, all the change (if there's any) comes to miner
        if (change && change > 546) {
          transactionBuilder.addOutput(lixiAddress, change);
        }

        // Sign each UTXO that is about to be spent.
        necessaryUtxos.forEach((utxo, i) => {
          let redeemScript;

          transactionBuilder.sign(i, keyPair, redeemScript, transactionBuilder.hashTypes.SIGHASH_ALL, utxo.value);
        });

        const tx = transactionBuilder.build();
        const hex = tx.toHex();

        try {
          // Broadcast the transaction to the network.
          const txid = await this.XPI.RawTransactions.sendRawTransaction(hex);
          // const txid = await xpiWallet.send(outputs);

          // Mint the NFT
          let nftTokenUrl = '';
          let nftTokenId = null;
          const tokenBaseUrl = this.config.get<string>('TOKEN_BASE_URL');
          if (lixi.isNFTEnabled && claimApi.nftReceiverAddress) {
            nftTokenId = await this.lixiNftService.mintNFT(claimApi.nftReceiverAddress);
            nftTokenUrl = `${tokenBaseUrl}nft/${nftTokenId}`;
          }

          const createClaimOperation = this.prisma.claim.create({
            data: {
              ipaddress: ip,
              lixiId: lixi.id,
              transactionId: txid,
              claimAddress: claimApi.claimAddress,
              amount: amountSats,
              nftTokenId: nftTokenId,
              nftTokenUrl: nftTokenUrl
            }
          });

          const updateLixiOperation = this.prisma.lixi.update({
            where: { id: lixi.id },
            data: {
              totalClaim: lixi.totalClaim + BigInt(amountSats),
              claimedNum: lixi.claimedNum + 1,
              isClaimed: lixi.claimType == ClaimType.OneTime ? true : false
            }
          });

          const insertResult = await this.prisma.$transaction([createClaimOperation, updateLixiOperation]);

          const claimId: number = insertResult[0].id;

          const claim = await this.prisma.claim.findUnique({
            where: {
              id: _.toSafeInteger(claimId)
            },
            include: {
              lixi: {
                include: {
                  envelope: true
                }
              }
            }
          });

          if (!claim) {
            const unableClaim = await i18n.t('claim.messages.unableClaim');
            throw new VError(unableClaim);
          }

          let image, thumbnail;

          if (lixi.parentId) {
            const parentLixi = await this.prisma.lixi.findFirst({
              where: {
                id: lixi.parentId
              },
              include: {
                uploadDetail: true
              }
            });
            if (parentLixi!.uploadDetail) {
              const upload = await this.prisma.upload.findFirst({
                where: {
                  id: parentLixi!.uploadDetail.uploadId
                }
              });
              image = upload?.url;
              thumbnail = upload?.url?.replace(/(\.[\w\d_-]+)$/i, '-200$1');
            }
          } else {
            if (lixi.uploadDetail) {
              const upload = await this.prisma.upload.findFirst({
                where: {
                  id: lixi.uploadDetail.uploadId
                }
              });
              image = upload?.url;
              thumbnail = upload?.url?.replace(/(\.[\w\d_-]+)$/i, '-200$1');
            }
          }

          let result: ViewClaimDto = {
            id: claimId,
            lixiId: claim.lixiId,
            image: image ? image : claim.lixi.envelope?.image || '',
            thumbnail: thumbnail ? thumbnail : claim.lixi.envelope?.thumbnail || '',
            amount: Number(claim.amount),
            message: claim.lixi.envelopeMessage,
            nftTokenId: claim.nftTokenId,
            nftTokenUrl: claim.nftTokenUrl,
            pageName: page?.name || ''
          };

          return result;
        } catch (err) {
          const unableSendTransaction = await i18n.t('claim.messages.unableSendTransaction');
          throw new VError(err as Error, unableSendTransaction);
        }
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          this.logger.error(err);
          const unableClaim = await i18n.t('claim.messages.unableClaim');
          const error = new VError.WError(err as Error, unableClaim);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }

  @Post('validate')
  async validate(
    @Headers('x-forwarded-for') headerIp: string,
    @ReqSocket() socket: any,
    @Body() claimApi: CreateClaimDto,
    @I18n() i18n: I18nContext
  ): Promise<any> {
    if (claimApi) {
      try {
        const ip = (headerIp || socket.remoteAddress) as string;

        let claimCode = _.trim(claimApi.claimCode) ?? '';

        this.logger.log(claimCode, 'claimcode');

        if (claimCode && claimApi.claimCode.includes('lixi_')) {
          const matches = claimCode.match('(?<=lixi_).*');
          if (matches && matches[0]) {
            claimCode = matches[0];
          }
        }
        const password = claimCode.slice(0, 8);
        const encodedLixiId = claimCode.slice(8);
        const lixiId = _.toSafeInteger(base58ToNumber(encodedLixiId));
        const address = _.trim(claimApi.claimAddress);

        if (!Number.isInteger(lixiId)) {
          const invalidCode = await i18n.t('claim.messages.invalidCode');
          throw new VError(invalidCode);
        }

        const countClaimAddress = await this.prisma.claim.findMany({
          where: {
            AND: [{ claimAddress: address }, { lixiId: lixiId }]
          }
        });

        const countIpaddress = await this.prisma.claim.count({
          where: {
            AND: [{ ipaddress: ip }, { lixiId: lixiId }]
          }
        });

        const lixi = await this.prisma.lixi.findUnique({
          where: {
            id: lixiId
          }
        });

        const networkType = lixi?.networkType as string;
        switch (networkType) {
          case NetworkType.FamilyFriendly:
            if (countClaimAddress.length > 0 || countIpaddress >= 5) {
              const limitRedemptions = await i18n.t('claim.messages.limitRedemptions');
              throw new VError(limitRedemptions);
            }
          case NetworkType.NoWifiRestriction:
            if (countClaimAddress.length > 0) {
              const limitRedemptions = await i18n.t('claim.messages.limitRedemptions');
              throw new VError(limitRedemptions);
            }
          default:
            if (countClaimAddress.length > 0 || countIpaddress > 0) {
              const limitRedemptions = await i18n.t('claim.messages.limitRedemptions');
              throw new VError(limitRedemptions);
            }
        }

        if (!lixi) {
          const unableClaimLixi = await i18n.t('claim.messages.unableClaimLixi');
          throw new VError(unableClaimLixi);
        }

        const lixiStatus = lixi?.status;
        if (lixiStatus === 'locked') {
          const unableClaimLockedLixi = await i18n.t('claim.messages.unableClaimLockedLixi');
          throw new VError(unableClaimLockedLixi);
        }

        //check if lixi is one time code
        if (lixi.parentId != null) {
          const parentLixi = await this.prisma.lixi.findUnique({
            where: {
              id: lixi.parentId
            },
            include: {
              distributions: true
            }
          });

          if (parentLixi?.status == 'locked') {
            const unableClaimParentLockedLixi = await i18n.t('claim.messages.unableClaimParentLockedLixi');
            throw new VError(unableClaimParentLockedLixi);
          }

          if (parentLixi?.expiryAt != null || parentLixi?.activationAt != null) {
            this.lixiService.checkDate(lixi.expiryAt!, lixi.activationAt!);
          }
        }

        if (lixi.expiryAt != null || lixi.activationAt != null) {
          this.lixiService.checkDate(lixi.expiryAt!, lixi.activationAt!);
        }

        const claimAddressBalance = await this.xpiWallet.getBalance(address);
        if (claimAddressBalance < toSmallestDenomination(new BigNumber(lixi.minStaking))) {
          const minStakingToClaim = await i18n.t('claim.messages.minStakingToClaim', {
            args: { minStaking: lixi.minStaking }
          });
          throw new VError(minStakingToClaim);
        }

        const xPriv = await aesGcmDecrypt(lixi.encryptedXPriv, password);

        // Generate the HD wallet.
        const childNode = this.XPI.HDNode.fromXPriv(xPriv);
        const lixiAddress: string = this.XPI.HDNode.toXAddress(childNode);
        const balance = await this.xpiWallet.getBalance(lixiAddress);

        if (balance === 0) {
          const insufficientFund = await i18n.t('claim.messages.insufficientFund');
          throw new VError(insufficientFund);
        }

        if ((lixi.maxClaim != 0 && lixi.claimedNum == lixi.maxClaim) || moment().isAfter(lixi.expiryAt)) {
          const programEnded = await i18n.t('claim.messages.programEnded');
          throw new VError(programEnded);
        }

        return true;
      } catch (err) {
        if (err instanceof VError) {
          this.logger.error('verror');
          this.logger.error(err);
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          this.logger.error('not verror');
          this.logger.error(err);
          this.logger.error(err);
          const unableClaim = await i18n.t('claim.messages.unableClaim');
          const error = new VError.WError(err as Error, unableClaim);
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }
}
