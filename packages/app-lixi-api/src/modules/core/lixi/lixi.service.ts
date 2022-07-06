import { CreateLixiCommand, fromSmallestDenomination, Lixi, Distribution, LixiDto, NotificationDto } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Account as AccountDb, Prisma } from '@prisma/client';
import { FlowJob, FlowProducer, Queue } from 'bullmq';
import IORedis from 'ioredis';
import * as _ from 'lodash';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import {
  CREATE_SUB_LIXIES_QUEUE,
  defaultLixiChunkSize,
  LIXI_JOB_NAMES
} from 'src/modules/core/lixi/constants/lixi.constants';
import { CreateSubLixiesChunkJobData, CreateSubLixiesJobData } from 'src/modules/core/lixi/models/lixi.models';
import { aesGcmDecrypt, aesGcmEncrypt, hexSha256, numberToBase58 } from 'src/utils/encryptionMethods';
import { template } from 'src/utils/stringTemplate';
import { VError } from 'verror';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../../wallet/wallet.service';

@Injectable()
export class LixiService {
  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @InjectQueue(CREATE_SUB_LIXIES_QUEUE) private lixiQueue: Queue,
    @I18n() private i18n: I18nService
  ) { }

  /**
   * @param derivationIndex The derivation index of the lixi
   * @param account The account which is associated with the lixi
   * @param command The create command, hold value to create the lixi
   */
  async createSingleLixi(
    derivationIndex: number,
    account: AccountDb,
    command: CreateLixiCommand,
    i18n: I18nContext
  ): Promise<Lixi> {
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
      expiryAt: command.expiryAt,
      activationAt: command.activationAt,
      address,
      totalClaim: BigInt(0),
      envelopeId: command.envelopeId ?? null,
      envelopeMessage: command.envelopeMessage ?? '',
    };
    const lixiToInsert = _.omit(data, 'password', 'staffAddress', 'charityAddress');

    const utxos = await this.XPI.Utxo.get(account.address);
    const utxoStore = utxos[0];
    let { keyPair } = await this.walletService.deriveAddress(command.mnemonic, 0); // keyPair of account
    let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos);

    // Validate the amount params
    if (isPrefund) {
      // Check the account balance in xpi
      const accountBalance: number = await this.xpiWallet.getBalance(account.address);
      if (command.amount >= fromSmallestDenomination(accountBalance - fee)) {
        const accountNotSufficientFund = await i18n.t('account.messages.accountNotSufficientFund');
        // Validate to make sure the account has sufficient balance
        throw new VError(accountNotSufficientFund);
      }
    }

    // Prepare receiving address and amount
    const receivingLixi = [{ address: lixiToInsert.address, amountXpi: command.amount }];

    // Save the lixi into the database
    const savedLixi = await this.prisma.$transaction(async prisma => {
      const createdLixi = prisma.lixi.create({ data: lixiToInsert });
      if (isPrefund) {
        await this.walletService.sendAmount(account.address, receivingLixi, keyPair, i18n);
      }
      return createdLixi;
    });

    // Calculate the claim code of the main lixi
    const encodedId = numberToBase58(savedLixi.id);
    const claimPart = command.password;
    const claimCode = claimPart + encodedId;

    const resultLixi: Lixi = _.omit(
      {
        ...savedLixi,
        claimCode: claimCode,
        balance: savedLixi.amount,
        totalClaim: Number(savedLixi.totalClaim),
        expiryAt: savedLixi.expiryAt ? savedLixi.expiryAt : undefined,
        activationAt: savedLixi.activationAt ? savedLixi.expiryAt : undefined,
        country: savedLixi.country ? savedLixi.country : undefined,
      },
      'encryptedXPriv'
    );

    return resultLixi;
  }

  async createOneTimeParentLixi(
    derivationIndex: number,
    account: AccountDb,
    command: CreateLixiCommand,
    i18n: I18nContext
  ): Promise<Lixi> {
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
      status: 'pending',
      expiryAt: command.expiryAt,
      activationAt: command.activationAt,
      address,
      totalClaim: BigInt(0),
      envelopeId: command.envelopeId ?? null,
      envelopeMessage: command.envelopeMessage ?? '',
      isNFTEnabled: command.isNFTEnabled ?? false
    };
    const lixiToInsert = _.omit(data, 'password', 'staffAddress', 'charityAddress');

    const utxos = await this.XPI.Utxo.get(account.address);
    const utxoStore = utxos[0];

    // Validate the amount params
    if (isPrefund) {
      // Check the account balance
      const accountBalance: number = await this.xpiWallet.getBalance(account.address);
      let fee = await this.walletService.calcFee(
        this.XPI,
        (utxoStore as any).bchUtxos,
        (command.numberOfSubLixi as number) + 1
      );
      if (command.amount >= fromSmallestDenomination(accountBalance - fee)) {
        const accountNotSufficientFund = await i18n.t('account.messages.accountNotSufficientFund');
        // Validate to make sure the account has sufficient balance
        throw new VError(accountNotSufficientFund);
      }
    }

    // Save the lixi into the database
    const savedLixi = await this.prisma.$transaction(async prisma => {
      const createdLixi = prisma.lixi.create({ data: lixiToInsert });
      return createdLixi;
    });

    // Calculate the claim code of the main lixi
    const encodedId = numberToBase58(savedLixi.id);
    const claimPart = command.password;
    const claimCode = claimPart + encodedId;

    const resultLixi: Lixi = _.omit(
      {
        ...savedLixi,
        claimCode: claimCode,
        balance: 0,
        totalClaim: Number(savedLixi.totalClaim),
        expiryAt: savedLixi.expiryAt ? savedLixi.expiryAt : undefined,
        activationAt: savedLixi.activationAt ? savedLixi.expiryAt : undefined,
        country: savedLixi.country ? savedLixi.country : undefined
      },
      'encryptedXPriv'
    );

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
  async createSubLixies(
    startDerivationIndex: number,
    account: AccountDb,
    command: CreateLixiCommand,
    parentLixiId: number
  ): Promise<string | undefined> {
    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    const chunkSize = command.numberLixiPerPackage ? command.numberLixiPerPackage : defaultLixiChunkSize; // number of output per
    const numberOfChunks = Math.ceil((command.numberOfSubLixi as number) / chunkSize);

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

    // Prepare distributions
    const distributionId: string[] = [];
    if (command.staffAddress != '') {
      const staffAddress = await this.prisma.distribution.create({
        data: {
          address: command.staffAddress as string,
          distributionType: "staff",
        }
      });
      distributionId.push(staffAddress.id);
    }
    if (command.charityAddress != '') {
      const charityAddress = await this.prisma.distribution.create({
        data: {
          address: command.charityAddress as string,
          distributionType: "charity",
        }
      });
      distributionId.push(charityAddress.id);
    }

    for (let chunkIndex = 0; chunkIndex < numberOfChunks; chunkIndex++) {
      const numberOfSubLixiInChunk =
        chunkIndex < numberOfChunks - 1 ? chunkSize : (command.numberOfSubLixi as number) - chunkIndex * chunkSize;

      // Start to process from the start of each chunk
      const startDerivationIndexForChunk = startDerivationIndex + chunkIndex * chunkSize;

      // Calculate fee for each chunk process
      let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos, numberOfSubLixiInChunk + 1);

      let createdPackage;
      if (command.numberLixiPerPackage) {
        createdPackage = await this.prisma.package.create({
          data: {}
        });
      }

      // Create the child job data
      const childJobData: CreateSubLixiesChunkJobData = {
        numberOfSubLixiInChunk: numberOfSubLixiInChunk,
        startDerivationIndexForChunk: startDerivationIndexForChunk,
        xpiAllowance: xpiAllowance,
        temporaryFeeCalc: fee,
        parentId: parentLixiId,
        command: command,
        fundingAddress: account.address,
        accountSecret: secret,
        packageId: command.numberLixiPerPackage && createdPackage?.id ? createdPackage?.id : undefined,
        distributions: (command.staffAddress != '' || command.charityAddress != '') ? distributionId : undefined,
      };

      const childJob: FlowJob = {
        name: LIXI_JOB_NAMES.CREATE_SUB_LIXIES_CHUNK,
        data: childJobData,
        queueName: CREATE_SUB_LIXIES_QUEUE
      };

      childrenJobs.push(childJob);
    }

    const flowProducer = new FlowProducer({
      connection: new IORedis({
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        host: process.env.REDIS_HOST ? process.env.REDIS_HOST : '127.0.0.1',
        port: process.env.REDIS_PORT ? _.toSafeInteger(process.env.REDIS_PORT) : 6379
      })
    });
    const flow = await flowProducer.add({
      name: LIXI_JOB_NAMES.CREATE_ALL_SUB_LIXIES,
      queueName: CREATE_SUB_LIXIES_QUEUE,
      children: childrenJobs,
      data: {
        parentId: parentLixiId,
        command: command
      } as CreateSubLixiesJobData
    });

    return flow.job.id;
  }

  checkDate(expiryAt: Date, activationAt: Date): any {
    const now = new Date();
    if (expiryAt != null) {
      const expiryAtDate = new Date(expiryAt);
      if (expiryAtDate.getTime() < now.getTime()) {
        throw new VError('Unable to claim because the lixi is expired');
      }
    }

    if (activationAt != null) {
      const activationAtDate = new Date(activationAt);
      if (activationAtDate.getTime() > now.getTime()) {
        throw new VError('Unable to claim because the lixi is not activated yet');
      }
    }
  }

  async updateStatusLixi(id: number, status: string) {
    const lixi = await this.prisma.lixi.findUnique({
      where: {
        id: _.toSafeInteger(id)
      }
    });
    if (!lixi) {
      const lixiNotExist = await this.i18n.t('lixi.messages.lixiNotExist');
      throw new VError(lixiNotExist);
    }

    const updatedLixi = await this.prisma.lixi.update({
      where: {
        id: _.toSafeInteger(id)
      },
      data: {
        status: status,
        updatedAt: new Date()
      }
    });

    if (updatedLixi) {
      let resultApi: LixiDto = {
        ...lixi,
        name: updatedLixi.name,
        totalClaim: Number(lixi.totalClaim),
        expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
        activationAt: lixi.activationAt ? lixi.activationAt : undefined,
        country: lixi.country ? lixi.country : undefined,
        status: lixi.status,
        numberOfSubLixi: lixi.numberOfSubLixi ?? 0,
        parentId: lixi.parentId ?? undefined,
        isClaimed: lixi.isClaimed ?? false
      };
      return resultApi;
    }
  }

  async buildNotification(
    notificationTypeId: number,
    senderId: number,
    recipientId: number,
    additionalData: any,
    mnemonicHash: string
  ) {
    const notifType = await this.prisma.notificationType.findFirst({
      where: {
        id: notificationTypeId
      },
      include: {
        notificationTypeTranslations: true
      }
    });

    if (!notifType) return null;

    const account = await this.prisma.account.findFirst({
      where: {
        mnemonicHash: mnemonicHash
      }
    });

    const translateTemplate: string =
      notifType.notificationTypeTranslations.find(x => x.language == account?.language)?.template ??
      notifType.notificationTypeTranslations.find(x => x.isDefault)?.template ??
      '';

    const message = template(translateTemplate, additionalData);
    const result: NotificationDto = {
      senderId,
      recipientId,
      level: 'INFO',
      action: 'open',
      message: message,
      additionalData: additionalData as Prisma.JsonValue,
      notificationTypeId: notificationTypeId
    };

    return result;
  }
}
