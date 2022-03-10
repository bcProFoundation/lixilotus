import * as _ from 'lodash';
import express, { NextFunction } from 'express';
import VError from 'verror';
import { PrismaClient, Lixi as LixiDb } from '@prisma/client';
import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import { Account, CreateLixiCommand, fromSmallestDenomination, LixiDto, LixiType, ClaimType } from '@bcpros/lixi-models';
import { router as lixiChildRouter } from './lixi';
import { logger } from '../../logger';
import { aesGcmDecrypt, aesGcmEncrypt, generateRandomBase58Str, numberToBase58 } from '../../utils/encryptionMethods';
import Container from 'typedi';
import { WalletService } from '../../services/wallet';
import BCHJS from '@abcpros/xpi-js';
import sleep from '../../utils/sleep';

const prisma = new PrismaClient();
let router = express.Router();

router.get('/lixies/:id/', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const lixi = await prisma.lixi.findUnique({
      where: {
        id: _.toSafeInteger(id)
      },
      include: {
        envelope: true
      }
    });

    const childrenLixies = await prisma.lixi.findMany({
      where: {
        parentId: _.toSafeInteger(id),
      }
    });

    if (!lixi) throw new VError('The lixi does not exist in the database.');

    const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
    const balance: number = await xpiWallet.getBalance(lixi.address);

    let resultApi: any
    resultApi = _.omit({
      ...lixi,
      isClaimed: lixi.isClaimed,
      balance: balance,
      totalClaim: Number(lixi.totalClaim),
      envelope: lixi.envelope,
    } as unknown as LixiDto, 'encryptedXPriv');

    let childrenApi = childrenLixies.map(item => {
      return _.omit({
        ...item,
        totalClaim: Number(lixi.totalClaim),
        expiryAt: item.expiryAt ? item.expiryAt : undefined,
        country: item.country ? item.country : undefined,
      }, 'encryptedXPriv');
    })
    return res.json({
      lixi: resultApi,
      children: childrenApi
    });
  } catch (err: unknown) {
    if (err instanceof VError) {
      return next(err);
    } else {
      const error = new VError.WError(err as Error, 'Unable to get lixi.');
      return next(error);
    }
  }
});

