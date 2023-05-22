import BCHJS from '@bcpros/xpi-js';
import { WalletPathAddressInfo, WalletState } from '@store/wallet';
import BigNumber from 'bignumber.js';
import { Utxo } from 'chronik-client';
import { currency } from '../components/Common/Ticker';
import { createSharedKey, decrypt, encrypt } from './encryption';

export type TxInputObj = {
  txBuilder: any;
  totalInputUtxoValue: BigNumber;
  inputUtxos: Array<Utxo & { address: string }>;
  txFee: number;
};

export const fromLegacyDecimals = (amount, cashDecimals = currency.cashDecimals) => {
  // Input 0.00000546 BCH
  // Output 5.46 XEC or 0.00000546 BCH, depending on currency.cashDecimals
  const amountBig = new BigNumber(amount);
  const conversionFactor = new BigNumber(10 ** (8 - cashDecimals));
  const amountSmallestDenomination = amountBig.times(conversionFactor).toNumber();
  return amountSmallestDenomination;
};

export const fromSmallestDenomination = (amount, cashDecimals = currency.cashDecimals) => {
  const amountBig = new BigNumber(amount);
  const multiplier = new BigNumber(10 ** (-1 * cashDecimals));
  const amountInBaseUnits = amountBig.times(multiplier);
  return amountInBaseUnits.toNumber();
};

export const toSmallestDenomination = (sendAmount: BigNumber, cashDecimals = currency.cashDecimals) => {
  // Replace the BCH.toSatoshi method with an equivalent function that works for arbitrary decimal places
  // Example, for an 8 decimal place currency like Bitcoin
  // Input: a BigNumber of the amount of Bitcoin to be sent
  // Output: a BigNumber of the amount of satoshis to be sent, or false if input is invalid

  // Validate
  // Input should be a BigNumber with no more decimal places than cashDecimals
  const isValidSendAmount = BigNumber.isBigNumber(sendAmount) && sendAmount.dp() <= cashDecimals;
  if (!isValidSendAmount) {
    return false;
  }
  const conversionFactor = new BigNumber(10 ** cashDecimals);
  const sendAmountSmallestDenomination = sendAmount.times(conversionFactor);
  return sendAmountSmallestDenomination;
};

export const fromXpiToSatoshis = (sendAmount: BigNumber, cashDecimals = currency.cashDecimals): BigNumber | false => {
  const isValidSendAmount = BigNumber.isBigNumber(sendAmount) && sendAmount.dp() <= cashDecimals;
  if (!isValidSendAmount) {
    return false;
  }
  const conversionFactor = new BigNumber(10 ** cashDecimals);
  const sendAmountSmallestDenomination = sendAmount.times(conversionFactor);
  return sendAmountSmallestDenomination;
};

export const fromSatoshisToXpi = (amount, cashDecimals = currency.cashDecimals): BigNumber => {
  const amountBig = new BigNumber(amount);
  const multiplier = new BigNumber(10 ** (-1 * cashDecimals));
  const amountInBaseUnits = amountBig.times(multiplier);
  return amountInBaseUnits;
};

export const parseXpiSendValue = (
  isOneToMany: boolean,
  singleSendValue: Nullable<string>,
  destinationAddressAndValueArray: Nullable<Array<string>>
): BigNumber => {
  let value = new BigNumber(0);

  try {
    if (isOneToMany) {
      // this is a one to many transaction
      if (!destinationAddressAndValueArray || !destinationAddressAndValueArray.length) {
        throw new Error('Invalid destinationAddressAndValueArray');
      }
      const arrayLength = destinationAddressAndValueArray.length;
      for (let i = 0; i < arrayLength; i++) {
        // add the total value being sent in this array of recipients
        // each array row is: 'eCash address, send value'
        value = BigNumber.sum(value, new BigNumber(destinationAddressAndValueArray[i].split(',')[1]));
      }
    } else {
      // this is a one to one XEC transaction then check singleSendValue
      // note: one to many transactions won't be sending a singleSendValue param

      if (!singleSendValue) {
        throw new Error('Invalid singleSendValue');
      }

      value = new BigNumber(singleSendValue);
    }
    // If user is attempting to send an aggregate value that is less than minimum accepted by the backend
    if (value.lt(new BigNumber(fromSmallestDenomination(currency.dustSats).toString()))) {
      // Throw the same error given by the backend attempting to broadcast such a tx
      throw new Error('dust');
    }
  } catch (err) {
    console.log('Error in parseXpiSendValue: ' + err);
    throw err;
  }
  return value;
};

