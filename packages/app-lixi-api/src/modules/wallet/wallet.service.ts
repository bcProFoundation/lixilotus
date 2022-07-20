import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import VError from 'verror';

import { currency, fromSmallestDenomination, toSmallestDenomination } from '@bcpros/lixi-models';
import MinimalBCHWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import HDNode from '@bcpros/xpi-js/types/hdnode';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class WalletService {
  private logger: Logger = new Logger(WalletService.name);
  constructor(@Inject('xpiWallet') private xpiWallet: MinimalBCHWallet, @Inject('xpijs') private xpijs: BCHJS) { }

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
    return { keyPair, balance };
  }

  async deriveAddress(mnemonic: string, vaultIndex: number) {
    const rootSeedBuffer: Buffer = await this.xpijs.Mnemonic.toSeed(mnemonic);
    const masterHDNode = this.xpijs.HDNode.fromSeed(rootSeedBuffer);
    const hdPath = `m/44'/10605'/${vaultIndex}'/0/0`;
    const childNode: HDNode = this.xpijs.HDNode.derivePath(masterHDNode, hdPath);
    const xAddress = this.xpijs.HDNode.toXAddress(childNode);
    const xpriv = this.xpijs.HDNode.toXPriv(childNode);
    const wif = this.xpijs.HDNode.toWIF(childNode);
    const publicKey = this.xpijs.HDNode.toPublicKey(childNode).toString('hex');
    const keyPair = this.xpijs.HDNode.toKeyPair(childNode);

    const balance = await this.getBalance(xAddress);

    return {
      address: xAddress,
      xpriv: xpriv,
      wifKey: wif,
      publicKey: publicKey,
      keyPair: keyPair,
      balance: balance
    };
  }

  calcFee(XPI: BCHJS, utxos: any, p2pkhOutputNumber = 2, satoshisPerByte = 2.01) {
    const byteCount = XPI.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: p2pkhOutputNumber });
    const txFee = Math.ceil(satoshisPerByte * byteCount);
    return txFee;
  }

  async onMax(address: string) {
    const balance = await this.getBalance(address);

    const utxos = await this.xpijs.Utxo.get(address);
    const utxoStore = utxos[0];
    const utxosStore = (utxoStore as any).bchUtxos.concat((utxoStore as any).nullUtxos);
    const txFeeSats = await this.calcFee(this.xpijs, utxosStore);
    const value = balance - txFeeSats >= 0 ? balance - txFeeSats : '0';
    return fromSmallestDenomination(Number(value));
  }

  async sendAmount(
    sourceAddress: string,
    destination: { address: string; amountXpi: number }[],
    inputKeyPair: any,
    i18n?: I18nContext
  ) {
    const sourceBalance: number = await this.xpiWallet.getBalance(sourceAddress);
    if (sourceBalance === 0) {
      if (i18n === undefined) throw new VError('Insufficient Fund');

      const insufficientFund = await i18n.t('claim.messages.insufficientFund');
      throw new VError(insufficientFund);
    }

    let outputs: { address: string; amountSat: number }[] = [];

    for (let i = 0; i < _.size(destination); i++) {
      const item = destination[i];
      let satoshisToSend = toSmallestDenomination(new BigNumber(item.amountXpi));

      if (satoshisToSend.lt(currency.dustSats)) {
        if (i18n === undefined) throw new VError('The send amount is smaller than dust');

        const sendAmountSmallerThanDust = await i18n.t('account.messages.sendAmountSmallerThanDust');
        throw new VError(sendAmountSmallerThanDust);
      }

      const amountSats = Math.floor(satoshisToSend.toNumber());

      outputs.push({
        address: item.address,
        amountSat: amountSats
      });
    }

    const utxos = await this.xpijs.Utxo.get(sourceAddress);
    const utxoStore = utxos[0];

    if (!utxoStore || (!(utxoStore as any).bchUtxos && !(utxoStore as any).nullUtxos)) {
      throw new VError('UTXO list is empty');
    }
    const utxosStore = (utxoStore as any).bchUtxos.concat((utxoStore as any).nullUtxos);
    const { necessaryUtxos, change } = this.xpiWallet.sendBch.getNecessaryUtxosAndChange(outputs, utxosStore, 2.01);

    // Create an instance of the Transaction Builder.
    const transactionBuilder: any = new this.xpijs.TransactionBuilder();

    // Add inputs
    necessaryUtxos.forEach((utxo: any) => {
      transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos);
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
      let redeemScript;

      transactionBuilder.sign(i, inputKeyPair, redeemScript, transactionBuilder.hashTypes.SIGHASH_ALL, utxo.value);
    });

    const tx = transactionBuilder.build();
    const hex = tx.toHex();

    try {
      // Broadcast the transaction to the network.
      await this.xpijs.RawTransactions.sendRawTransaction([hex]);
      // const txid = await xpiWallet.send(outputs);
    } catch (err) {
      if (i18n === undefined) throw new VError('Unable to send transaction', err);

      const unableSendTransaction = await i18n.t('claim.messages.unableSendTransaction');
      throw new VError(unableSendTransaction, err);
    }
  }

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
      this.logger.error(err);
      return false;
    }
  }
}
