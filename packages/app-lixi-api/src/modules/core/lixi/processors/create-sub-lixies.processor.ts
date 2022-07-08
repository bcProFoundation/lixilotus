import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Lixi as LixiDb, PrismaClient } from '@prisma/client';
import * as _ from 'lodash';
import { VError } from 'verror';
import { CREATE_SUB_LIXIES_QUEUE, LIXI_JOB_NAMES } from 'src/modules/core/lixi/constants/lixi.constants';
import {
  CreateSubLixiesChunkJobData,
  CreateSubLixiesJobData,
  CreateSubLixiesJobResult,
  MapEncryptedClaimCode
} from 'src/modules/core/lixi/models/lixi.models';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { CreateLixiCommand, fromSmallestDenomination, Lixi, LixiType, Package } from '@bcpros/lixi-models';
import { aesGcmEncrypt, generateRandomBase58Str, numberToBase58 } from 'src/utils/encryptionMethods';

@Injectable()
@Processor(CREATE_SUB_LIXIES_QUEUE, { concurrency: 1 })
export class CreateSubLixiesProcessor extends WorkerHost {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
    @Inject('xpijs') private XPI: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {
    super();
  }

  public async process(job: Job<CreateSubLixiesJobData, boolean, string>): Promise<CreateSubLixiesJobResult | boolean> {
    if (job.name === LIXI_JOB_NAMES.CREATE_SUB_LIXIES_CHUNK) {
      return this.processCreateSubLixiesChunk(job);
    }

    const { parentId, command } = job.data;

    return {
      id: parentId,
      name: command.name,
      jobName: LIXI_JOB_NAMES.CREATE_ALL_SUB_LIXIES,
      mnemonicHash: command.mnemonicHash,
      senderId: command.accountId,
      recipientId: command.accountId
    } as CreateSubLixiesJobResult;
  }

  private async processCreateSubLixiesChunk(job: Job): Promise<boolean> {
    const jobData = job.data as CreateSubLixiesChunkJobData;
    const {
      numberOfSubLixiInChunk,
      startDerivationIndexForChunk,
      xpiAllowance,
      parentId,
      command,
      temporaryFeeCalc,
      fundingAddress,
      accountSecret,
      packageId
    } = jobData;

    const { keyPair } = await this.walletService.deriveAddress(command.mnemonic, 0); // keyPair of the account

    // The mapping from xpriv of lixi to the password used to encryted that paticular xpriv
    let mapEncryptedClaimCode: MapEncryptedClaimCode = {};

    const subLixiesToInsert: LixiDb[] = await this.prepareSubLixiChunkToInsert(
      numberOfSubLixiInChunk,
      startDerivationIndexForChunk,
      xpiAllowance,
      parentId,
      command,
      mapEncryptedClaimCode,
      temporaryFeeCalc,
      accountSecret,
      packageId as number
    );

    // Preparing receive address and amount
    const receivingSubLixies = _.filter(
      subLixiesToInsert.map(item => {
        return {
          address: item.address,
          amountXpi: item.amount
        };
      }),
      item => item.amountXpi !== 0
    );

    // Save the lixi into the database
    try {
      await this.prisma.$transaction(async prisma => {
        const countLixiesCreated = await prisma.lixi.createMany({
          data: subLixiesToInsert
        });
        if (receivingSubLixies.length > 0) {
          await this.walletService.sendAmount(fundingAddress, receivingSubLixies, keyPair);
        }
        return countLixiesCreated;
      });

      return true;
    } catch (err) {
      this.logger.error(err);
      throw new VError(err as Error, 'Unable to process job processCreateSubLixiesChunk');
    }
  }

