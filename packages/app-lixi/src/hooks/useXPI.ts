import { currency } from '@bcpros/lixi-models/constants/ticker';
import { fromSmallestDenomination, toSmallestDenomination } from '@bcpros/lixi-models/utils/cashMethods';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import intl from 'react-intl-universal';

type TxHistoryResponse = {
  success: boolean;
  transactions: TxHistoryTransaction[];
};

type TxHistoryTransaction = {
  height: number;
  tx_hash: string;
};

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

  const calcFee = (XPI: BCHJS, utxos: any, p2pkhOutputNumber = 2, satoshisPerByte = 2.01, opReturnLength = 0) => {
    const byteCount = XPI.BitcoinCash.getByteCount({ P2PKH: utxos.length }, { P2PKH: p2pkhOutputNumber });
    // 8 bytes : the output's value
    // 1 bytes : Locking-Script Size
    // opReturnLength: the size of the OP_RETURN script
    // Referece
    // https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch06.asciidoc#transaction-serializationoutputs
    //
    // Technically, Locking-Script Size can be 1, 3, 5 or 9 bytes, But
    //  - Lotus Node's default allowed OP_RETURN length is set the 223 bytes
    //  - SendLotus max OP_RETURN length is also limited to 223 bytes
    // We can safely assume it is 1 byte (0 - 252. fd, fe, ff are special)
    //
    // The Output Count field is of VarInt (1, 3, 5 or 9 bytes), which indicates the number of outputs present in the transaction
    // Adding OP_RETURNs to the outputs increases the count
    // Since SendLotus only allows single recipient transaction, the maxium number of outputs in a tx is 5
    //  - one for recipient
    //  - one for change
    //  - maximum 3 for OP_RETURNs
    // So we can safely assume the Output will only take 1 byte.
    //
    // In wallet where multiple recipients are allowed in a transaction
    // adding extra OP_RETURN outputs may change the output count from 1 byte to 3 bytes
    // this would affect the fee
    let opReturnOutputByteLength = opReturnLength;
    if (opReturnLength) {
      opReturnOutputByteLength += 8 + 1;
    }
    const txFee = Math.ceil(satoshisPerByte * byteCount);
    return txFee;
  };

  const sendAmount = async (
    sourceAddress: string,
    destination: { address: string; amountXpi: string }[],
    inputKeyPair: any,
    optionalOpReturnMsg,
    encryptionFlag
  ) => {
    const XPI = getXPI();
    const XPIWallet = getXPIWallet();
    const sourceBalance: number = await XPIWallet.getBalance(sourceAddress);
    if (sourceBalance === 0) {
      throw new Error(intl.get('send.insufficientFund'));
    }
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

    if (!utxoStore || (!(utxoStore as any).bchUtxos && !(utxoStore as any).nullUtxos)) {
      throw new Error(intl.get('send.utxoEmpty'));
    }
    const utxosStore = (utxoStore as any).bchUtxos.concat((utxoStore as any).nullUtxos);
    const { necessaryUtxos, change } = XPIWallet.sendBch.getNecessaryUtxosAndChange(outputs, utxosStore, 2.01);
    // Create an instance of the Transaction Builder.
    const transactionBuilder: any = new XPI.TransactionBuilder();

    // Add inputs
    necessaryUtxos.forEach((utxo: any) => {
      transactionBuilder.addInput(utxo.tx_hash, utxo.tx_pos);
    });
    let script;
    let opReturnBuffer;
    // Start of building the OP_RETURN output.
    // only build the OP_RETURN output if the user supplied it
    if (optionalOpReturnMsg && typeof optionalOpReturnMsg !== 'undefined') {
      if (encryptionFlag) {
        // build the OP_RETURN script with the encryption prefix
        script = [
          XPI.Script.opcodes.OP_RETURN, // 6a
          Buffer.from(currency.opReturn.appPrefixesHex.lotusChatEncrypted, 'hex'), // 03030303
          Buffer.from(optionalOpReturnMsg)
        ];
      } else {
        // this is un-encrypted message
        script = [
          XPI.Script.opcodes.OP_RETURN, // 6a
          Buffer.from(currency.opReturn.appPrefixesHex.lotusChat, 'hex'), // 02020202
          Buffer.from(optionalOpReturnMsg)
        ];
      }
      opReturnBuffer = XPI.Script.encode(script);
      transactionBuilder.addOutput(opReturnBuffer, 0);
    }
    // End of building the OP_RETURN output.
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

  const sendXpi = async (
    sourceAddress: string,
    utxos,
    inputKeyPair,
    destinationAddress,
    sendAmount,
    feeInSatsPerByte,
    optionalOpReturnMsg,
    encryptionFlag
  ) => {
    try {
      if (!sendAmount) {
        return null;
      }
      const XPI = getXPI();
      const XPIWallet = getXPIWallet();
      const sourceBalance: number = await XPIWallet.getBalance(sourceAddress);

      // throw new Error(intl.get('send.insufficientFund'));
      if (sourceBalance === 0) {
        throw new Error(intl.get('send.insufficientFund'));
      }
      const value = new BigNumber(sendAmount);

      // If user is attempting to send less than minimum accepted by the backend
      if (value.lt(new BigNumber(fromSmallestDenomination(currency.dustSats).toString()))) {
        // Throw the same error given by the backend attempting to broadcast such a tx
        throw new Error('dust');
      }

      const inputUtxos = [];
      const transactionBuilder: any = new XPI.TransactionBuilder();

      const satoshisToSend = toSmallestDenomination(value);

      // Throw validation error if toSmallestDenomination returns false
      if (!satoshisToSend) {
        throw new Error(intl.get('send.invalidDecimalPlaces'));
      }

      if (satoshisToSend.lt(currency.dustSats)) {
        throw new Error(intl.get('send.sendAmountSmallerThanDust'));
      }

      let script;
      let opReturnBuffer;
      // Start of building the OP_RETURN output.
      // only build the OP_RETURN output if the user supplied it
      if (optionalOpReturnMsg && typeof optionalOpReturnMsg !== 'undefined') {
        if (encryptionFlag) {
          // build the OP_RETURN script with the encryption prefix
          script = [
            XPI.Script.opcodes.OP_RETURN, // 6a
            Buffer.from(currency.opReturn.appPrefixesHex.lotusChatEncrypted, 'hex'), // 03030303
            Buffer.from(optionalOpReturnMsg)
          ];
        } else {
          // this is un-encrypted message
          script = [
            XPI.Script.opcodes.OP_RETURN, // 6a
            Buffer.from(currency.opReturn.appPrefixesHex.lotusChat, 'hex'), // 02020202
            Buffer.from(optionalOpReturnMsg)
          ];
        }
        opReturnBuffer = XPI.Script.encode(script);
        transactionBuilder.addOutput(opReturnBuffer, 0);
      }
      // End of building the OP_RETURN output.

      let originalAmount = new BigNumber(0);
      let txFee = 0;
      for (let i = 0; i < utxos.length; i++) {
        const utxo = utxos[i];
        originalAmount = originalAmount.plus(utxo.value);
        const vout = utxo.vout;
        const txid = utxo.txid;
        // add input with txid and index of vout
        transactionBuilder.addInput(txid, vout);

        inputUtxos.push(utxo);
        const opReturnLength = opReturnBuffer ? opReturnBuffer.length : 0;
        txFee = calcFee(XPI, inputUtxos, 2, feeInSatsPerByte, opReturnLength);

        if (originalAmount.minus(satoshisToSend).minus(txFee).gte(0)) {
          break;
        }
      }
      console.log(satoshisToSend);
      console.log(txFee);

      // amount to send back to the remainder address.
      const remainder = originalAmount.minus(satoshisToSend).minus(txFee);

      if (remainder.lt(0)) {
        throw new Error(intl.get('send.insufficientFund'));
      }

      // add output w/ address and amount to send
      transactionBuilder.addOutput(destinationAddress, parseInt(toSmallestDenomination(value).toString()));

      if (remainder.gte(new BigNumber(currency.dustSats))) {
        transactionBuilder.addOutput(sourceAddress, parseInt(remainder.toString()));
      }

      // Sign the transactions with the HD node.
      for (let i = 0; i < inputUtxos.length; i++) {
        const utxo = inputUtxos[i];
        transactionBuilder.sign(i, inputKeyPair, undefined, transactionBuilder.hashTypes.SIGHASH_ALL, utxo.value);
      }

      // build tx
      const tx = transactionBuilder.build();
      // output rawhex
      const hex = tx.toHex();

      // Broadcast transaction to the network
      const data = await XPI.RawTransactions.sendRawTransaction([hex]);

      return data;
    } catch (err) {
      if (err.error === 'insufficient priority (code 66)') {
        err = new Error(intl.get('send.insufficientPriority'));
      } else if (err.error === 'txn-mempool-conflict (code 18)') {
        err = new Error('txn-mempool-conflict');
      } else if (err.error === 'Network Error') {
        err = new Error(intl.get('send.networkError'));
      } else if (err.error === 'too-long-mempool-chain, too many unconfirmed ancestors [limit: 25] (code 64)') {
        err = new Error(intl.get('send.longMempoolChain'));
      }
      throw err;
    }
  };

  //   const flattenTransactions = (
  //     txHistory: TxHistoryTransaction[],
  //     txCount: number = currency.txHistoryCount,
  // ) => {
  //     /*
  //         Convert txHistory, format
  //         [{address: '', transactions: [{height: '', tx_hash: ''}, ...{}]}, {}, {}]

  //         to flatTxHistory
  //         [{txid: '', blockheight: '', address: ''}]
  //         sorted by blockheight, newest transactions to oldest transactions
  //     */
  //     let flatTxHistory = [];
  //     let includedTxids = [];
  //     for (let i = 0; i < txHistory.length; i += 1) {
  //         const { address, transactions } = txHistory[i];
  //         for (let j = transactions.length - 1; j >= 0; j -= 1) {
  //             let flatTx = {};
  //             flatTx.address = address;
  //             // If tx is unconfirmed, give arbitrarily high blockheight
  //             flatTx.height =
  //                 transactions[j].height <= 0
  //                     ? 10000000
  //                     : transactions[j].height;
  //             flatTx.txid = transactions[j].tx_hash;
  //             // Only add this tx if the same transaction is not already in the array
  //             // This edge case can happen with older wallets, txs can be on multiple paths
  //             if (!includedTxids.includes(flatTx.txid)) {
  //                 includedTxids.push(flatTx.txid);
  //                 flatTxHistory.push(flatTx);
  //             }
  //         }
  //     }

  //     // Sort with most recent transaction at index 0
  //     flatTxHistory.sort((a, b) => b.height - a.height);
  //     // Only return 10

  //     return flatTxHistory.splice(0, txCount);
  // };

  //   const getTxHistory = async (XPI: BCHJS, addresses: string[]) {
  //     let txHistoryResponse: TxHistoryResponse;
  //       try {
  //           txHistoryResponse = await XPI.Electrumx.transactions(addresses);

  //           if (txHistoryResponse.success && txHistoryResponse.transactions) {
  //               return txHistoryResponse.transactions;
  //           } else {
  //               // eslint-disable-next-line no-throw-literal
  //               throw new Error('Error in getTxHistory');
  //           }
  //       } catch (err) {
  //           console.log(`Error in BCH.Electrumx.transactions(addresses):`);
  //           console.log(err);
  //           return err;
  //       }
  //   }

  //   const getTxData = async (BCH, txHistory, publicKeys, wallet) => {
  //     // Flatten tx history
  //     let flatTxs = flattenTransactions(txHistory);

  //     // Build array of promises to get tx data for all 10 transactions
  //     let txDataPromises = [];
  //     for (let i = 0; i < flatTxs.length; i += 1) {
  //         const txDataPromise = await getTxDataWithPassThrough(
  //             BCH,
  //             flatTxs[i],
  //         );
  //         txDataPromises.push(txDataPromise);
  //     }

  //     // Get txData for the 10 most recent transactions
  //     let txDataPromiseResponse;
  //     try {
  //         txDataPromiseResponse = await Promise.all(txDataPromises);

  //         const parsed = parseTxData(BCH, txDataPromiseResponse, publicKeys, wallet);

  //         return parsed;
  //     } catch (err) {
  //         console.log(`Error in Promise.all(txDataPromises):`);
  //         console.log(err);
  //         return err;
  //     }
  // };

  return {
    getXPI,
    getRestUrl,
    calcFee,
    getXPIWallet,
    sendAmount,
    sendXpi
  };
}
