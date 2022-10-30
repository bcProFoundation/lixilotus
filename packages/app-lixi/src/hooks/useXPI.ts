import { currency } from '@bcpros/lixi-models/constants/ticker';
import { fromSmallestDenomination, toSmallestDenomination } from '@bcpros/lixi-models/utils/cashMethods';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import BigNumber from 'bignumber.js';
import { ChronikClient, TxHistoryPage } from 'chronik-client';
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
      restURL: getRestUrl(apiIndex)
    });
    return ConstructedSlpWallet.bchjs as BCHJS;
  };

  const getXPIWallet = (apiIndex = 0): any => {
    let ConstructedSlpWallet;

    ConstructedSlpWallet = new SlpWallet('', {
      restURL: getRestUrl(apiIndex)
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

  const getRecipientPublicKey = async (
    XPI: BCHJS,
    chronik: ChronikClient,
    recipientAddress: string,
    optionalMockPubKeyResponse = false,
  ): Promise<string | boolean> => {
    // Necessary because jest can't mock
    // chronikTxHistoryAtAddress = await chronik.script('p2pkh', recipientAddressHash160).history(/*page=*/ 0, /*page_size=*/ 10);
    if (optionalMockPubKeyResponse) {
      return optionalMockPubKeyResponse;
    }

    // get hash160 of address
    let recipientAddressHash160: string;
    try {
      recipientAddressHash160 = XPI.Address.toHash160(recipientAddress);
    } catch (err) {
      console.log(
        `Error determining XPI.Address.toHash160(${recipientAddress} in getRecipientPublicKey())`,
        err,
      );
      throw new Error(
        `Error determining XPI.Address.toHash160(${recipientAddress} in getRecipientPublicKey())`,
      );
    }

    let chronikTxHistoryAtAddress: TxHistoryPage
    try {
      // Get 20 txs. If no outgoing txs in those 20 txs, just don't send the tx
      chronikTxHistoryAtAddress = await chronik
        .script('p2pkh', recipientAddressHash160)
        .history(/*page=*/ 0, /*page_size=*/ 40);
    } catch (err) {
      console.log(
        `Error getting await chronik.script('p2pkh', ${recipientAddressHash160}).history();`,
        err,
      );
      throw new Error(
        'Error fetching tx history to parse for public key',
      );
    }
    let recipientPubKeyChronik;

    // Iterate over tx history to find an outgoing tx
    for (let i = 0; i < chronikTxHistoryAtAddress.txs.length; i += 1) {
      const { inputs } = chronikTxHistoryAtAddress.txs[i];
      for (let j = 0; j < inputs.length; j += 1) {
        const thisInput = inputs[j];
        const thisInputSendingHash160 = thisInput.outputScript;
        if (thisInputSendingHash160.includes(recipientAddressHash160)) {
          // Then this is an outgoing tx, you can get the public key from this tx
          // Get the public key
          try {
            recipientPubKeyChronik =
              chronikTxHistoryAtAddress.txs[i].inputs[
                j
              ].inputScript.slice(-66);
          } catch (err) {
            throw new Error(
              'Cannot send an encrypted message to a wallet with no outgoing transactions',
            );
          }
          return recipientPubKeyChronik;
        }
      }
    }
    // You get here if you find no outgoing txs in the chronik tx history
    throw new Error(
      'Cannot send an encrypted message to a wallet with no outgoing transactions in the last 20 txs',
    );
  };

  return {
    getXPI,
    getRestUrl,
    calcFee,
    getXPIWallet,
    sendAmount,
    sendXpi,
    getRecipientPublicKey
  } as const;
}
