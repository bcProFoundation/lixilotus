import { currency } from "@bcpros/lixi-models";
import BCHJS from '@bcpros/xpi-js';
import { WalletState } from "@store/wallet";
import BigNumber from 'bignumber.js';
import { ChronikClient, Tx, TxHistoryPage, Utxo } from "chronik-client";
import wif from 'wif';
import { getHashArrayFromWallet, getUtxoWif, parseOpReturn } from "./cashMethods";

export interface Hash160AndAddress {
  address: string;
  hash160: string;
};

const getWalletPathsFromWalletState = (wallet: WalletState) => {
  return Object.entries(wallet.entities).map(([key, value]) => {
    return value;
  });
};

/* 
Note: chronik.script('p2pkh', hash160).utxos(); is not readily mockable in jest
Hence it is necessary to keep this out of any functions that require unit testing
*/
export const getUtxosSingleHashChronik = async (chronik: ChronikClient, hash160: string): Promise<Array<Utxo>> => {
  // Get utxos at a single address, which chronik takes in as a hash160
  let utxos;
  try {
    utxos = await chronik.script('p2pkh', hash160).utxos();
    if (utxos.length === 0) {
      // Chronik returns an empty array if there are no utxos at this hash160
      return [];
    }
    /* Chronik returns an array of with a single object if there are utxos at this hash 160
    [
        {
            outputScript: <hash160>,
            utxos:[{utxo}, {utxo}, ..., {utxo}]
        }
    ]
    */

    // Return only the array of utxos at this address
    return utxos[0].utxos;
  } catch (err) {
    console.log(`Error in chronik.utxos(${hash160})`, err);
  }
};


export const returnGetUtxosChronikPromise = (chronik: ChronikClient, hash160AndAddressObj: Hash160AndAddress): Promise<Array<Utxo & { address: string }>> => {
  /*
      Chronik thinks in hash160s, but people and wallets think in addresses
      Add the address to each utxo
  */
  return new Promise((resolve, reject) => {
    getUtxosSingleHashChronik(chronik, hash160AndAddressObj.hash160).then(
      result => {
        for (let i = 0; i < result.length; i += 1) {
          const thisUtxo = result[i];
          (thisUtxo as any).address = hash160AndAddressObj.address;
        }
        resolve(result as Array<Utxo & { address: string }>);
      },
      err => {
        reject(err);
      },
    );
  });
};

export const getUtxosChronik = async (chronik: ChronikClient, hash160sMappedToAddresses: Array<Hash160AndAddress>): Promise<Array<Utxo & { address: string }>> => {
  /* 
      Chronik only accepts utxo requests for one address at a time
      Construct an array of promises for each address
      Note: Chronik requires the hash160 of an address for this request
  */
  const chronikUtxoPromises: Array<Promise<Array<Utxo & { address: string }>>> = [];
  for (let i = 0; i < hash160sMappedToAddresses.length; i += 1) {
    const thisPromise = returnGetUtxosChronikPromise(
      chronik,
      hash160sMappedToAddresses[i],
    );
    chronikUtxoPromises.push(thisPromise);
  }
  const allUtxos = await Promise.all(chronikUtxoPromises);
  // Since each individual utxo has address information, no need to keep them in distinct arrays
  // Combine into one array of all utxos
  const flatUtxos = allUtxos.flat();
  return flatUtxos;
};

export const organizeUtxosByType = (chronikUtxos: Array<Utxo & { address: string }>): { nonSlpUtxos: Array<Utxo & { address: string }> } => {
  /* 
  
  Convert chronik utxos (returned by getUtxosChronik function, above) to match 
  shape of existing slpBalancesAndUtxos object
  
  */

  const nonSlpUtxos = [];
  for (let i = 0; i < chronikUtxos.length; i += 1) {
    // Construct nonSlpUtxos and slpUtxos arrays
    const thisUtxo = chronikUtxos[i];
    if (typeof thisUtxo.slpToken !== 'undefined') {
    } else {
      nonSlpUtxos.push(thisUtxo);
    }
  }

  return { nonSlpUtxos };
};

