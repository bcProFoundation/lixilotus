import { CreateLixiCommand, fromSmallestDenomination, Lixi, LixiType, Package } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Lixi as LixiDb, PrismaClient } from '@prisma/client';
import { Job } from 'bullmq';
import * as _ from 'lodash';
import logger from 'src/logger';
import {
  CreateSubLixiesChunkJobData,
  CreateSubLixiesJobData,
  CreateSubLixiesJobResult,
  MapEncryptedClaimCode
} from 'src/models/lixi.models';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { WalletService } from 'src/services/wallet.service';
import { aesGcmEncrypt, generateRandomBase58Str, numberToBase58 } from 'src/utils/encryptionMethods';
import { VError } from 'verror';
import config from 'config';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import { LIXI_JOB_NAMES } from 'src/constants/lixi.constants';

const xpiRestUrl = config.has('xpiRestUrl') ? config.get('xpiRestUrl') : 'https://api.sendlotus.com/v4/';
const prisma = new PrismaClient();
const xpiWallet = new SlpWallet('', {
  restURL: xpiRestUrl,
  hdPath: "m/44'/10605'/0'/0/0"
});

const XPI = xpiWallet.bchjs;
const walletService = new WalletService(xpiWallet, XPI);

export default async function (
  job: Job<CreateSubLixiesJobData, boolean, string>
): Promise<CreateSubLixiesJobResult | boolean> {
  return new Promise((resolve, reject) => {
    if (job.name === LIXI_JOB_NAMES.CREATE_SUB_LIXIES_CHUNK) {
      const result = processCreateSubLixiesChunk(job);
      resolve(result);
    }
    const { parentId, command } = job.data;
    resolve({
      id: parentId,
      name: command.name,
      jobName: LIXI_JOB_NAMES.CREATE_ALL_SUB_LIXIES,
      mnemonicHash: command.mnemonicHash,
      senderId: command.accountId,
      recipientId: command.accountId
    } as CreateSubLixiesJobResult);
  });
}

export async function processCreateSubLixiesChunk(job: Job): Promise<boolean> {
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
    packageSKU
  } = jobData;

  const { keyPair } = await walletService.deriveAddress(command.mnemonic, 0); // keyPair of the account

  // The mapping from xpriv of lixi to the password used to encryted that paticular xpriv
  let mapEncryptedClaimCode: MapEncryptedClaimCode = {};

  // Prepare array to hold the result
  let resultSubLixies: Lixi[] = [];

  const subLixiesToInsert: LixiDb[] = await prepareSubLixiChunkToInsert(
    numberOfSubLixiInChunk,
    startDerivationIndexForChunk,
    xpiAllowance,
    parentId,
    command,
    mapEncryptedClaimCode,
    temporaryFeeCalc,
    accountSecret,
    packageSKU
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
    const savedLixies = await prisma.$transaction(async prisma => {
      const createdLixies = prisma.lixi.createMany({ data: subLixiesToInsert });
      if (receivingSubLixies.length > 0) {
        await walletService.sendAmount(fundingAddress, receivingSubLixies, keyPair);
      }
      return createdLixies;
    });

    _.map(savedLixies, (item: LixiDb) => {
      // Calculate the claim code of the sub lixi
      const encodedId = numberToBase58(item.id);
      const claimPart = mapEncryptedClaimCode[item.encryptedClaimCode];
      const claimCode = claimPart + encodedId;

      const subLixi = _.omit(
        {
          ...item,
          claimCode: claimCode,
          balance: 0,
          totalClaim: Number(item.totalClaim),
          expiryAt: item.expiryAt ? item.expiryAt : undefined,
          activationAt: item.activationAt ? item.expiryAt : undefined,
          country: item.country ? item.country : undefined,
          packageId: packageSKU.id
        },
        'encryptedXPriv'
      ) as Lixi;

      resultSubLixies.push(subLixi);
    });

    return true;
  } catch (err) {
    logger.error(err);
    if (job.attemptsMade >= 3) {
      return false;
    }
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
async function prepareSubLixiChunkToInsert(
  numberOfSubLixiInChunk: number,
  startDerivationIndex: number,
  xpiAllowance: number,
  parentId: number,
  command: CreateLixiCommand,
  mapEncryptedClaimCode: MapEncryptedClaimCode,
  temporaryFeeCalc: number,
  accountSecret: string,
  packageSKU: Package
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
        const xpiRandom = Math.random() * (maxXpi - minXpi) + maxXpi;
        xpiToSend = xpiRandom + fromSmallestDenomination(temporaryFeeCalc);
        xpiAllowance -= xpiRandom;
      } else if (command.lixiType == LixiType.Equal) {
        xpiToSend = command.amount / Number(command.numberOfSubLixi) + fromSmallestDenomination(temporaryFeeCalc);
      }
    }

    const subLixiToInsert: LixiDb = await prepareSubLixiToInsert(
      derivationIndex,
      xpiToSend,
      parentId,
      command,
      mapEncryptedClaimCode,
      accountSecret,
      packageSKU
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
async function prepareSubLixiToInsert(
  derivationIndex: number,
  xpiToSend: number,
  parentId: number,
  command: CreateLixiCommand,
  mapEncryptedClaimCode: MapEncryptedClaimCode,
  accountSecret: string,
  packageSKU: Package
): Promise<LixiDb> {
  // Generate the random password to encrypt the key
  const password = generateRandomBase58Str(8);

  const { address, xpriv } = await walletService.deriveAddress(command.mnemonic, derivationIndex);
  const encryptedXPriv = await aesGcmEncrypt(xpriv, password);
  const encryptedClaimCode = await aesGcmEncrypt(password, accountSecret);
  const name = address.slice(12, 17);
  mapEncryptedClaimCode[encryptedClaimCode] = password;

  // Prepare data to insert into the database
  const dataSubLixi = {
    ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password']),
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
    packageId: packageSKU.id,
  } as unknown as LixiDb;

  return dataSubLixi;
}
