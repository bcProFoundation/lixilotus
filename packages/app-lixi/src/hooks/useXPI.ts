import { currency } from '@bcpros/lixi-models/constants/ticker';
import { toSmallestDenomination } from '@bcpros/lixi-models/utils/cashMethods';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import intl from 'react-intl-universal';

export default function useXPI() {
  const getRestUrl = (apiIndex = 0) => {
    const apiString: string =
      process.env.NEXT_PUBLIC_NETWORK === `mainnet`
        ? process.env.NEXT_PUBLIC_XPI_APIS!
        : process.env.NEXT_PUBLIC_XPI_APIS_TEST!;
    const apiArray = apiString.split(',');
    return apiArray[apiIndex];
  };

  const getXPI = (apiIndex = 0): BCHJS => {
    let ConstructedSlpWallet;

    ConstructedSlpWallet = new SlpWallet('', {
      restURL: getRestUrl(apiIndex),
      hdPath: "m/44'/10605'/0'/0/0"
    });
    return ConstructedSlpWallet.bchjs as BCHJS;
  };

  const getXPIWallet = (apiIndex = 0): any => {
    let ConstructedSlpWallet;

    ConstructedSlpWallet = new SlpWallet('', {
      restURL: getRestUrl(apiIndex),
      hdPath: "m/44'/10605'/0'/0/0"
    });
    return ConstructedSlpWallet;
  };

  const calcFee = (XPI: BCHJS, utxos: any, p2pkhOutputNumber = 2, satoshisPerByte = 2.01) => {
    const byteCount = XPI.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: p2pkhOutputNumber });
    const txFee = Math.ceil(satoshisPerByte * byteCount);
    return txFee;
  };

  const sendAmount = async (
    sourceAddress: string,
    destination: { address: string; amountXpi: string }[],
    inputKeyPair: any
  ) => {
    const sourceBalance: number = await this.xpiWallet.getBalance(sourceAddress);
    if (sourceBalance === 0) {
      throw new Error(intl.get('send.insufficientFund'));
    }
    const XPI = getXPI();
    const XPIWallet = getXPIWallet();
    let outputs: { address: string; amountSat: number }[] = [];

    for (let i = 0; i < _.size(destination); i++) {
      const item = destination[i];
      let satoshisToSend = toSmallestDenomination(new BigNumber(item.amountXpi));

      if (satoshisToSend.lt(currency.dustSats)) {
        throw new Error(intl.get('send.sendAmountSmallerThanDust'));
      }

      const amountSats = Math.floor(satoshisToSend.toNumber());

      outputs.push({
        address: item.address,
        amountSat: amountSats
      });
    }

    const utxos = await XPI.Utxo.get(sourceAddress);
    const utxoStore = utxos[0];

    if (!utxoStore || !(utxoStore as any).bchUtxos || !(utxoStore as any).bchUtxos) {
      throw new Error(intl.get('send.utxoEmpty'));
    }

    const { necessaryUtxos, change } = XPIWallet.sendBch.getNecessaryUtxosAndChange(
      outputs,
      (utxoStore as any).bchUtxos,
      2.01
    );

    // Create an instance of the Transaction Builder.
    const transactionBuilder: any = new XPI.TransactionBuilder();

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
      const data = await XPI.RawTransactions.sendRawTransaction(hex);
      return data;
    } catch (err) {
      throw new Error(intl.get('send.unableSendTransaction'));
    }
  };

  return {
    getXPI,
    getRestUrl,
    calcFee,
    getXPIWallet,
    sendAmount
  };
}
