import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { WalletPathAddressInfo, WalletState } from '@store/wallet';
import BigNumber from 'bignumber.js';
import { Utxo } from 'chronik-client';
import { createSharedKey, decrypt } from './encryption';
// import cashaddr from 'ecashaddrjs';

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

export const toSmallestDenomination = (sendAmount, cashDecimals = currency.cashDecimals) => {
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

export const getDustXPI = () => {
  return (currency.dustSats / 10 ** currency.cashDecimals).toString();
};

export const formatBalance = x => {
  try {
    let balanceInParts = x.toString().split('.');
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

// export const batchArray = (inputArray, batchSize) => {
//     // take an array of n elements, return an array of arrays each of length batchSize

//     const batchedArray = [];
//     for (let i = 0; i < inputArray.length; i += batchSize) {
//         const tempArray = inputArray.slice(i, i + batchSize);
//         batchedArray.push(tempArray);
//     }
//     return batchedArray;
// };

export const loadStoredWallet = walletStateFromStorage => {
  // Accept cached tokens array that does not save BigNumber type of BigNumbers
  // Return array with BigNumbers converted
  // See BigNumber.js api for how to create a BigNumber object from an object
  // https://mikemcl.github.io/bignumber.js/
  const liveWalletState = walletStateFromStorage;
  const { slpBalancesAndUtxos, tokens } = liveWalletState;
  for (let i = 0; i < tokens.length; i += 1) {
    const thisTokenBalance = tokens[i].balance;
    thisTokenBalance._isBigNumber = true;
    tokens[i].balance = new BigNumber(thisTokenBalance);
  }

  // Also confirm balance is correct
  // Necessary step in case currency.decimals changed since last startup
  const balancesRebased = normalizeBalance(slpBalancesAndUtxos);
  liveWalletState.balances = balancesRebased;
  return liveWalletState;
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
    (previousBalance, utxo) =>
      previousBalance.plus(new BigNumber(utxo.value)),
    new BigNumber(0),
  );
  return {
    totalBalanceInSatoshis: totalBalanceInSatoshis.toString(),
    totalBalance: fromSmallestDenomination(totalBalanceInSatoshis).toString(),
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
  const wif = walltPaths
    .filter(acc => acc.xAddress === utxo.address)
    .pop().fundingWif;
  return wif;
};

export const getHashArrayFromWallet = (wallet: WalletState): string[] => {
  if (!wallet || (!wallet?.entities)) {
    return [];
  }
  const hash160Array = Object.entries(wallet.entities).map(([key, value]) => {
    return value.hash160
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

export function parseOpReturn(hexStr: string): Array<any> | false {
  if (
    !hexStr ||
    typeof hexStr !== 'string' ||
    hexStr.substring(0, 2) !== currency.opReturn.opReturnPrefixHex
  ) {
    return false;
  }

  hexStr = hexStr.slice(2); // remove the first byte i.e. 6a
  /*
     * @Return: resultArray is structured as follows:
     *  resultArray[0] is the transaction type i.e. eToken prefix, sendlotus prefix, external message itself if unrecognized prefix
     *  resultArray[1] is the actual sendlotus message or the 2nd part of an external message
     *  resultArray[2 - n] are the additional messages for future protcols
     */
  let resultArray = [];
  let message = '';
  let hexStrLength = hexStr.length;

  for (let i = 0; hexStrLength !== 0; i++) {
    // part 1: check the preceding byte value for the subsequent message
    let byteValue = hexStr.substring(0, 2);
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
    } else if (
      i === 0 &&
      message === currency.opReturn.appPrefixesHex.lotusChat
    ) {
      // add the extracted Sendlotus prefix to array
      resultArray[i] = currency.opReturn.appPrefixesHex.lotusChat;
    } else if (
      i === 0 &&
      message === currency.opReturn.appPrefixesHex.lotusChatEncrypted
    ) {
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

export const decryptOpReturnMsg = async (opReturnMsg: string, privateKeyWIF: string, publicKeyHex: string) => {
  try {
    const sharedKey = createSharedKey(privateKeyWIF, publicKeyHex);
    const decryptedMsg = decrypt(sharedKey, Uint8Array.from(Buffer.from(opReturnMsg, 'hex')));
    return {
      success: true,
      decryptedMsg
    }
  } catch (error) {
    console.log("DECRYPTION ERROR", error);
    return {
      success: false,
      error
    }
  }
}