export const flattenChronikTxHistory = txHistoryOfAllAddresses => {
  // Create an array of all txs

  let flatTxHistoryArray = [];
  for (let i = 0; i < txHistoryOfAllAddresses.length; i += 1) {
    const txHistoryResponseOfThisAddress = txHistoryOfAllAddresses[i];
    const txHistoryOfThisAddress = txHistoryResponseOfThisAddress.txs;
    flatTxHistoryArray = flatTxHistoryArray.concat(txHistoryOfThisAddress);
  }
  return flatTxHistoryArray;
};

// @todo
export const sortAndTrimChronikTxHistory = (
  flatTxHistoryArray,
  txHistoryCount,
) => {
  // Isolate unconfirmed txs
  // In chronik, unconfirmed txs have an `undefined` block key
  const unconfirmedTxs = [];
  const confirmedTxs = [];
  for (let i = 0; i < flatTxHistoryArray.length; i += 1) {
    const thisTx = flatTxHistoryArray[i];
    if (typeof thisTx.block === 'undefined') {
      unconfirmedTxs.push(thisTx);
    } else {
      confirmedTxs.push(thisTx);
    }
  }
  // Sort confirmed txs by blockheight, and then timeFirstSeen
  const sortedConfirmedTxHistoryArray = confirmedTxs.sort(
    (a, b) =>
      // We want more recent blocks i.e. higher blockheights to have earlier array indices
      b.block.height - a.block.height ||
      // For blocks with the same height, we want more recent timeFirstSeen i.e. higher timeFirstSeen to have earlier array indices
      b.timeFirstSeen - a.timeFirstSeen,
  );
  // Sort unconfirmed txs by timeFirstSeen
  const sortedUnconfirmedTxHistoryArray = unconfirmedTxs.sort(
    (a, b) => b.timeFirstSeen - a.timeFirstSeen,
  );
  // The unconfirmed txs are more recent, so they should be inserted into an array before the confirmed txs
  const sortedChronikTxHistoryArray = sortedUnconfirmedTxHistoryArray.concat(
    sortedConfirmedTxHistoryArray,
  );

  const trimmedAndSortedChronikTxHistoryArray =
    sortedChronikTxHistoryArray.splice(0, txHistoryCount);

  return trimmedAndSortedChronikTxHistoryArray;
};

export const returnGetTxHistoryChronikPromise = (
  chronik: ChronikClient,
  hash160AndAddressObj: Hash160AndAddress,
): Promise<TxHistoryPage> => {
  /*
      Chronik thinks in hash160s, but people and wallets think in addresses
      Add the address to each utxo
  */
  return new Promise((resolve, reject) => {
    chronik
      .script('p2pkh', hash160AndAddressObj.hash160)
      .history(/*page=*/ 0, /*page_size=*/ currency.txHistoryCount)
      .then(
        result => {
          resolve(result);
        },
        err => {
          reject(err);
        },
      );
  });
};

