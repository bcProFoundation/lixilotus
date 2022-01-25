import { toLength } from 'lodash';
import { Inject, Service } from 'typedi';
import VError from 'verror';

import MinimalBCHWallet from '@abcpros/minimal-xpi-slp-wallet';
import BCHJS from '@abcpros/xpi-js';
import HDNode from '@abcpros/xpi-js/types/hdnode';
import { PrismaClient } from '@prisma/client';
import BigNumber from 'bignumber.js';
import { currency, fromSmallestDenomination, toSmallestDenomination } from '@abcpros/givegift-models';

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

    const utxos = await this.xpijs.Utxo.get(address);
    const utxoStore = utxos[0];

    const txFeeSats = await this.calcFee(this.xpijs, (utxoStore as any).bchUtxos);

    const value = (balance - txFeeSats >= 0) ? (balance - txFeeSats) : '0';
    return fromSmallestDenomination(Number(value));
  };

  async sendAmount(sourceAddress: string, destinationAddress: string, amountXpi: number, inputKeyPair: any) {

    const sourceBalance: number = await this.xpiWallet.getBalance(sourceAddress);
    if (sourceBalance === 0) {
      throw new VError('Insufficient fund.');
    }

    const satoshisBalance = new BigNumber(sourceBalance);

    let satoshisToSend = toSmallestDenomination(new BigNumber(amountXpi));

    if (satoshisToSend.lt(currency.dustSats)) {
      throw new VError('The send amount is smaller than dust.');
    }

    const amountSats = Math.floor(satoshisToSend.toNumber());

    const outputs = [{
      address: destinationAddress,
      amountSat: amountSats
    }];

    const utxos = await this.xpijs.Utxo.get(sourceAddress);
    const utxoStore = utxos[0];

    if (!utxoStore || !(utxoStore as any).bchUtxos || !(utxoStore as any).bchUtxos) {
      throw new VError('UTXO list is empty');
    }

    try {
      const { necessaryUtxos, change } = this.xpiWallet.sendBch.getNecessaryUtxosAndChange(
        outputs,
        (utxoStore as any).bchUtxos,
        2.01
      );
    } catch (e) {
      throw new VError('Insufficient fund.')
    }


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
      transactionBuilder.addOutput(sourceAddress, change);
    }

    // Sign each UTXO that is about to be spent.
    necessaryUtxos.forEach((utxo, i) => {
      let redeemScript

      transactionBuilder.sign(
        i,
        inputKeyPair,
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