router.post('/lixies', async (req: express.Request, res: express.Response, next: NextFunction) => {

  // Add mnemonic and required field to CreateLixiCommand
  const command: CreateLixiCommand = req.body;
  if (command) {
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await prisma.account.findFirst({
        where: {
          id: command.accountId,
          mnemonicHash: command.mnemonicHash
        },
      });

      if (!account) {
        throw new Error('Could not find the associated account.');
      }

      // Decrypt to validate the mnemonic
      const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
      if (mnemonicFromApi !== mnemonicToValidate) {
        throw Error('Could not create lixi because the account is invalid.');
      }

      // find the latest lixi created
      const latestLixi: LixiDb | null = await prisma.lixi.findFirst({
        where: {
          accountId: account.id,
        },
        orderBy: {
          id: 'desc'
        }
      });

      // Find the latest derivation index:
      let lixiIndex = 1;
      if (latestLixi) {
        lixiIndex = latestLixi.derivationIndex + 1;
      }

      const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
      const XPI: BCHJS = Container.get('xpijs');
      const walletService: WalletService = Container.get(WalletService);

      // Calculate the lixi encrypted claim code from the input password
      const { address, xpriv } = await walletService.deriveAddress(mnemonicFromApi, lixiIndex);
      const encryptedXPriv = await aesGcmEncrypt(xpriv, command.password);
      const encryptedClaimCode = await aesGcmEncrypt(command.password, command.mnemonic);

      // Prepare the lixi data
      const data = {
        ..._.omit(command, ['mnemonic', 'mnemonicHash', 'password']),
        id: undefined,
        derivationIndex: lixiIndex,
        encryptedClaimCode: encryptedClaimCode,
        claimedNum: 0,
        encryptedXPriv,
        status: 'active',
        expiryAt: null,
        address,
        totalClaim: BigInt(0),
        envelopeId: command.envelopeId ?? null,
        envelopeMessage: '',
      };
      const lixiToInsert = _.omit(data, 'password');
      const accountBalance = await xpiWallet.getBalance(account.address);

      const utxos = await XPI.Utxo.get(account.address);
      const utxoStore = utxos[0];
      let { keyPair } = await walletService.deriveAddress(command.mnemonic, 0); // keyPair of account
      let fee = await walletService.calcFee(XPI, (utxoStore as any).bchUtxos);

      // Insert the lixi to db and send fund from account to lixi
      let createdLixi: LixiDb;
      if (command.amount === 0) {
        lixiToInsert.amount = 0;
        [createdLixi] = await prisma.$transaction([prisma.lixi.create({ data: lixiToInsert })]);
      } else if (command.amount < fromSmallestDenomination(accountBalance)) {
        if (command.claimType == ClaimType.Single) {
          const amount: any = await walletService.sendAmount(account.address, lixiToInsert.address, command.amount, keyPair);
          lixiToInsert.amount = amount;
          [createdLixi] = await prisma.$transaction([prisma.lixi.create({ data: lixiToInsert })]);
        } else {
          lixiToInsert.amount = command.amount;
          [createdLixi] = await prisma.$transaction([prisma.lixi.create({ data: lixiToInsert })]);
        }
      } else {
        throw new VError('The account balance is not sufficient to funding the lixi.')
      }

      // Calculate the claim code of the main lixi
      const encodedId = numberToBase58(createdLixi.id);
      const claimPart = command.password;
      const claimCode = claimPart + encodedId;

      let createdSubLixi;
      let xpiBalance = command.amount;
      let mapXprivToPassword: { [xpiv: string]: string } = {};

      // Create sub lixies
      if (command.claimType == ClaimType.OneTime) {
        let subLixies = [];
        for (let i = 1; i <= command.numberOfSubLixi; i++) {

          // New password for each sub lixi
          const password = generateRandomBase58Str(8);

          const { address, xpriv } = await walletService.deriveAddress(mnemonicFromApi, lixiIndex + i);
          const encryptedXPriv = await aesGcmEncrypt(xpriv, password);
          const encryptedClaimCode = await aesGcmEncrypt(password, command.mnemonic);

          const name = address.slice(12, 17);
          mapXprivToPassword[encryptedClaimCode] = password;

          // Calculate satoshis to send
          let satoshisToSend;
          if (command.lixiType == LixiType.Random) {
            const maxSatoshis = xpiBalance < command.maxValue ? xpiBalance : command.maxValue;
            const minSatoshis = command.minValue;
            const satoshisRandom = (Math.random() * (maxSatoshis - minSatoshis) + minSatoshis);
            satoshisToSend = satoshisRandom + fromSmallestDenomination(fee);
            xpiBalance -= satoshisRandom;
          } else if (command.lixiType == LixiType.Equal) {
            satoshisToSend = command.amount / Number(command.numberOfSubLixi) + fromSmallestDenomination(fee);
          }

          const subData = {
            ..._.omit(command, [
              'mnemonic',
              'mnemonicHash',
              'password',
            ]),
            id: undefined,
            name: name,
            derivationIndex: lixiIndex + i,
            encryptedClaimCode: encryptedClaimCode,
            claimedNum: 0,
            encryptedXPriv,
            status: 'active',
            expiryAt: null,
            address,
            totalClaim: BigInt(0),
            envelopeId: command.envelopeId ?? null,
            envelopeMessage: '',
            parentId: createdLixi.id,
            amount: Number(satoshisToSend?.toFixed(6)),
          };

          const subLixiToInsert = _.omit(subData, 'password');
          subLixies.push(subLixiToInsert);
        }

        await prisma.$transaction([prisma.lixi.createMany({ data: subLixies as unknown as LixiDb })]);

        createdSubLixi = await prisma.lixi.findMany({
          where: {
            parentId: createdLixi.id
          }
        });

        for (let j = 0; j < _.size(createdSubLixi); j++) {
          const item: any = createdSubLixi[j];

          // Fund xpi from account to sub Lixi
          await walletService.sendAmount(account.address, item.address, item.amount, keyPair);
          await sleep(3000);

          // Calculate the claim code
          const encodedId = numberToBase58(item.id);
          const claimPart = mapXprivToPassword[item.encryptedClaimCode];
          const claimSubCode = claimPart + encodedId;
          item.claimCode = claimSubCode;
        }
      }

      let resultApi = _.omit({
        ...createdLixi,
        claimCode: claimCode,
        balance: createdLixi.amount,
        totalClaim: Number(createdLixi.totalClaim),
        expiryAt: createdLixi.expiryAt ? createdLixi.expiryAt : undefined,
        country: createdLixi.country ? createdLixi.country : undefined,
      }, 'encryptedXPriv');

      const createdSubLixiesResult = createdSubLixi?.map(item => {
        return _.omit({
          ...item,
          totalClaim: 0,
          expiryAt: item.expiryAt ? item.expiryAt : undefined,
          country: item.country ? item.country : undefined,
        }, 'encryptedXPriv');
      })

      res.json({
        lixi: resultApi,
        subLixies: createdSubLixiesResult
      });
    } catch (err) {
      if (err instanceof VError) {
        return next(err);
      } else {
        const error = new VError.WError(err as Error, 'Unable to create new lixi.');
        logger.error(err);
        return next(error);
      }
    }
  }

});


