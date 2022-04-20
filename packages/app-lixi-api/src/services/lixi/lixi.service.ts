import { CreateLixiCommand, fromSmallestDenomination, Lixi } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Account as AccountDb } from '@prisma/client';
import { FlowJob, FlowProducer, Queue } from 'bullmq';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { CREATE_SUB_LIXIES_QUEUE, lixiChunkSize } from 'src/constants/lixi.constants';
import { CreateSubLixiesChunkJobData } from 'src/models/lixi.models';
import { aesGcmDecrypt, aesGcmEncrypt, numberToBase58 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet.service';


@Injectable()
export class LixiService {

  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @InjectQueue(CREATE_SUB_LIXIES_QUEUE) private lixiQueue: Queue
  ) { }

  /**
   * @param derivationIndex The derivation index of the lixi
   * @param account The account which is associated with the lixi
   * @param command The create command, hold value to create the lixi
   */
  async createSingleLixi(derivationIndex: number, account: AccountDb, command: CreateLixiCommand): Promise<Lixi> {

    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    // Calculate the lixi encrypted claim code from the input password
    const { address, xpriv } = await this.walletService.deriveAddress(command.mnemonic, derivationIndex);
    const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
    const secret = await aesGcmDecrypt(account.encryptedSecret, command.mnemonic);
    const encryptedClaimCode = await aesGcmEncrypt(command.password, secret);

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

  async createOneTimeParentLixi(derivationIndex: number, account: AccountDb, command: CreateLixiCommand): Promise<Lixi> {
    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    // Calculate the lixi encrypted claim code from the input password
    const { address, xpriv } = await this.walletService.deriveAddress(command.mnemonic, derivationIndex);
    const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
    const secret = await aesGcmDecrypt(account.encryptedSecret, command.mnemonic);
    const encryptedClaimCode = await aesGcmEncrypt(command.password, secret);

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

  /**
   * Create the batch of sub lixies by schedule background jobs to create in chunks
   * @param startDerivationIndex the start derivation index for whole batch
   * @param account The account associated
   * @param command The command instruction to create sub lixies
   * @param parentLixiId The parent id of one-time codes lixi
   * @returns The background job id to create the batch of sub lixies
   */
  async createSubLixies(startDerivationIndex: number, account: AccountDb, command: CreateLixiCommand, parentLixiId: number): Promise<string | undefined> {

    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    const chunkSize = lixiChunkSize; // number of output per 
    const numberOfChunks = Math.ceil(command.numberOfSubLixi / chunkSize);

    if (numberOfChunks === 0) {
      throw new Error('Must create at least a sub lixi');
    }

    // The amount should be funded from the account
    const xpiAllowance = command.amount / numberOfChunks;

    // Decrypt the account secret
    const secret = await aesGcmDecrypt(account.encryptedSecret, command.mnemonic);

    // Prepare the utxo and keypair to send funding
    const utxos = await this.XPI.Utxo.get(account.address);
    const utxoStore = utxos[0];

    const childrenJobs: FlowJob[] = [];

    for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {

      const numberOfSubLixiInChunk = chunkIndex < numberOfChunks - 1 ?
        chunkSize :
        command.numberOfSubLixi - (chunkIndex * chunkSize);

      // Start to process from the start of each chunk
      const startDerivationIndexForChunk = startDerivationIndex + (chunkIndex * chunkSize);

      // Calculate fee for each chunk process
      let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos, numberOfSubLixiInChunk + 1);

      // Create the child job data
      const childJobData: CreateSubLixiesChunkJobData = {
        numberOfSubLixiInChunk: numberOfSubLixiInChunk,
        startDerivationIndexForChunk: startDerivationIndexForChunk,
        xpiAllowance: xpiAllowance,
        temporaryFeeCalc: fee,
        parentId: parentLixiId,
        command: command,
        fundingAddress: account.address,
        accountSecret: secret
      };

      const childJob: FlowJob = {
        name: 'create-sub-lixies-chunk',
        data: childJobData,
        queueName: CREATE_SUB_LIXIES_QUEUE
      };

      childrenJobs.push(childJob);
    }

    const flowProducer = new FlowProducer({
      connection: new IORedis({
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        host: process.env.REDIS_HOST ? process.env.REDIS_HOST : 'redis-lixi',
        port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379
      })
    });
    const flow = await flowProducer.add({
      name: 'create-all-sub-lixies',
      queueName: CREATE_SUB_LIXIES_QUEUE,
      children: childrenJobs,
    });

    return flow.job.id;
  }

}
