import { Account, ClaimType, CreateLixiCommand, fromSmallestDenomination, Lixi, LixiType } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Inject, Injectable } from '@nestjs/common';
import { Lixi as LixiDb, Prisma } from '@prisma/client';
import * as _ from 'lodash';
import { lixiChunkSize } from 'src/constants/lixi.constants';
import logger from 'src/logger';
import { aesGcmEncrypt, generateRandomBase58Str, numberToBase58 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet.service';

interface MapXPrivToPassword {
  [xpriv: string]: string
};

@Injectable()
export class LixiService {

  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) { }

  /**
   * @param derivationIndex The derivation index of the lixi
   * @param account The account which is associated with the lixi
   * @param command The create command, hold value to create the lixi
   */
  async createSingleLixi(derivationIndex: number, account: Account, command: CreateLixiCommand): Promise<Lixi> {

    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    // Calculate the lixi encrypted claim code from the input password
    const { address, xpriv } = await this.walletService.deriveAddress(command.mnemonic, derivationIndex);
    const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
    const encryptedClaimCode = await aesGcmEncrypt(command.password, command.mnemonic);

    // Prepare data to insert into the database
    const data = {
      ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password']),
      id: undefined,
      derivationIndex: derivationIndex,
      encryptedClaimCode: encryptedClaimCode,
      claimedNum: 0,
      encryptedXPriv,
      amount: isPrefund ? command.amount : 0,
      status: 'active',
      expiryAt: null,
      activationAt: null,
      address,
      totalClaim: BigInt(0),
      envelopeId: command.envelopeId ?? null,
      envelopeMessage: command.envelopeMessage ?? '',
    };
    const lixiToInsert = _.omit(data, 'password');

    const utxos = await this.XPI.Utxo.get(account.address);
    const utxoStore = utxos[0];
    let { keyPair } = await this.walletService.deriveAddress(command.mnemonic, 0); // keyPair of account
    let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos);

    // Validate the amount params
    if (isPrefund) {
      // Check the account balance in xpi
      const accountBalance: number = await this.xpiWallet.getBalance(account.address);
      if (command.amount >= fromSmallestDenomination(accountBalance - fee)) {
        // Validate to make sure the account has sufficient balance
        throw new VError('The account balance is not sufficient to funding the lixi.')
      }
    }

    // Prepare receiving address and amount
    const receivingLixi = [{ address: lixiToInsert.address, amountXpi: command.amount }];

    // Save the lixi into the database
    const savedLixi = await this.prisma.$transaction(async (prisma) => {
      const createdLixi = prisma.lixi.create({ data: lixiToInsert });
      if (isPrefund) {
        await this.walletService.sendAmount(account.address, receivingLixi, keyPair);
      }
      return createdLixi;
    });

    // Calculate the claim code of the main lixi
    const encodedId = numberToBase58(savedLixi.id);
    const claimPart = command.password;
    const claimCode = claimPart + encodedId;

    const resultLixi: Lixi = _.omit({
      ...savedLixi,
      claimCode: claimCode,
      balance: savedLixi.amount,
      totalClaim: Number(savedLixi.totalClaim),
      expiryAt: savedLixi.expiryAt ? savedLixi.expiryAt : undefined,
      activationAt: savedLixi.activationAt ? savedLixi.expiryAt : undefined,
      country: savedLixi.country ? savedLixi.country : undefined,
    }, 'encryptedXPriv');

    return resultLixi;
  }

  async createOneTimeParentLixi(derivationIndex: number, account: Account, command: CreateLixiCommand): Promise<Lixi> {
    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    // Calculate the lixi encrypted claim code from the input password
    const { address, xpriv } = await this.walletService.deriveAddress(command.mnemonic, derivationIndex);
    const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
    const encryptedClaimCode = await aesGcmEncrypt(command.password, command.mnemonic);

    // Prepare data to insert into the database
    const data = {
      ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password']),
      id: undefined,
      derivationIndex: derivationIndex,
      encryptedClaimCode: encryptedClaimCode,
      claimedNum: 0,
      encryptedXPriv,
      amount: 0,
      status: 'active',
      expiryAt: null,
      activationAt: null,
      address,
      totalClaim: BigInt(0),
      envelopeId: command.envelopeId ?? null,
      envelopeMessage: command.envelopeMessage ?? '',
    };
    const lixiToInsert = _.omit(data, 'password');

    const utxos = await this.XPI.Utxo.get(account.address);
    const utxoStore = utxos[0];

    // Validate the amount params
    if (isPrefund) {
      // Check the account balance
      const accountBalance: number = await this.xpiWallet.getBalance(account.address);
      let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos, command.numberOfSubLixi + 1);
      if (command.amount >= fromSmallestDenomination(accountBalance - fee)) {
        // Validate to make sure the account has sufficient balance
        throw new VError('The account balance is not sufficient to funding the lixi.')
      }
    }

    // Save the lixi into the database
    const savedLixi = await this.prisma.$transaction(async (prisma) => {
      const createdLixi = prisma.lixi.create({ data: lixiToInsert });
      return createdLixi;
    });

    // Calculate the claim code of the main lixi
    const encodedId = numberToBase58(savedLixi.id);
    const claimPart = command.password;
    const claimCode = claimPart + encodedId;

    const resultLixi: Lixi = _.omit({
      ...savedLixi,
      claimCode: claimCode,
      balance: 0,
      totalClaim: Number(savedLixi.totalClaim),
      expiryAt: savedLixi.expiryAt ? savedLixi.expiryAt : undefined,
      activationAt: savedLixi.activationAt ? savedLixi.expiryAt : undefined,
      country: savedLixi.country ? savedLixi.country : undefined,
    }, 'encryptedXPriv');

    return resultLixi;
  }

  async createSubLixies(startDerivationIndex: number, account: Account, command: CreateLixiCommand, parentLixi: Lixi): Promise<Array<Lixi>> {

    const chunkSize = lixiChunkSize; // number of output per 
    const numberOfChunks = Math.ceil(command.numberOfSubLixi / chunkSize);
    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    // The amount should be funded from the account
    let xpiBalance = command.amount;

    // The mapping from xpriv of lixi to the password used to encryted that paticular xpriv
    let mapXprivToPassword: MapXPrivToPassword = {};

    // Prepare the utxo and keypair to send funding
    const utxos = await this.XPI.Utxo.get(account.address);
    const utxoStore = utxos[0];
    let { keyPair } = await this.walletService.deriveAddress(command.mnemonic, 0); // keyPair of the account

    // Prepare array to hold the result
    let resultSubLixies: Lixi[] = [];

    for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {

      // Start to process from the start of each chunk
      let subLixiIndex = (chunkIndex * chunkSize);

      const numberOfSubLixiInChunk = chunkIndex < numberOfChunks - 1 ?
        chunkSize :
        command.numberOfSubLixi - subLixiIndex;

      // Calculate fee for each chunk process
      let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos, numberOfSubLixiInChunk + 1);

      let subLixiesToInsert: LixiDb[] = [];

      for (let indexInChunk = 0; indexInChunk < numberOfSubLixiInChunk; indexInChunk++) {
        // Generate new password for each sub lixi
        const password = generateRandomBase58Str(8);
        const derivationIndex = startDerivationIndex + subLixiIndex;

        const { address, xpriv } = await this.walletService.deriveAddress(command.mnemonic, derivationIndex);
        const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
        const encryptedClaimCode = await aesGcmEncrypt(command.password, command.mnemonic);

        const name = address.slice(12, 17);
        mapXprivToPassword[encryptedClaimCode] = password;

        // Calculate xpi to send
        let xpiToSend;
        if (command.lixiType == LixiType.Random) {
          const maxSatoshis = xpiBalance < command.maxValue ? xpiBalance : command.maxValue;
          const minSatoshis = command.minValue;
          const satoshisRandom = (Math.random() * (maxSatoshis - minSatoshis) + minSatoshis);
          xpiToSend = satoshisRandom + fromSmallestDenomination(fee);
          xpiBalance -= satoshisRandom;
        } else if (command.lixiType == LixiType.Equal) {
          xpiToSend = command.amount / Number(command.numberOfSubLixi) + fromSmallestDenomination(fee);
        }

        // Prepare data to insert into the database
        const dataSubLixi = {
          ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password']),
          id: undefined,
          name: name,
          derivationIndex: derivationIndex,
          encryptedClaimCode: encryptedClaimCode,
          claimedNum: 0,
          encryptedXPriv,
          amount: isPrefund ? Number(xpiToSend?.toFixed(6)) : 0,
          status: 'active',
          expiryAt: null,
          activationAt: null,
          address,
          totalClaim: BigInt(0),
          envelopeId: command.envelopeId ?? null,
          envelopeMessage: command.envelopeMessage ?? '',
          parentId: parentLixi.id,
          createdAt: new Date(),
        } as unknown as LixiDb;
        const subLixiToInsert = _.omit(dataSubLixi, 'password');
        subLixiesToInsert.push(subLixiToInsert);
        subLixiIndex += 1;
      }

      // Preparing receive address and amount
      const receivingSubLixies = subLixiesToInsert.map(item => {
        return ({
          address: item.address,
          amountXpi: item.amount
        })
      })

      // Save the lixi into the database
      try {
        const savedLixies = await this.prisma.$transaction(async (prisma) => {
          const createdLixies = prisma.lixi.createMany({ data: subLixiesToInsert });
          // await this.walletService.sendAmount(account.address, receivingSubLixies, keyPair);
          return createdLixies;
        });
        console.log(savedLixies);

        _.map(savedLixies, (item: LixiDb) => {
          const subLixi = _.omit({
            ...item,
            claimCode: '',
            balance: 0,
            totalClaim: Number(item.totalClaim),
            expiryAt: item.expiryAt ? item.expiryAt : undefined,
            activationAt: item.activationAt ? item.expiryAt : undefined,
            country: item.country ? item.country : undefined,
          }, 'encryptedXPriv') as Lixi;
          resultSubLixies.push(subLixi);
        });
      } catch (err) {
        logger.error(err);
        // Continue to process even if there's error in each batch
      }
    }
    return resultSubLixies;
  }
}