router.post('/lixies/:id/lock', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const lixiId = _.toSafeInteger(id);

  const command: Account = req.body
  try {
    const mnemonicFromApi = command.mnemonic;

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: command.mnemonicHash
      }
    });

    if (!account) {
      throw new Error('Could not find the associated account.');
    }

    // Decrypt to validate the mnemonic
    const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
    if (mnemonicFromApi !== mnemonicToValidate) {
      throw Error('Could not find the associated account.');
    }

    const lixi = await prisma.lixi.findFirst({
      where: {
        id: lixiId,
        accountId: account.id
      }
    });
    if (!lixi) {
      throw new Error('Could not found the lixi in the database.');
    }
    else {
      const lixi = await prisma.lixi.update({
        where: {
          id: lixiId
        },
        data: {
          status: 'locked'
        }
      });
      if (lixi) {
        let resultApi: LixiDto = {
          ...lixi,
          balance: 0,
          totalClaim: Number(lixi.totalClaim),
          expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
          country: lixi.country ? lixi.country : undefined,
          status: lixi.status,
          numberOfSubLixi: 0,
          parentId: lixi.parentId ?? undefined,
          isClaimed: lixi.isClaimed ?? false,
        };

        res.json(resultApi);
      }
    }

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not locked the lixi.');
      return next(error);
    }
  }
});

router.post('/lixies/:id/unlock', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const lixiId = _.toSafeInteger(id);

  const command: Account = req.body
  try {
    const mnemonicFromApi = command.mnemonic;

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: command.mnemonicHash
      }
    });

    if (!account) {
      throw new Error('Could not find the associated account.');
    }

    // Decrypt to validate the mnemonic
    const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
    if (mnemonicFromApi !== mnemonicToValidate) {
      throw Error('Could not find the associated account.');
    }

    const lixi = await prisma.lixi.findFirst({
      where: {
        id: lixiId,
        accountId: account.id
      }
    });
    if (!lixi) {
      throw new Error('Could not found the lixi in the database.');
    }
    else {
      const lixi = await prisma.lixi.update({
        where: {
          id: lixiId
        },
        data: {
          status: 'active'
        }
      });
      if (lixi) {
        let resultApi: LixiDto = {
          ...lixi,
          balance: 0,
          totalClaim: Number(lixi.totalClaim),
          expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
          country: lixi.country ? lixi.country : undefined,
          status: lixi.status,
          numberOfSubLixi: 0,
          parentId: lixi.parentId ?? undefined,
          isClaimed: lixi.isClaimed ?? false,
        };

        res.json(resultApi);
      }
    }

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not unlock the lixi.');
      return next(error);
    }
  }
});

router.post('/lixies/:id/withdraw', async (req: express.Request, res: express.Response, next: NextFunction) => {
  const { id } = req.params;
  const lixiId = parseInt(id);
  const walletService: WalletService = Container.get(WalletService);
  const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');

  const command: Account = req.body
  try {
    const mnemonicFromApi = command.mnemonic;

    const account = await prisma.account.findFirst({
      where: {
        mnemonicHash: command.mnemonicHash
      }
    });

    if (!account) {
      throw new Error('Could not find the associated account.');
    }

    // Decrypt to validate the mnemonic
    const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
    if (mnemonicFromApi !== mnemonicToValidate) {
      throw Error('Could not find the associated account.');
    }

    const lixi = await prisma.lixi.findFirst({
      where: {
        id: lixiId,
        accountId: account.id
      }
    });
    if (!lixi) {
      throw new Error('Could not found the lixi in the database.');
    }

    const lixiIndex = lixi.derivationIndex;
    const { address, keyPair } = await walletService.deriveAddress(mnemonicFromApi, lixiIndex);

    if (address !== lixi.address) {
      throw new Error('Invalid account. Unable to withdraw the lixi');
    }

    const lixiCurrentBalance: number = await xpiWallet.getBalance(lixi.address);

    if (lixiCurrentBalance === 0) {
      throw new VError('Unable to withdraw. The lixi is empty!');
    }

    const totalAmount: number = await walletService.onMax(lixi.address);

    const amount: any = await walletService.sendAmount(lixi.address, account.address, totalAmount, keyPair);
    let resultApi: LixiDto = {
      ...lixi,
      balance: amount ?? 0,
      totalClaim: Number(lixi.totalClaim),
      expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
      country: lixi.country ? lixi.country : undefined,
      numberOfSubLixi: 0,
      parentId: lixi.parentId ?? undefined,
      isClaimed: lixi.isClaimed ?? false,
    };

    res.json(resultApi);

  } catch (err) {
    if (err instanceof VError) {
      return next(err);
    } else {
      logger.error(err);
      const error = new VError.WError(err as Error, 'Could not withdraw the lixi.');
      return next(error);
    }
  }
});


router.use('/lixies', lixiChildRouter);

export { router };