export const parseChronikTx = async (XPI: BCHJS, tx: Tx, wallet: WalletState) => {
  const walletHash160s: string[] = getHashArrayFromWallet(wallet);
  const { inputs, outputs } = tx;
  // Assign defaults
  let incoming = true;
  let xpiAmount = new BigNumber(0);
  let originatingHash160 = '';

  // Initialize required variables
  let substring = '';
  let opReturnMessage: Buffer | string;
  let isLotusMessage = false;
  let isEncryptedMessage = false;
  let decryptionSuccess = false;
  let replyAddress = '';
  let destinationAddress = '';

  // Iterate over inputs to see if this is an incoming tx (incoming === true)
  for (let i = 0; i < inputs.length; i += 1) {
    const thisInput = inputs[i];
    const thisInputSendingHash160 = thisInput.outputScript;
    /* 
    
    Assume the first input is the originating address
    
    https://en.bitcoin.it/wiki/Script for reference
    
    Assume standard pay-to-pubkey-hash tx        
    scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
    76 + a9 + 14 = OP_DUP + OP_HASH160 + 14 Bytes to push
    88 + ac = OP_EQUALVERIFY + OP_CHECKSIG

    So, the hash160 we want will be in between '76a914' and '88ac'
    ...most of the time ;)
    */
    try {
      originatingHash160 = thisInputSendingHash160.substring(
        thisInputSendingHash160.indexOf('76a914') + '76a914'.length,
        thisInputSendingHash160.lastIndexOf('88ac'),
      );

      let replyAddressBchFormat =
        XPI.Address.hash160ToCash(originatingHash160);

      replyAddress = XPI.Address.toXAddress(replyAddressBchFormat);

    } catch (err) {
      console.log(`err from ${originatingHash160}`, err);
      // If the transaction is nonstandard, don't worry about a reply address for now
      originatingHash160 = 'N/A';
    }

    for (let j = 0; j < walletHash160s.length; j += 1) {
      const thisWalletHash160 = walletHash160s[j];
      if (thisInputSendingHash160.includes(thisWalletHash160)) {
        // Then this is an outgoing tx
        incoming = false;
        // Break out of this for loop once you know this is an outgoing tx
        break;
      }
    }
  }

  // Iterate over outputs to get the amount sent
  for (let i = 0; i < outputs.length; i += 1) {
    const thisOutput = outputs[i];
    const thisOutputReceivedAtHash160 = thisOutput.outputScript;
    // Check for OP_RETURN msg
    if (
      thisOutput.value === '0' &&
      typeof thisOutput.slpToken === 'undefined'
    ) {
      let hex = thisOutputReceivedAtHash160;
      let parsedOpReturnArray = parseOpReturn(hex);

      if (!parsedOpReturnArray) {
        console.log(
          'parseChronikTx() error: parsed array is empty',
        );
        break;
      }

      let message = '';
      let txType = parsedOpReturnArray[0];

      if (txType === currency.opReturn.appPrefixesHex.lotusChat) {
        // this is a sendlotus message
        try {
          opReturnMessage = Buffer.from(
            parsedOpReturnArray[1],
            'hex',
          );
          isLotusMessage = true;
        } catch (err) {
          // soft error if an unexpected or invalid cashtab hex is encountered
          opReturnMessage = '';
          console.log(
            'useBCH.parsedTxData() error: invalid cashtab msg hex: ' +
            parsedOpReturnArray[1],
          );
        }
      } else if (
        txType === currency.opReturn.appPrefixesHex.lotusChatEncrypted
      ) {
        isLotusMessage = true;
        isEncryptedMessage = true;
        let msgString = parsedOpReturnArray[1];

        // To decrypt the message, we need
        //  Our private key
        //  The message
        //  The other end's public key
        //      - incoming tx: get public key from the tx's first input
        //      - outgoing tx:  make api call to get the public key from the recipient's address
        //          If this api call has been made earlier when we tried to send an encrypted message
        //          the result should be in the cache.
        let otherPublicKey;
        try {
          const theOtherAddress = incoming ? replyAddress : destinationAddress;
          // otherPublicKey = await XPI.encryption.getPubKey(theOtherAddress);
        } catch (error) {
          opReturnMessage = 'Cannot retrieve Public Key'
        }

        let fundingWif, privateKeyObj, privateKeyBuff;
        if (
          wallet &&
          wallet.walletStatus &&
          wallet.walletStatus.slpBalancesAndUtxos &&
          wallet.walletStatus.slpBalancesAndUtxos.nonSlpUtxos[0]
        ) {
          const walletPaths = getWalletPathsFromWalletState(wallet);
          fundingWif = getUtxoWif(
            wallet.walletStatus.slpBalancesAndUtxos.nonSlpUtxos[0],
            walletPaths,
          );
          privateKeyObj = wif.decode(fundingWif);
          privateKeyBuff = privateKeyObj.privateKey;
          if (!privateKeyBuff) {
            isLotusMessage = true;
            isEncryptedMessage = true;
            opReturnMessage = 'Private key extraction error';
            continue; // skip to next output hex without triggering an API error
          }
        } else {
          break;
        }

        let structData;
        let decryptedMessage;

        try {
          // Convert the hex encoded message to a buffer
          const msgBuf = Buffer.from(msgString, 'hex');

          // Convert the bufer into a structured object.
          structData = convertToEncryptStruct(msgBuf);

          decryptedMessage = ecies.decrypt(
            privateKeyBuff,
            structData,
          );
          decryptionSuccess = true;
        } catch (err) {
          console.log(
            'useBCH.parsedTxData() decryption error: ' + err,
          );
          decryptedMessage = 'Unable to decrypt this message';
        }
        isLotusMessage = true;
        isEncryptedMessage = true;
        opReturnMessage = decryptedMessage;
      } else {
        // this is an externally generated message
        message = txType; // index 0 is the message content in this instance

        // if there are more than one part to the external message
        const arrayLength = parsedOpReturnArray.length;
        for (let i = 1; i < arrayLength; i++) {
          message = message + parsedOpReturnArray[i];
        }

        try {
          opReturnMessage = Buffer.from(message, 'hex');
        } catch (err) {
          // soft error if an unexpected or invalid cashtab hex is encountered
          opReturnMessage = '';
          console.log(
            'useBCH.parsedTxData() error: invalid external msg hex: ' +
            substring,
          );
        }
      }
    }
    // Find amounts at your wallet's addresses
    for (let j = 0; j < walletHash160s.length; j += 1) {
      const thisWalletHash160 = walletHash160s[j];
      if (thisOutputReceivedAtHash160.includes(thisWalletHash160)) {
        // If incoming tx, this is amount received by the user's wallet
        // if outgoing tx (incoming === false), then this is a change amount
        const thisOutputAmount = new BigNumber(thisOutput.value);
        xpiAmount = incoming
          ? xpiAmount.plus(thisOutputAmount)
          : xpiAmount.minus(thisOutputAmount);
      }
    }
    // Output amounts not at your wallet are sent amounts if !incoming
    if (!incoming) {
      const thisOutputAmount = new BigNumber(thisOutput.value);
      xpiAmount = xpiAmount.plus(thisOutputAmount);
    }
  }

  // Convert from sats to XPI
  xpiAmount = xpiAmount.shiftedBy(-1 * currency.cashDecimals);

  // Convert from BigNumber to string
  const xpiAmountString = xpiAmount.toString();

  // Convert opReturnMessage to string
  opReturnMessage = Buffer.from(opReturnMessage).toString();

  return {
    incoming,
    xpiAmount: xpiAmountString,
    originatingHash160,
    opReturnMessage,
    isLotusMessage,
    isEncryptedMessage,
    decryptionSuccess,
    replyAddress,
  };
};

