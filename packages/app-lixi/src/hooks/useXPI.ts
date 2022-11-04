import { currency } from '@bcpros/lixi-models/constants/ticker';
import { fromSmallestDenomination, toSmallestDenomination } from '@bcpros/lixi-models/utils/cashMethods';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { WalletContextValue } from '@context/walletProvider';
import { WalletPathAddressInfo, WalletState } from '@store/wallet';
import {
  encryptOpReturnMsg,
  fromXpiToSatoshis,
  generateOpReturnScript,
  generateTxInput,
  generateTxOutput,
  getChangeAddressFromInputUtxos,
  parseXpiSendValue,
  signAndBuildTx
} from '@utils/cashMethods';
import { getRecipientPublicKey } from '@utils/chronik';
import BigNumber from 'bignumber.js';
import { ChronikClient, TxHistoryPage, Utxo } from 'chronik-client';
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
    XPI: BCHJS,
    chronik: ChronikClient,
    walletPaths: WalletPathAddressInfo[],
    utxos: Array<Utxo & { address: string }>,
    feeInSatsPerByte: number,
    optionalOpReturnMsg: string,
    isOneToMany: boolean,
    destinationAddressAndValueArray: Array<string>,
    destinationAddress: string,
    sendAmount: string,
    encryptionFlag: boolean,
    fundingWif: string
  ) => {
    try {
      let txBuilder = new XPI.TransactionBuilder();

      // parse the input value of XPIs to send
      const value = parseXpiSendValue(isOneToMany, sendAmount, destinationAddressAndValueArray);

      const satoshisToSend = fromXpiToSatoshis(value);

      // Throw validation error if fromXecToSatoshis returns false
      if (!satoshisToSend) {
        const error = new Error(`Invalid decimal places for send amount`);
        throw error;
      }

      let encryptedEj: Uint8Array; // serialized encryption data object

      // if the user has opted to encrypt this message
      if (encryptionFlag) {
        try {
          // get the pub key for the recipient address
          let recipientPubKey = await getRecipientPublicKey(XPI, chronik, destinationAddress);
          // if the API can't find a pub key, it is due to the wallet having no outbound tx
          if (!recipientPubKey) {
            throw new Error('Cannot send an encrypted message to a wallet with no outgoing transactions');
          }
          if (recipientPubKey) {
            encryptedEj = encryptOpReturnMsg(fundingWif, recipientPubKey, optionalOpReturnMsg);
          }
        } catch (err) {
          console.log(`sendXpi() encryption error.`);
          throw err;
        }
      }

      // Start of building the OP_RETURN output.
      // Only build the OP_RETURN output if the user supplied it
      if (optionalOpReturnMsg && typeof optionalOpReturnMsg !== 'undefined' && optionalOpReturnMsg.trim() !== '') {
        const opReturnData = generateOpReturnScript(XPI, optionalOpReturnMsg, encryptionFlag, encryptedEj);
        txBuilder.addOutput(opReturnData, 0);
      }

      // generate the tx inputs and add to txBuilder instance
      // returns the updated txBuilder, txFee, totalInputUtxoValue and inputUtxos
      let txInputObj = generateTxInput(
        XPI,
        isOneToMany,
        utxos,
        txBuilder,
        destinationAddressAndValueArray,
        satoshisToSend,
        feeInSatsPerByte
      );

      const changeAddress = getChangeAddressFromInputUtxos(XPI, txInputObj.inputUtxos);

      txBuilder = txInputObj.txBuilder; // update the local txBuilder with the generated tx inputs

      // generate the tx outputs and add to txBuilder instance
      // returns the updated txBuilder
      const txOutputObj = generateTxOutput(
        XPI,
        isOneToMany,
        value,
        satoshisToSend,
        txInputObj.totalInputUtxoValue,
        destinationAddress,
        destinationAddressAndValueArray,
        changeAddress,
        txInputObj.txFee,
        txBuilder
      );
      txBuilder = txOutputObj; // update the local txBuilder with the generated tx outputs

      // sign the collated inputUtxos and build the raw tx hex
      // returns the raw tx hex string
      const rawTxHex = signAndBuildTx(XPI, txInputObj.inputUtxos, txBuilder, walletPaths);

      // Broadcast transaction to the network via the chronik client
      let broadcastResponse;
      try {
        broadcastResponse = await chronik.broadcastTx(rawTxHex);
        if (!broadcastResponse) {
          throw new Error('Empty chronik broadcast response');
        }
      } catch (err) {
        console.log('Error broadcasting tx to chronik client');
        throw err;
      }

      // return the explorer link for the broadcasted tx
      return `${currency.blockExplorerUrl}/tx/${broadcastResponse.txid}`;
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

  return {
    getXPI,
    getRestUrl,
    calcFee,
    getXPIWallet,
    sendAmount,
    sendXpi
  } as const;
}
