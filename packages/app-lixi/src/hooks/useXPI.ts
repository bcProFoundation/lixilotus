import { BurnForType, BurnType } from '@bcpros/lixi-models';
import { currency } from '@bcpros/lixi-models/constants/ticker';
import SlpWallet from '@bcpros/minimal-xpi-slp-wallet';
import BCHJS from '@bcpros/xpi-js';
import { WalletPathAddressInfo } from '@store/wallet';
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
import { generateBurnTxOutput } from '@utils/opReturnBurn';
import BigNumber from 'bignumber.js';
import { ChronikClient, Utxo } from 'chronik-client';
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
    fundingWif: string,
    returnHex?: boolean
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

      if (!returnHex) {
        // if the user has opted to encrypt this message
        if (encryptionFlag && optionalOpReturnMsg) {
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

      if (returnHex) {
        return rawTxHex;
      } else {
        // return the explorer link for the broadcasted tx
        return `${currency.blockExplorerUrl}/tx/${broadcastResponse.txid}`;
      }
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

  const sendXpiRaw = async (
    XPI: BCHJS,
    chronik: ChronikClient,
    walletPaths: WalletPathAddressInfo[],
    utxos: Array<Utxo & { address: string }>,
    feeInSatsPerByte: number,
    isOneToMany: boolean,
    destinationAddressAndValueArray: Array<string>,
    destinationAddress: string,
    sendAmount: string,
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

      return rawTxHex;
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

  const burnXpi = async (
    XPI: BCHJS,
    walletPaths: WalletPathAddressInfo[],
    utxos: Array<Utxo & { address: string }>,
    feeInSatsPerByte: number,
    burnType: BurnType,
    burnForType: BurnForType,
    burnedBy: string | Buffer,
    burnForId: string,
    burnAmount: string,
    tipToAddresses?: { address: string; amount: string }[]
  ): Promise<string> => {
    let txBuilder = new XPI.TransactionBuilder();

    const satoshisToBurn = fromXpiToSatoshis(new BigNumber(burnAmount));

    // Throw validation error if fromXecToSatoshis returns false
    if (!satoshisToBurn) {
      const error = new Error(`Invalid burn amount`);
      throw error;
    }

    // generate the tx inputs and add to txBuilder instance
    // returns the updated txBuilder, txFee, totalInputUtxoValue and inputUtxos
    let destinationAddresses = tipToAddresses.map(item => item.address);
    destinationAddresses.push('Burned Coins');
    let txInputObj = generateTxInput(
      XPI,
      tipToAddresses ? true : false,
      utxos,
      txBuilder,
      destinationAddresses ?? null,
      satoshisToBurn,
      feeInSatsPerByte
    );
    const changeAddress = getChangeAddressFromInputUtxos(XPI, txInputObj.inputUtxos);

    // generate the tx outputs with burn output
    // and add to txBuilder instance
    // returns the updated txBuilder
    const txOutputObj = generateBurnTxOutput(
      XPI,
      feeInSatsPerByte,
      satoshisToBurn,
      burnType,
      burnForType,
      burnedBy,
      burnForId,
      txInputObj.totalInputUtxoValue,
      changeAddress,
      txInputObj.txFee,
      txBuilder,
      tipToAddresses
    );
    txBuilder = txOutputObj; // update the local txBuilder with the generated tx outputs

    const rawTxHex: string = signAndBuildTx(XPI, txInputObj.inputUtxos, txBuilder, walletPaths);

    return rawTxHex;
  };

  return {
    getXPI,
    getRestUrl,
    calcFee,
    sendXpi,
    sendXpiRaw,
    burnXpi
  } as const;
}