export const getByteCount = (p2pkhInputCount: number, p2pkhOutputCount: number): number => {
  // Simplifying bch-js function for P2PKH txs only, as this is all Cashtab supports for now
  // https://github.com/Permissionless-Software-Foundation/bch-js/blob/master/src/bitcoincash.js#L408
  /*
  const types = {
      inputs: {            
          'P2PKH': 148 * 4,
      },
      outputs: {
          P2PKH: 34 * 4,
      },
  };
  */

  const inputCount = new BigNumber(p2pkhInputCount);
  const outputCount = new BigNumber(p2pkhOutputCount);
  const inputWeight = new BigNumber(148 * 4);
  const outputWeight = new BigNumber(34 * 4);
  const nonSegwitWeightConstant = new BigNumber(10 * 4);
  let totalWeight = new BigNumber(0);
  totalWeight = totalWeight
    .plus(inputCount.times(inputWeight))
    .plus(outputCount.times(outputWeight))
    .plus(nonSegwitWeightConstant);
  const byteCount = totalWeight.div(4).integerValue(BigNumber.ROUND_CEIL);

  return Number(byteCount);
};

export const calcFee = (
  utxos: Array<Utxo>,
  p2pkhOutputNumber = 2,
  satoshisPerByte = currency.defaultFee,
  opReturnLength = 0
) => {
  const byteCount = getByteCount(utxos.length, p2pkhOutputNumber);

  let opReturnOutputByteLength = opReturnLength;
  if (opReturnLength) {
    opReturnOutputByteLength += 8 + 1;
  }
  const txFee = Math.ceil(satoshisPerByte * (byteCount + opReturnOutputByteLength));
  return txFee;
};

export const generateTxInput = (
  XPI: BCHJS,
  isOneToMany: boolean,
  utxos: Array<Utxo & { address: string }>,
  txBuilder: any,
  destinationAddressAndValueArray: Array<any>,
  satoshisToSend,
  feeInSatsPerByte
): TxInputObj => {
  const inputUtxos = [];
  let txFee = 0;
  let totalInputUtxoValue = new BigNumber(0);
  try {
    if (
      !XPI ||
      (isOneToMany && !destinationAddressAndValueArray) ||
      !utxos ||
      !txBuilder ||
      !satoshisToSend ||
      !feeInSatsPerByte
    ) {
      throw new Error('Invalid tx input parameter');
    }

    // A normal tx will have 2 outputs, destination and change
    // A one to many tx will have n outputs + 2 change output, where n is the number of recipients, 1 destination and 1 change
    const txOutputs = isOneToMany ? destinationAddressAndValueArray.length + 2 : 2;
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      totalInputUtxoValue = totalInputUtxoValue.plus(utxo.value);
      const vout = utxo.outpoint.outIdx;
      const txid = utxo.outpoint.txid;
      // add input with txid and index of vout
      txBuilder.addInput(txid, vout);

      inputUtxos.push(utxo);
      txFee = calcFee(inputUtxos, txOutputs, feeInSatsPerByte);

      if (totalInputUtxoValue.minus(satoshisToSend).minus(txFee).gte(0)) {
        break;
      }
    }
  } catch (err) {
    console.log(`generateTxInput() error: ` + err);
    throw err;
  }
  const txInputObj: TxInputObj = {
    txBuilder,
    totalInputUtxoValue,
    inputUtxos,
    txFee
  };

  return txInputObj;
};

