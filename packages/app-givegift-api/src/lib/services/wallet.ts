import BigNumber from 'bignumber.js';
import Container, { Inject, Service } from 'typedi';
import VError from 'verror';

import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import BCHJS from '@abcpros/xpi-js';
import HDNode from '@abcpros/xpi-js/types/hdnode';
import { PrismaClient } from '@prisma/client';
import { aesGcmDecrypt } from '../utils/encryptionMethods';

@Service()
export class WalletService {
  constructor(
    @Inject('xpijs') private xpijs: BCHJS,
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet
  ) {

  }

  async getBalance(address: string) {
    return this.xpiWallet.getBalance(address);
  }

  async getWalletDetails(mnemonic: string, vaultIndex: number) {
    const rootSeedBuffer = await this.xpijs.Mnemonic.toSeed(mnemonic);
    const masterHDNode = this.xpijs.HDNode.fromSeed(rootSeedBuffer);
    const hdPath = `m/44'/10605'/${vaultIndex}'/0/0`;
    const childNode = masterHDNode.derivePath(hdPath);
    const vaultAddress: string = this.xpijs.HDNode.toXAddress(childNode);
    const keyPair = this.xpijs.HDNode.toKeyPair(vaultAddress);
    const balance = await this.getBalance(vaultAddress);
    return { keyPair, balance }
  }

  async deriveAddress(mnemonic: string, vaultIndex: number): Promise<{ address: string, xpriv: string }> {
    const rootSeedBuffer: Buffer = await this.xpijs.Mnemonic.toSeed(mnemonic);
    const masterHDNode = this.xpijs.HDNode.fromSeed(rootSeedBuffer);
    const hdPath = `m/44'/10605'/${vaultIndex}'/0/0`;
    const childNode: HDNode = this.xpijs.HDNode.derivePath(masterHDNode, hdPath);
    const xAddress = this.xpijs.HDNode.toXAddress(childNode);
    const xpriv = this.xpijs.HDNode.toXPriv(childNode);

    return {
      address: xAddress,
      xpriv: xpriv
    };
  }

  async sendAmount(subAddress: string, amount: number, mnemonic: string) {
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

    const xpiWallet: MinimalBCHWallet = Container.get('xpiWallet');
    const XPI: BCHJS = Container.get('xpijs');

    const xPriv = await aesGcmDecrypt(addressMain, mnemonic);
    const childNode = XPI.HDNode.fromXPriv(xPriv);
    const keyPair = XPI.HDNode.toKeyPair(childNode);

    const addressMainBalance: number = await xpiWallet.getBalance(addressMain);
    if (addressMainBalance === 0) {
      throw new VError('Insufficient fund.');
    }

    const satoshisBalance = new BigNumber(addressMainBalance);

    let satoshisToSend = new BigNumber(amount);

    if (satoshisToSend.lt(546) && satoshisToSend.gte(satoshisBalance)) {
      throw new VError('Insufficient fund.');
    }

    const amountSats = Math.floor(satoshisToSend.toNumber());
    const outputs = [{
      address: subAddress,
      amountSat: amountSats
    }];

    const utxos = await XPI.Utxo.get(addressMain);
    const utxoStore = utxos[0];

    if (!utxoStore || !(utxoStore as any).bchUtxos || !(utxoStore as any).bchUtxos) {
      throw new VError('UTXO list is empty');
    }

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
      transactionBuilder.addOutput(addressMain, change);
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
      const txid = await XPI.RawTransactions.sendRawTransaction(hex);
      // const txid = await xpiWallet.send(outputs);

      const createRedeemOperation = prisma.redeem.create({
        data: {
          ipaddress: ip,
          vaultId: vault.id,
          transactionId: txid,
          redeemAddress: addressSub,
          amount: amountSats
        }
      });

      const updateVaultOperation = prisma.vault.update({
        where: { id: vault.id },
        data: {
          totalRedeem: vault.totalRedeem + BigInt(amountSats),
          redeemedNum: vault.redeemedNum + 1
        }
      });

      const result = await prisma.$transaction([createRedeemOperation, updateVaultOperation]);

      const redeemResult = {
        ...result[0],
        redeemCode: redeemApi.redeemCode,
        amount: Number(result[0].amount)
      } as RedeemDto;
      return (redeemResult);
    } catch (err) {
      throw new VError(err as Error, 'Unable to send transaction');
    }
  }
  
  // async onMax() {
  //   try {
  //     const txFeeSats = calcFee(BCH, slpBalancesAndUtxos.nonSlpUtxos);

  //     const txFeeBch = txFeeSats / 10 ** currency.cashDecimals;
  //     let value =
  //         balances.totalBalance - txFeeBch >= 0
  //             ? (balances.totalBalance - txFeeBch).toFixed(
  //                   currency.cashDecimals,
  //               )
  //             : 0;

  //     setFormData({
  //         ...formData,
  //         value,
  //     });
  // } catch (err) {
  //     console.log(`Error in onMax:`);
  //     console.log(err);
  //     message.error(
  //         'Unable to calculate the max value due to network errors',
  //     );
  //   }
  // }
}