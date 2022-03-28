import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post,Patch } from '@nestjs/common';
import * as _ from 'lodash';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { Lixi as LixiDb } from '@prisma/client';
import {
  Account,
  CreateLixiCommand, fromSmallestDenomination, Claim, LixiDto, ClaimType, LixiType,
  RenameLixiCommand
} from '@bcpros/lixi-models';
import { WalletService } from "src/services/wallet.service";
import { aesGcmDecrypt, aesGcmEncrypt, numberToBase58, generateRandomBase58Str } from 'src/utils/encryptionMethods';
import sleep from '../utils/sleep';
import { VError } from 'verror';
import logger from 'src/logger';
import { PrismaService } from '../services/prisma/prisma.service';

@Controller('lixies')
export class LixiController {

  constructor(
    private prisma: PrismaService,
    private readonly walletService: WalletService,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private XPI: BCHJS
  ) { }

  @Get(':id')
  async getLixi(@Param('id') id: string): Promise<any> {
    try {
      const lixi = await this.prisma.lixi.findUnique({
        where: {
          id: _.toSafeInteger(id)
        },
        include: {
          envelope: true
        }
      });

      const childrenLixies = await this.prisma.lixi.findMany({
        where: {
          parentId: _.toSafeInteger(id),
        }
      });

      if (!lixi) throw new VError('The lixi does not exist in the database.');

      const balance: number = await this.xpiWallet.getBalance(lixi.address);

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
      return {
        lixi: resultApi,
        children: childrenApi
      };
    } catch (err: unknown) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post()
  async createLixi(@Body() command: CreateLixiCommand): Promise<any> {
    if (command) {
      try {
        const mnemonicFromApi = command.mnemonic;

        const account = await this.prisma.account.findFirst({
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
        const latestLixi: LixiDb | null = await this.prisma.lixi.findFirst({
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

        // Calculate the lixi encrypted claim code from the input password
        const { address, xpriv } = await this.walletService.deriveAddress(mnemonicFromApi, lixiIndex);
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
          envelopeMessage: command.envelopeMessage ?? '',
        };
        const lixiToInsert = _.omit(data, 'password');
        const accountBalance = await this.xpiWallet.getBalance(account.address);

        const utxos = await this.XPI.Utxo.get(account.address);
        const utxoStore = utxos[0];
        let { keyPair } = await this.walletService.deriveAddress(command.mnemonic, 0); // keyPair of account
        let fee = await this.walletService.calcFee(this.XPI, (utxoStore as any).bchUtxos);

        const receivingLixi = [{address: lixiToInsert.address, amountXpi: command.amount}];

        // Insert the lixi to db and send fund from account to lixi
        let createdLixi: LixiDb;
        if (command.amount === 0) {
          lixiToInsert.amount = 0;
          [createdLixi] = await this.prisma.$transaction([this.prisma.lixi.create({ data: lixiToInsert })]);
        } else if (command.amount < fromSmallestDenomination(accountBalance)) {
          if (command.claimType == ClaimType.Single) {
            const amount: any = await this.walletService.sendAmount(account.address, receivingLixi, keyPair);
            lixiToInsert.amount = amount;
            [createdLixi] = await this.prisma.$transaction([this.prisma.lixi.create({ data: lixiToInsert })]);
          } else {
            lixiToInsert.amount = command.amount;
            [createdLixi] = await this.prisma.$transaction([this.prisma.lixi.create({ data: lixiToInsert })]);
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

            const { address, xpriv } = await this.walletService.deriveAddress(mnemonicFromApi, lixiIndex + i);
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
              envelopeMessage: command.envelopeMessage ?? '',
              parentId: createdLixi.id,
              amount: Number(satoshisToSend?.toFixed(6)),
            };

            const subLixiToInsert = _.omit(subData, 'password');
            subLixies.push(subLixiToInsert);
          }

          await this.prisma.$transaction([this.prisma.lixi.createMany({ data: subLixies as unknown as LixiDb })]);

          createdSubLixi = await this.prisma.lixi.findMany({
            where: {
              parentId: createdLixi.id
            }
          });

          const receivingSubLixi = createdSubLixi.map(item => {
            return ({
              address: item.address,
              amountXpi: item.amount
            })
          })

          // Fund xpi from account to sub Lixi
          await this.walletService.sendAmount(account.address, receivingSubLixi, keyPair);

          for (let j = 0; j < _.size(createdSubLixi); j++) {
            const item: any = createdSubLixi[j];

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

        return {
          lixi: resultApi,
          subLixies: createdSubLixiesResult
        };
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const error = new VError.WError(err as Error, 'Unable to create new lixi.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
  }

  @Post(':id/lock')
  async lockLixi(@Param('id') id: string, @Body() command: Account): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
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

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }
      else {
        const lixi = await this.prisma.lixi.update({
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

          return resultApi;
        }
      }

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Could not locked the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/unlock')
  async unlockLixi(@Param('id') id: string, @Body() command: Account): Promise<LixiDto | undefined> {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
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

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }
      else {
        const lixi = await this.prisma.lixi.update({
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

          return resultApi;
        }
      }

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Could not unlock the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post(':id/withdraw')
  async withdrawLixi(@Param('id') id: string, @Body() command: Account) {
    const lixiId = _.toSafeInteger(id);
    try {
      const mnemonicFromApi = command.mnemonic;

      const account = await this.prisma.account.findFirst({
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

      const lixi = await this.prisma.lixi.findFirst({
        where: {
          id: lixiId,
          accountId: account.id
        }
      });
      if (!lixi) {
        throw new Error('Could not found the lixi in the database.');
      }

      const lixiIndex = lixi.derivationIndex;
      const { address, keyPair } = await this.walletService.deriveAddress(mnemonicFromApi, lixiIndex);

      if (address !== lixi.address) {
        throw new Error('Invalid account. Unable to withdraw the lixi');
      }

      const lixiCurrentBalance: number = await this.xpiWallet.getBalance(lixi.address);

      if (lixiCurrentBalance === 0) {
        throw new VError('Unable to withdraw. The lixi is empty!');
      }

      const totalAmount: number = await this.walletService.onMax(lixi.address);
      const receivingAccount = [{address: account.address, amountXpi: totalAmount,}]

      const amount: any = await this.walletService.sendAmount(lixi.address, receivingAccount, keyPair);
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

      return resultApi;

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        logger.error(err);
        const error = new VError.WError(err as Error, 'Could not withdraw the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get(':id/claims')
  async getLixiClaims(@Param('id') id: string): Promise<Claim[]> {
    const lixiId = _.toSafeInteger(id);
    try {
      const claims = await this.prisma.claim.findMany({
        where: {
          lixiId: lixiId
        }
      });

      const results = claims.map(item => {
        return {
          ...item,
          amount: Number(item.amount)
        } as Claim;
      });

      return results ?? [];

    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'Unable to get claim list of the lixi.');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Patch(':id/rename')
  async renameLixi(@Param('id') id: string, @Body() command: RenameLixiCommand): Promise<LixiDto> {
    if (command) {
      try {
        const mnemonicFromApi = command.mnemonic;
        const account = await this.prisma.account.findFirst({
          where: {
            mnemonicHash: command.mnemonicHash
          }
        });

        if (!account) {
        throw new Error('Could not find the associated account.');
        }

        const mnemonicToValidate = await aesGcmDecrypt(account.encryptedMnemonic, mnemonicFromApi);
        if (mnemonicFromApi !== mnemonicToValidate) { 
          throw new VError('Invalid account! Could not update the lixi.'); 
        }

        const lixi = await this.prisma.lixi.findUnique({
          where: {
            id: _.toSafeInteger(id)
          }
        });
        if (!lixi)
          throw new VError('The lixi does not exist in the database.');       

        const nameExist = await this.prisma.lixi.findFirst({
          where: {
            name: command.name,
            accountId: lixi.accountId
          }
        });
        if (nameExist)
          throw new VError('The name is already taken.');

        const updatedLixi: LixiDb = await this.prisma.lixi.update({
          where: {
            id: _.toSafeInteger(id),
          },
          data: {
            name: command.name,
            updatedAt: new Date(),
          }
        });

        if (updatedLixi) {
          let resultApi: LixiDto = {
            ...lixi,
            name: updatedLixi.name,
            totalClaim: Number(lixi.totalClaim),
            expiryAt: lixi.expiryAt ? lixi.expiryAt : undefined,
            country: lixi.country ? lixi.country : undefined,
            status: lixi.status,
            numberOfSubLixi: lixi.numberOfSubLixi ?? 0,
            parentId: lixi.parentId ?? undefined,
            isClaimed: lixi.isClaimed ?? false,
          };

          return resultApi;
        }
      } catch (err) {
        if (err instanceof VError) {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          const error = new VError.WError(err as Error, 'Unable to update lixi.');
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }
    return null as any;
  }
}