export const generateTxOutput = (
  XPI: BCHJS,
  isOneToMany: boolean,
  singleSendValue: Nullable<BigNumber>,
  satoshisToSend: Nullable<BigNumber>,
  totalInputUtxoValue: BigNumber,
  destinationAddress: Nullable<string>,
  destinationAddressAndValueArray: Nullable<Array<string>>,
  changeAddress: Nullable<string>,
  txFee: number,
  txBuilder: any
) => {
  try {
    if (
      !XPI ||
      (isOneToMany && !destinationAddressAndValueArray) ||
      (!isOneToMany && !destinationAddress && !singleSendValue) ||
      !changeAddress ||
      !satoshisToSend ||
      !totalInputUtxoValue ||
      !txFee ||
      !txBuilder
    ) {
      throw new Error('Invalid tx input parameter');
    }

    // amount to send back to the remainder address.
    const remainder = new BigNumber(totalInputUtxoValue).minus(satoshisToSend).minus(txFee);
    if (remainder.lt(0)) {
      throw new Error(`Insufficient funds`);
    }

    if (isOneToMany) {
      // for one to many mode, add the multiple outputs from the array
      const arrayLength = destinationAddressAndValueArray.length;
      for (let i = 0; i < arrayLength; i++) {
        // add each send tx from the array as an output
        const outputAddress = destinationAddressAndValueArray[i].split(',')[0];
        const outputValue = new BigNumber(destinationAddressAndValueArray[i].split(',')[1]);
        txBuilder.addOutput(outputAddress, parseInt(fromXpiToSatoshis(outputValue).toString()));
      }
    } else {
      // for one to one mode, add output w/ single address and amount to send
      txBuilder.addOutput(destinationAddress, parseInt(fromXpiToSatoshis(singleSendValue).toString()));
    }

    // if a remainder exists, return to change address as the final output
    if (remainder.gte(new BigNumber(currency.dustSats))) {
      txBuilder.addOutput(changeAddress, parseInt(remainder.toString()));
    }
  } catch (err) {
    console.log('Error in generateTxOutput(): ' + err);
    throw err;
  }

  return txBuilder;
};

export const signUtxosByAddress = (
  XPI: BCHJS,
  inputUtxos: Array<Utxo & { address: string }>,
  walletPaths: WalletPathAddressInfo[],
  txBuilder
) => {
  for (let i = 0; i < inputUtxos.length; i++) {
    const utxo = inputUtxos[i];
    const utxoEcPair = XPI.ECPair.fromWIF(walletPaths.filter(path => path.xAddress === utxo.address).pop().fundingWif);

    txBuilder.sign(i, utxoEcPair, undefined, txBuilder.hashTypes.SIGHASH_ALL, parseInt(utxo.value));
  }

  return txBuilder;
};

export const signAndBuildTx = (
  XPI: BCHJS,
  inputUtxos: Array<Utxo & { address: string }>,
  txBuilder: any,
  walletPaths: WalletPathAddressInfo[]
): string => {
  if (
    !XPI ||
    !inputUtxos ||
    inputUtxos.length === 0 ||
    !txBuilder ||
    !walletPaths ||
    walletPaths.length === 0 ||
    // txBuilder.transaction.tx.ins is empty until the inputUtxos are signed
    txBuilder.transaction.tx.outs.length === 0
  ) {
    throw new Error('Invalid buildTx parameter');
  }

  // Sign each XEC UTXO being consumed and refresh transactionBuilder
  txBuilder = signUtxosByAddress(XPI, inputUtxos, walletPaths, txBuilder);

  let hex;
  try {
    // build tx
    const tx = txBuilder.build();
    // output rawhex
    hex = tx.toHex();
  } catch (err) {
    throw new Error('Transaction build failed');
  }
  return hex;
};

/*
 * Generates an OP_RETURN script to reflect the various send XPI permutations
 * involving messaging, encryption.
 *
 * Returns the final encoded script object
 */
export const generateOpReturnScript = (
  XPI: BCHJS,
  optionalOpReturnMsg: string,
  encryptionFlag: boolean,
  encryptedEj: Uint8Array
): Buffer => {
  // encrypted mesage is mandatory when encryptionFlag is true
  if (!XPI || (encryptionFlag && !optionalOpReturnMsg)) {
    throw new Error('Invalid OP RETURN script input');
  }

  let script;

  try {
    if (encryptionFlag) {
      // if the user has opted to encrypt this message
      script = [
        XPI.Script.opcodes.OP_RETURN, // 6a
        Buffer.from(currency.opReturn.appPrefixesHex.lotusChatEncrypted, 'hex'), // 03030303
        Buffer.from(encryptedEj)
      ];
    } else if (optionalOpReturnMsg) {
      // this is an un-encrypted message
      script = [
        XPI.Script.opcodes.OP_RETURN, // 6a
        Buffer.from(currency.opReturn.appPrefixesHex.lotusChat, 'hex'), // 02020202
        Buffer.from(optionalOpReturnMsg)
      ];
    }
    const data: Buffer = XPI.Script.encode(script);
    return data;
  } catch (err) {
    console.log('Error in generateOpReturnScript(): ' + err);
    throw err;
  }
};