  /**
   * Prepare the model of a chunk of sub lixi to insert into the database
   * @param numberOfSubLixiInChunk The number of sub lixi need to be created in the paticular chunk
   * @param startDerivationIndex The start number of derivation index for this chunk
   * @param xpiAllowance The total xpi allow to fund for all sub lixi in this chunk
   * @param parentId The parent id number of the sub lixi in this chunk
   * @param command The command instruction how to create lixi
   * @param mapEncryptedClaimCode The map to store mapping between the encrypted claim code and the claim code part (password) for items in this chunk
   * @param temporaryFeeCalc Temporary calculate the transaction fee to send fund for all sub lixi in this chunk
   * @returns An array of sub lixi to insert to database (only for this chunk)
   */
  private async prepareSubLixiChunkToInsert(
    numberOfSubLixiInChunk: number,
    startDerivationIndex: number,
    xpiAllowance: number,
    parentId: number,
    command: CreateLixiCommand,
    mapEncryptedClaimCode: MapEncryptedClaimCode,
    temporaryFeeCalc: number,
    accountSecret: string,
    packageId?: number
  ): Promise<LixiDb[]> {
    // If users input the amount means that the lixi need to be prefund
    const isPrefund = !!command.amount;

    let subLixiesToInsert: LixiDb[] = [];

    for (let indexInChunk = 0; indexInChunk < numberOfSubLixiInChunk; indexInChunk++) {
      // Generate new password for each sub lixi
      const derivationIndex = startDerivationIndex + indexInChunk;

      // Calculate xpi to send
      let xpiToSend: number = 0;

      if (!isPrefund) {
        xpiToSend = 0;
      } else {
        if (command.lixiType == LixiType.Random) {
          const maxXpi = xpiAllowance < command.maxValue ? xpiAllowance : command.maxValue;
          const minXpi = command.minValue;
          const xpiRandom = Math.random() * (maxXpi - minXpi);
          xpiToSend = xpiRandom + fromSmallestDenomination(temporaryFeeCalc);
          if (xpiToSend <= 0) {
            throw new Error('Incorrect number to send');
          }
          xpiAllowance -= xpiRandom;
        } else if (command.lixiType == LixiType.Equal) {
          xpiToSend = xpiAllowance / Number(command.numberOfSubLixi) + fromSmallestDenomination(temporaryFeeCalc);
          if (xpiToSend <= 0) {
            throw new Error('Incorrect number to send');
          }
        }
      }

      const subLixiToInsert: LixiDb = await this.prepareSubLixiToInsert(
        derivationIndex,
        xpiToSend,
        parentId,
        command,
        mapEncryptedClaimCode,
        accountSecret,
        packageId
      );
      subLixiesToInsert.push(subLixiToInsert);
    }

    return subLixiesToInsert;
  }

  /**
   * Prepare the model of a sub lixi to insert into the database
   * @param derivationIndex The derivation index of the paticular sub lixi
   * @param xpiToSend The xpi to fund to this sub lixi
   * @param parentId The parent id of this paticular sub lixi
   * @param command The command instruction to build lixi
   * @param mapEncryptedClaimCode The dictionary mapping between the encrypted claim code and the password used to encrypt that claim code
   * @returns {LixiDb} The Prisma model used to insert into the database
   */
  private async prepareSubLixiToInsert(
    derivationIndex: number,
    xpiToSend: number,
    parentId: number,
    command: CreateLixiCommand,
    mapEncryptedClaimCode: MapEncryptedClaimCode,
    accountSecret: string,
    packageId?: number
  ): Promise<LixiDb> {
    // Generate the random password to encrypt the key
    const password = generateRandomBase58Str(8);

    const { address, xpriv } = await this.walletService.deriveAddress(command.mnemonic, derivationIndex);
    const encryptedXPriv = await aesGcmEncrypt(xpriv, password);
    const encryptedClaimCode = await aesGcmEncrypt(password, accountSecret);
    const name = address.slice(12, 17);
    mapEncryptedClaimCode[encryptedClaimCode] = password;

    // Prepare data to insert into the database
    const dataSubLixi = {
      ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password', 'staffAddress', 'charityAddress']),
      id: undefined,
      name: name,
      derivationIndex: derivationIndex,
      encryptedClaimCode: encryptedClaimCode,
      claimedNum: 0,
      encryptedXPriv,
      amount: xpiToSend ? Number(xpiToSend?.toFixed(6)) : 0,
      status: 'active',
      expiryAt: null,
      activationAt: null,
      address,
      totalClaim: BigInt(0),
      envelopeId: command.envelopeId ?? null,
      envelopeMessage: command.envelopeMessage ?? '',
      parentId: parentId,
      createdAt: new Date(),
      packageId: packageId ?? null,
      joinLotteryProgram: command.joinLotteryProgram
    } as unknown as LixiDb;

    return dataSubLixi;
  }
}
