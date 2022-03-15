import VError from 'verror';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import HDNode from '@bcpros/xpi-js/types/hdnode';
import BigNumber from 'bignumber.js';
import { currency, fromSmallestDenomination, toSmallestDenomination } from '@bcpros/lixi-models';
import { Inject, Injectable } from '@nestjs/common';
import logger from 'src/logger';


@Injectable()
export class WalletService {
  constructor(
    @Inject('xpiWallet') private xpiWallet: MinimalBCHWallet,
    @Inject('xpijs') private xpijs: BCHJS
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

  async deriveAddress(mnemonic: string, vaultIndex: number) {
    const rootSeedBuffer: Buffer = await this.xpijs.Mnemonic.toSeed(mnemonic);
    const masterHDNode = this.xpijs.HDNode.fromSeed(rootSeedBuffer);
    const hdPath = `m/44'/10605'/${vaultIndex}'/0/0`;
    const childNode: HDNode = this.xpijs.HDNode.derivePath(masterHDNode, hdPath);
    const xAddress = this.xpijs.HDNode.toXAddress(childNode);
    const xpriv = this.xpijs.HDNode.toXPriv(childNode);
    const keyPair = this.xpijs.HDNode.toKeyPair(childNode);
    const balance = await this.getBalance(xAddress);

    return {
      address: xAddress,
      xpriv: xpriv,
      keyPair: keyPair,
      balance: balance
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

    const { necessaryUtxos, change } = this.xpiWallet.sendBch.getNecessaryUtxosAndChange(
      outputs,
      (utxoStore as any).bchUtxos,
      2.01
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

      const claimResult = {
        amount: Number(amountSats)
      };
      return (claimResult.amount);
    }
    catch (err) {
      throw new VError(err as Error, 'Unable to send transaction');
    }
  };

  async validateMnemonic(mnemonic: string, wordlist = this.xpijs.Mnemonic.wordLists().english) {
    let mnemonicTestOutput;

    try {
      mnemonicTestOutput = await this.xpijs.Mnemonic.validate(mnemonic, wordlist);

      if (mnemonicTestOutput === 'Valid mnemonic') {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      logger.error(err);
      return false;
    }
  };
}
