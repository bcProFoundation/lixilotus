import { currency } from '@bcpros/lixi-models/constants/ticker';
import { fromSmallestDenomination, toSmallestDenomination } from '@bcpros/lixi-models/utils/cashMethods';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { AnyAsyncThunk } from '@reduxjs/toolkit/dist/matchers';
import { useAppDispatch } from '@store/hooks';
import { sendXPISuccess } from '@store/send/actions';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { useDispatch } from 'react-redux';

export default function useXPI() {
  const SEND_XPI_ERRORS = {
    INSUFFICIENT_FUNDS: 0,
    NETWORK_ERROR: 1,
    INSUFFICIENT_PRIORITY: 66, // ~insufficient fee
    DOUBLE_SPENDING: 18,
    MAX_UNCONFIRMED_TXS: 64
  };

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
  // const calcFee = (XPI, utxos, p2pkhOutputNumber = 2, satoshisPerByte = currency.defaultFee, opReturnLength = 0) => {
  //   let byteCount = XPI.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: p2pkhOutputNumber });
  //   // 8 bytes : the output's value
  //   // 1 bytes : Locking-Script Size
  //   // opReturnLength: the size of the OP_RETURN script
  //   // Referece
  //   // https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch06.asciidoc#transaction-serializationoutputs
  //   //
  //   // Technically, Locking-Script Size can be 1, 3, 5 or 9 bytes, But
  //   //  - Lotus Node's default allowed OP_RETURN length is set the 223 bytes
  //   //  - SendLotus max OP_RETURN length is also limited to 223 bytes
  //   // We can safely assume it is 1 byte (0 - 252. fd, fe, ff are special)
  //   //
  //   // The Output Count field is of VarInt (1, 3, 5 or 9 bytes), which indicates the number of outputs present in the transaction
  //   // Adding OP_RETURNs to the outputs increases the count
  //   // Since SendLotus only allows single recipient transaction, the maxium number of outputs in a tx is 5
  //   //  - one for recipient
  //   //  - one for change
  //   //  - maximum 3 for OP_RETURNs
  //   // So we can safely assume the Output will only take 1 byte.
  //   //
  //   // In wallet where multiple recipients are allowed in a transaction
  //   // adding extra OP_RETURN outputs may change the output count from 1 byte to 3 bytes
  //   // this would affect the fee
  //   let opReturnOutputByteLength = opReturnLength;
  //   if (opReturnLength) {
  //     opReturnOutputByteLength += 8 + 1;
  //   }
  //   const txFee = Math.ceil(satoshisPerByte * (byteCount + opReturnOutputByteLength));
  //   return txFee;
  // };

  const calcFee = (XPI: BCHJS, utxos: any, p2pkhOutputNumber = 2, satoshisPerByte = 2.01) => {
    const byteCount = XPI.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: p2pkhOutputNumber });
    const txFee = Math.ceil(satoshisPerByte * byteCount);
    return txFee;
  };

  const sendAmount = async (
    sourceAddress: string,
    destination: { address: string; amountXpi: string }[],
    inputKeyPair: any,
    selectedAccountId
  ) => {
    // const sourceBalance: number = await this.xpiWallet.getBalance(sourceAddress);
    // if (sourceBalance === 0) {
    //   // if (i18n === undefined) throw new VError('Insufficient Fund');

    //   // const insufficientFund = await i18n.t('claim.messages.insufficientFund');
    //   // throw new VError(insufficientFund);
    // }
    const XPI = getXPI();
    const XPIWallet = getXPIWallet();
    let outputs: { address: string; amountSat: number }[] = [];

    for (let i = 0; i < _.size(destination); i++) {
      const item = destination[i];
      let satoshisToSend = toSmallestDenomination(new BigNumber(item.amountXpi));

      if (satoshisToSend.lt(currency.dustSats)) {
        // if (i18n === undefined) throw new VError('The send amount is smaller than dust');
        // const sendAmountSmallerThanDust = await i18n.t('account.messages.sendAmountSmallerThanDust');
        // throw new VError(sendAmountSmallerThanDust);
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
      // throw new VError('UTXO list is empty');
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
      // if (i18n === undefined) throw new VError('Unable to send transaction');
      // const unableSendTransaction = await i18n.t('claim.messages.unableSendTransaction');
      // throw new VError(unableSendTransaction);
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