export const getChangeAddressFromInputUtxos = (XPI: BCHJS, inputUtxos: Array<Utxo & { address: string }>): string => {
  if (!XPI || !inputUtxos) {
    throw new Error('Invalid getChangeAddressFromWallet input parameter');
  }

  // Assume change address is input address of utxo at index 0
  let changeAddress;

  // Validate address
  try {
    changeAddress = inputUtxos[0].address;
    const isValidXAddress = XPI.Address.isXAddress(changeAddress);
    if (!isValidXAddress) {
      throw new Error('Invalid change address');
    }
  } catch (err) {
    throw new Error('Invalid input utxo');
  }
  return changeAddress;
};

export const getDustXPI = () => {
  return (currency.dustSats / 10 ** currency.cashDecimals).toString();
};

export const formatBalance = x => {
  try {
    const balanceInParts = x.toString().split('.');
    balanceInParts[0] = balanceInParts[0].replace(/\B(?=(\d{2})+(?!\d))/g, '');
    if (balanceInParts.length > 1) {
      balanceInParts[1] = balanceInParts[1].slice(0, 2);
    }
    return balanceInParts.join('.');
  } catch (err) {
    console.log(`Error in formatBalance for ${x}`);
    console.log(err);
    return x;
  }
};

export const normalizeBalance = slpBalancesAndUtxos => {
  const totalBalanceInSatoshis = slpBalancesAndUtxos.nonSlpUtxos.reduce(
    (previousBalance, utxo) => previousBalance + utxo.value,
    0
  );
  return {
    totalBalanceInSatoshis,
    totalBalance: fromSmallestDenomination(totalBalanceInSatoshis)
  };
};

export const getWalletBalanceFromUtxos = (nonSlpUtxos: Utxo[]) => {
  const totalBalanceInSatoshis = nonSlpUtxos.reduce(
    (previousBalance, utxo) => previousBalance.plus(new BigNumber(utxo.value)),
    new BigNumber(0)
  );
  return {
    totalBalanceInSatoshis: totalBalanceInSatoshis.toString(),
    totalBalance: fromSmallestDenomination(totalBalanceInSatoshis).toString()
  };
};

export const isValidStoredWallet = walletStateFromStorage => {
  return (
    typeof walletStateFromStorage === 'object' &&
    'state' in walletStateFromStorage &&
    typeof walletStateFromStorage.state === 'object' &&
    'balances' in walletStateFromStorage.state &&
    'utxos' in walletStateFromStorage.state &&
    'hydratedUtxoDetails' in walletStateFromStorage.state &&
    'slpBalancesAndUtxos' in walletStateFromStorage.state &&
    'tokens' in walletStateFromStorage.state
  );
};

export const getWalletState = wallet => {
  if (!wallet) {
    return {
      balance: 0,
      parsedTxHistory: [],
      utxos: []
    };
  }

  return {
    ...wallet,
    balance: fromSmallestDenomination(wallet?.balance || 0)
  };
};

export const getUtxoWif = (utxo: Utxo & { address: string }, walltPaths: Array<WalletPathAddressInfo>) => {
  if (!walltPaths) {
    throw new Error('Invalid wallet parameter');
  }
  const wif = walltPaths.filter(acc => acc.xAddress === utxo.address).pop().fundingWif;
  return wif;
};

export const getHashArrayFromWallet = (wallet: WalletState): string[] => {
  if (!wallet || !wallet?.entities) {
    return [];
  }
  const hash160Array = Object.entries(wallet.entities).map(([key, value]) => {
    return value.hash160;
  });
  return hash160Array;
};

export const isActiveWebsocket = ws => {
  // Return true if websocket is connected and subscribed
  // Otherwise return false
  return (
    ws !== null &&
    ws &&
    '_ws' in ws &&
    'readyState' in ws._ws &&
    ws._ws.readyState === 1 &&
    '_subs' in ws &&
    ws._subs.length > 0
  );
};

/**
 * Parse the OP_RETURN data of the output
 * @param hexStr The hex string of the output scriptpubkey
 * @returns Array contains transaction type and message's hex
 */
