import { toLength } from 'lodash';
import { Inject, Service } from 'typedi';
import VError from 'verror';

import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import BCHJS from '@abcpros/xpi-js';
import HDNode from '@abcpros/xpi-js/types/hdnode';
import { PrismaClient } from '@prisma/client';
import BigNumber from 'bignumber.js';
import { toSmallestDenomination } from '@abcpros/givegift-models';

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
    const keyPair = this.xpijs.HDNode.toKeyPair(childNode);
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

  async calcFee(
    XPI: BCHJS,
    utxos: any,
    p2pkhOutputNumber = 2,
    satoshisPerByte = 2.01,
  ) {
      const byteCount = XPI.BitcoinCash.getByteCount(
          { P2PKH: utxos.length },
          { P2PKH: p2pkhOutputNumber },
      );
      const txFee = Math.ceil(satoshisPerByte * byteCount);
      return txFee;
  };

  async onMax(address: string) {
    const balance = await this.getBalance(address);

    const txFeeSats = this.calcFee(this.xpijs, this.xpijs.Utxo.get(address));

    const txFeeBch = await txFeeSats / 10 ** 6;
    const value = (balance - txFeeBch >= 0) ? (balance - txFeeBch).toFixed(6) : '0';
    return value;
  };

  async sendAmount(mainAddress: string, subAddress: string, amount: number, keyPair: any) {
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

    const addressMainBalance: number = await this.xpiWallet.getBalance(mainAddress);
    if (addressMainBalance === 0) {
      throw new VError('Insufficient fund.');
    }

    const satoshisBalance = new BigNumber(addressMainBalance);

    let satoshisToSend = toSmallestDenomination(new BigNumber(amount));

    if (satoshisToSend.lt(546) && satoshisToSend.gte(satoshisBalance)) {
      throw new VError('Insufficient fund.');
    }

    const amountSats = Math.floor(satoshisToSend.toNumber());
    const outputs = [{
      address: subAddress,
      amountSat: amountSats
    }];

    const utxos = await this.xpijs.Utxo.get(mainAddress);
    const utxoStore = utxos[0];

    if (!utxoStore || !(utxoStore as any).bchUtxos || !(utxoStore as any).bchUtxos) {
      throw new VError('UTXO list is empty');
    }

    const { necessaryUtxos, change } = this.xpiWallet.sendBch.getNecessaryUtxosAndChange(
      outputs,
      (utxoStore as any).bchUtxos,
      1.0
    );

    // Create an instance of the Transaction Builder.
    const transactionBuilder: any = new this.xpijs.TransactionBuilder();

    // Add inputs
    necessaryUtxos.forEach((utxo: any) => {
      transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos)
    });

    // Add outputs
    outputs.forEach(receiver => {
      transactionBuilder.addOutput(receiver.address, receiver.amountSat);
    });

    if (change && change > 546) {
      transactionBuilder.addOutput(mainAddress, change);
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
      const txid = await this.xpijs.RawTransactions.sendRawTransaction(hex);
      // const txid = await xpiWallet.send(outputs);

      const redeemResult = {
        amount: Number(amountSats)
      };
      return (redeemResult.amount);
    } 
    catch (err) {
      throw new VError(err as Error, 'Unable to send transaction');
    }
  };
}