export const getTxHistoryChronik = async (
  chronik: ChronikClient,
  XPI: BCHJS,
  wallet: WalletState,
) => {
  // Create array of promises to get chronik history for each address
  // Combine them all and sort by blockheight and firstSeen
  // Add all the info cashtab needs to make them useful
  const walletPaths = getWalletPathsFromWalletState(wallet);

  const hash160AndAddressObjArray: Hash160AndAddress[] = walletPaths.map(item => {
    return {
      address: item.xAddress,
      hash160: item.hash160,
    }
  });

  let txHistoryPromises: Array<Promise<TxHistoryPage>> = [];
  for (let i = 0; i < hash160AndAddressObjArray.length; i += 1) {
    const txHistoryPromise = returnGetTxHistoryChronikPromise(
      chronik,
      hash160AndAddressObjArray[i],
    );
    txHistoryPromises.push(txHistoryPromise);
  }
  let txHistoryOfAllAddresses;
  try {
    txHistoryOfAllAddresses = await Promise.all(txHistoryPromises);
  } catch (err) {
    console.log(`Error in Promise.all(txHistoryPromises)`, err);
  }
  const flatTxHistoryArray = flattenChronikTxHistory(txHistoryOfAllAddresses);
  const sortedTxHistoryArray = sortAndTrimChronikTxHistory(
    flatTxHistoryArray,
    currency.txHistoryCount,
  );

  // Parse txs
  const chronikTxHistory = [];
  for (let i = 0; i < sortedTxHistoryArray.length; i += 1) {
    const sortedTx = sortedTxHistoryArray[i];
    // Add token genesis info so parsing function can calculate amount by decimals
    sortedTx.parsed = parseChronikTx(XPI, sortedTx, wallet);
    chronikTxHistory.push(sortedTx);
  }

  return {
    chronikTxHistory,
  };
};