export function parseOpReturn(hexStr: string): Array<string> | false {
  if (!hexStr || typeof hexStr !== 'string' || hexStr.substring(0, 2) !== currency.opReturn.opReturnPrefixHex) {
    return false;
  }

  hexStr = hexStr.slice(2); // remove the first byte i.e. 6a
  /*
   * @Return: resultArray is structured as follows:
   *  resultArray[0] is the transaction type i.e. eToken prefix, sendlotus prefix, external message itself if unrecognized prefix
   *  resultArray[1] is the actual sendlotus message or the 2nd part of an external message
   *  resultArray[2 - n] are the additional messages for future protcols
   */
  const resultArray = [];
  let message = '';
  let hexStrLength = hexStr.length;

  for (let i = 0; hexStrLength !== 0; i++) {
    // part 1: check the preceding byte value for the subsequent message
    const byteValue = hexStr.substring(0, 2);
    let msgByteSize = 0;
    if (byteValue === currency.opReturn.opPushDataOne) {
      // if this byte is 4c then the next byte is the message byte size - retrieve the message byte size only
      msgByteSize = parseInt(hexStr.substring(2, 4), 16); // hex base 16 to decimal base 10
      hexStr = hexStr.slice(4); // strip the 4c + message byte size info
    } else {
      // take the byte as the message byte size
      msgByteSize = parseInt(hexStr.substring(0, 2), 16); // hex base 16 to decimal base 10
      hexStr = hexStr.slice(2); // strip the message byte size info
    }

    // part 2: parse the subsequent message based on bytesize
    const msgCharLength = 2 * msgByteSize;
    message = hexStr.substring(0, msgCharLength);
    if (i === 0 && message === currency.opReturn.appPrefixesHex.eToken) {
      // add the extracted eToken prefix to array then exit loop
      resultArray[i] = currency.opReturn.appPrefixesHex.eToken;
      break;
    } else if (i === 0 && message === currency.opReturn.appPrefixesHex.lotusChat) {
      // add the extracted Sendlotus prefix to array
      resultArray[i] = currency.opReturn.appPrefixesHex.lotusChat;
    } else if (i === 0 && message === currency.opReturn.appPrefixesHex.lotusChatEncrypted) {
      // add the Sendlotus encryption prefix to array
      resultArray[i] = currency.opReturn.appPrefixesHex.lotusChatEncrypted;
    } else {
      // this is either an external message or a subsequent sendlotus message loop to extract the message
      resultArray[i] = message;
    }

    // strip out the parsed message
    hexStr = hexStr.slice(msgCharLength);
    hexStrLength = hexStr.length;
  }

  return resultArray;
}

export const encryptOpReturnMsg = (
  privateKeyWIF: string,
  recipientPubKeyHex: string,
  plainTextMsg: string
): Uint8Array => {
  let encryptedMsg;
  try {
    const sharedKey = createSharedKey(privateKeyWIF, recipientPubKeyHex);
    encryptedMsg = encrypt(sharedKey, Uint8Array.from(Buffer.from(plainTextMsg)));
  } catch (error) {
    console.log('ENCRYPTION ERROR', error);
    throw error;
  }

  return encryptedMsg;
};

export const decryptOpReturnMsg = async (opReturnMsgHex: string, privateKeyWIF: string, publicKeyHex: string) => {
  try {
    const sharedKey = createSharedKey(privateKeyWIF, publicKeyHex);
    const decryptedMsg = decrypt(sharedKey, Uint8Array.from(Buffer.from(opReturnMsgHex, 'hex')));
    return {
      success: true,
      decryptedMsg
    };
  } catch (error) {
    console.log('DECRYPTION ERROR', error);
    return {
      success: false,
      error
    };
  }
};

export const getAddressesOfWallet = wallet => {
  const addresses = [];
  if (wallet) {
    if (wallet.Path10605 && wallet.Path10605.xAddress) {
      addresses.push(wallet.Path10605.xAddress);
    }
    if (wallet.Path1899 && wallet.Path1899.xAddress) {
      addresses.push(wallet.Path1899.xAddress);
    }
    if (wallet.Path899 && wallet.Path899.xAddress) {
      addresses.push(wallet.Path899.xAddress);
    }
  }

  return addresses;
};
