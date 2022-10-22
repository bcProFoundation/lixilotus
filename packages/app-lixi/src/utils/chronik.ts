import { ChronikClient } from "chronik-client";
import BCHJS from '@bcpros/xpi-js';
import BigNumber from 'bignumber.js';
import { currency } from "@bcpros/lixi-models";
import { getHashArrayFromWallet } from "./cashMethods";

export interface Hash160AndAddress {
  address: string;
  hash160: string;
};

/* 
Note: chronik.script('p2pkh', hash160).utxos(); is not readily mockable in jest
Hence it is necessary to keep this out of any functions that require unit testing
*/
export const getUtxosSingleHashChronik = async (chronik: ChronikClient, hash160: string) => {
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


export const returnGetUtxosChronikPromise = (chronik: ChronikClient, hash160AndAddressObj: Hash160AndAddress) => {
  /*
      Chronik thinks in hash160s, but people and wallets think in addresses
      Add the address to each utxo
  */
  return new Promise((resolve, reject) => {
    getUtxosSingleHashChronik(chronik, hash160AndAddressObj.hash160).then(
      result => {
        for (let i = 0; i < result.length; i += 1) {
          const thisUtxo = result[i];
          thisUtxo.address = hash160AndAddressObj.address;
        }
        resolve(result);
      },
      err => {
        reject(err);
      },
    );
  });
};

export const getUtxosChronik = async (chronik: ChronikClient, hash160sMappedToAddresses: Array<Hash160AndAddress>) => {
  /* 
      Chronik only accepts utxo requests for one address at a time
      Construct an array of promises for each address
      Note: Chronik requires the hash160 of an address for this request
  */
  const chronikUtxoPromises = [];
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
  hash160AndAddressObj,
) => {
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

export const parseChronikTx = (XPI: BCHJS, tx, wallet, tokenInfoById) => {
  const walletHash160s = getHashArrayFromWallet(wallet);
  const { inputs, outputs } = tx;
  // Assign defaults
  let incoming = true;
  let xecAmount = new BigNumber(0);
  let originatingHash160 = '';
  let etokenAmount = new BigNumber(0);
  let isTokenBurn = false;
  const isEtokenTx = 'slpTxData' in tx && typeof tx.slpTxData !== 'undefined';
  const isGenesisTx =
    isEtokenTx &&
    tx.slpTxData.slpMeta &&
    tx.slpTxData.slpMeta.txType &&
    tx.slpTxData.slpMeta.txType === 'GENESIS';
  if (isGenesisTx) {
    console.log(`${tx.txid} isGenesisTx`);
  }

  // Initialize required variables
  let substring = '';
  let airdropFlag = false;
  let airdropTokenId = '';
  let opReturnMessage = '';
  let isCashtabMessage = false;
  let isEncryptedMessage = false;
  let decryptionSuccess = false;
  let replyAddress = '';

  // Iterate over inputs to see if this is an incoming tx (incoming === true)
  for (let i = 0; i < inputs.length; i += 1) {
    const thisInput = inputs[i];
    const thisInputSendingHash160 = thisInput.outputScript;
    // If this is an etoken tx, check for token burn
    if (
      isEtokenTx &&
      typeof thisInput.slpBurn !== 'undefined' &&
      thisInput.slpBurn.token &&
      thisInput.slpBurn.token.amount &&
      thisInput.slpBurn.token.amount !== '0'
    ) {
      // Assume that any eToken tx with a burn is a burn tx
      isTokenBurn = true;
      try {
        const thisEtokenBurnAmount = new BigNumber(
          thisInput.slpBurn.token.amount,
        );
        // Need to know the total output amount to compare to total input amount and tell if this is a burn transaction
        etokenAmount = etokenAmount.plus(thisEtokenBurnAmount);
      } catch (err) {
        // do nothing
        // If this happens, the burn amount will render wrong in tx history because we don't have the info in chronik
        // This is acceptable
      }
    }
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
        BCH.Address.hash160ToCash(originatingHash160);

      const { type, hash } = cashaddr.decode(replyAddressBchFormat);
      replyAddress = cashaddr.encode('ecash', type, hash);
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
        // Break out of this for loop once you know this is an incoming tx
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

      // Exactly copying lines 177-293 of useBCH.js
      // Differences
      // 1 - patched ecies not async error
      // 2 - Removed if loop for tx being token, as this is handled elsewhere here
      if (!parsedOpReturnArray) {
        console.log(
          'useBCH.parsedTxData() error: parsed array is empty',
        );
        break;
      }

      let message = '';
      let txType = parsedOpReturnArray[0];

      if (txType === currency.opReturn.appPrefixesHex.airdrop) {
        // this is to facilitate special Cashtab-specific cases of airdrop txs, both with and without msgs
        // The UI via Tx.js can check this airdropFlag attribute in the parsedTx object to conditionally render airdrop-specific formatting if it's true
        airdropFlag = true;
        // index 0 is drop prefix, 1 is the token Id, 2 is msg prefix, 3 is msg
        airdropTokenId = parsedOpReturnArray[1];
        txType = parsedOpReturnArray[2];

        // remove the first two elements of airdrop prefix and token id from array so the array parsing logic below can remain unchanged
        parsedOpReturnArray.splice(0, 2);
        // index 0 now becomes msg prefix, 1 becomes the msg
      }

      if (txType === currency.opReturn.appPrefixesHex.cashtab) {
        // this is a Cashtab message
        try {
          opReturnMessage = Buffer.from(
            parsedOpReturnArray[1],
            'hex',
          );
          isCashtabMessage = true;
        } catch (err) {
          // soft error if an unexpected or invalid cashtab hex is encountered
          opReturnMessage = '';
          console.log(
            'useBCH.parsedTxData() error: invalid cashtab msg hex: ' +
            parsedOpReturnArray[1],
          );
        }
      } else if (
        txType === currency.opReturn.appPrefixesHex.cashtabEncrypted
      ) {
        if (!incoming) {
          // outgoing encrypted messages currently can not be decrypted by sender's wallet since the message is encrypted with the recipient's pub key
          opReturnMessage =
            'Only the message recipient can view this';
          isCashtabMessage = true;
          isEncryptedMessage = true;
          continue; // skip to next output hex
        }
        // this is an encrypted Cashtab message
        let msgString = parsedOpReturnArray[1];
        let fundingWif, privateKeyObj, privateKeyBuff;
        if (
          wallet &&
          wallet.state &&
          wallet.state.slpBalancesAndUtxos &&
          wallet.state.slpBalancesAndUtxos.nonSlpUtxos[0]
        ) {
          fundingWif = getUtxoWif(
            wallet.state.slpBalancesAndUtxos.nonSlpUtxos[0],
            wallet,
          );
          privateKeyObj = wif.decode(fundingWif);
          privateKeyBuff = privateKeyObj.privateKey;
          if (!privateKeyBuff) {
            isCashtabMessage = true;
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
        isCashtabMessage = true;
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
        xecAmount = incoming
          ? xecAmount.plus(thisOutputAmount)
          : xecAmount.minus(thisOutputAmount);

        // Parse token qty if token tx
        // Note: edge case this is a token tx that sends XEC to Cashtab recipient but token somewhere else
        if (isEtokenTx && !isTokenBurn) {
          try {
            const thisEtokenAmount = new BigNumber(
              thisOutput.slpToken.amount,
            );

            etokenAmount =
              incoming || isGenesisTx
                ? etokenAmount.plus(thisEtokenAmount)
                : etokenAmount.minus(thisEtokenAmount);
          } catch (err) {
            // edge case described above; in this case there is zero eToken value for this Cashtab recipient, so add 0
            etokenAmount.plus(new BigNumber(0));
          }
        }
      }
    }
    // Output amounts not at your wallet are sent amounts if !incoming
    // Exception for eToken genesis transactions
    if (!incoming) {
      const thisOutputAmount = new BigNumber(thisOutput.value);
      xecAmount = xecAmount.plus(thisOutputAmount);
      if (isEtokenTx && !isGenesisTx && !isTokenBurn) {
        try {
          const thisEtokenAmount = new BigNumber(
            thisOutput.slpToken.amount,
          );
          etokenAmount = etokenAmount.plus(thisEtokenAmount);
        } catch (err) {
          // NB the edge case described above cannot exist in an outgoing tx
          // because the eTokens sent originated from this wallet
        }
      }
    }
  }

  // Convert from sats to XEC
  xecAmount = xecAmount.shiftedBy(-1 * currency.cashDecimals);

  // Convert from BigNumber to string
  xecAmount = xecAmount.toString();

  // Get decimal info for correct etokenAmount
  let genesisInfo = {};

  if (isEtokenTx) {
    // Get token genesis info from cache
    let decimals = 0;
    try {
      genesisInfo = tokenInfoById[tx.slpTxData.slpMeta.tokenId];
      if (typeof genesisInfo !== 'undefined') {
        genesisInfo.success = true;
        decimals = genesisInfo.decimals;
        etokenAmount = etokenAmount.shiftedBy(-1 * decimals);
      } else {
        genesisInfo = { success: false };
      }
    } catch (err) {
      console.log(
        `Error getting token info from cache in parseChronikTx`,
        err,
      );
      // To keep this function synchronous, do not get this info from the API if it is not in cache
      // Instead, return a flag so that useWallet.js knows and can fetch this info + add it to cache
      genesisInfo = { success: false };
    }
  }
  etokenAmount = etokenAmount.toString();

  // Convert opReturnMessage to string
  opReturnMessage = Buffer.from(opReturnMessage).toString();

  // Return eToken specific fields if eToken tx
  if (isEtokenTx) {
    const { slpMeta } = tx.slpTxData;
    return {
      incoming,
      xecAmount,
      originatingHash160,
      isEtokenTx,
      etokenAmount,
      isTokenBurn,
      slpMeta,
      genesisInfo,
      airdropFlag,
      airdropTokenId,
      opReturnMessage: '',
      isCashtabMessage,
      isEncryptedMessage,
      decryptionSuccess,
      replyAddress,
    };
  }
  // Otherwise do not include these fields
  return {
    incoming,
    xecAmount,
    originatingHash160,
    isEtokenTx,
    airdropFlag,
    airdropTokenId,
    opReturnMessage,
    isCashtabMessage,
    isEncryptedMessage,
    decryptionSuccess,
    replyAddress,
  };
};

export const getTxHistoryChronik = async (
  chronik: ChronikClient,
  XPI: BCHJS,
  wallet,
  tokenInfoById,
) => {
  // Create array of promises to get chronik history for each address
  // Combine them all and sort by blockheight and firstSeen
  // Add all the info cashtab needs to make them useful

  const hash160AndAddressObjArray = [
    {
      address: wallet.Path145.cashAddress,
      hash160: wallet.Path145.hash160,
    },
    {
      address: wallet.Path245.cashAddress,
      hash160: wallet.Path245.hash160,
    },
    {
      address: wallet.Path1899.cashAddress,
      hash160: wallet.Path1899.hash160,
    },
  ];

  let txHistoryPromises = [];
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
  const uncachedTokenIds = [];
  for (let i = 0; i < sortedTxHistoryArray.length; i += 1) {
    const sortedTx = sortedTxHistoryArray[i];
    // Add token genesis info so parsing function can calculate amount by decimals
    sortedTx.parsed = parseChronikTx(BCH, sortedTx, wallet, tokenInfoById);
    // Check to see if this tx was a token tx with uncached tokenInfoById
    if (
      sortedTx.parsed.isEtokenTx &&
      sortedTx.parsed.genesisInfo &&
      !sortedTx.parsed.genesisInfo.success
    ) {
      // Only add if the token id is not already in uncachedTokenIds
      const uncachedTokenId = sortedTx.parsed.slpMeta.tokenId;
      if (!uncachedTokenIds.includes(uncachedTokenId))
        uncachedTokenIds.push(uncachedTokenId);
    }
    chronikTxHistory.push(sortedTx);
  }

  const txHistoryNewTokensToCache = uncachedTokenIds.length > 0;

  if (!txHistoryNewTokensToCache) {
    // This will almost always be the case
    // Edge case to find uncached token info in tx history that was not caught in processing utxos
    // Requires performing transactions in one wallet, then loading the same wallet in another browser later
    return {
      chronikTxHistory,
      txHistoryUpdatedTokenInfoById: tokenInfoById,
      txHistoryNewTokensToCache,
    };
  }

  // Iterate over uncachedTokenIds to get genesis info and add to cache
  const getTokenInfoPromises = [];
  for (let i = 0; i < uncachedTokenIds.length; i += 1) {
    const thisTokenId = uncachedTokenIds[i];

    const thisTokenInfoPromise = returnGetTokenInfoChronikPromise(
      chronik,
      thisTokenId,
    );
    getTokenInfoPromises.push(thisTokenInfoPromise);
  }

  // Get all the token info you need
  let tokenInfoArray = [];
  try {
    tokenInfoArray = await Promise.all(getTokenInfoPromises);
  } catch (err) {
    console.log(
      `Error in Promise.all(getTokenInfoPromises) in getTxHistoryChronik`,
      err,
    );
  }

  // Add the token info you received from those API calls to
  // your token info cache object, cachedTokenInfoByTokenId

  const txHistoryUpdatedTokenInfoById = tokenInfoById;
  for (let i = 0; i < tokenInfoArray.length; i += 1) {
    /* tokenInfoArray is an array of objects that look like
    {
        "tokenTicker": "ST",
        "tokenName": "ST",
        "tokenDocumentUrl": "developer.bitcoin.com",
        "tokenDocumentHash": "",
        "decimals": 0,
        "tokenId": "bf24d955f59351e738ecd905966606a6837e478e1982943d724eab10caad82fd"
    }
    */

    const thisTokenInfo = tokenInfoArray[i];
    const thisTokenId = thisTokenInfo.tokenId;
    // Add this entry to updatedTokenInfoById
    txHistoryUpdatedTokenInfoById[thisTokenId] = thisTokenInfo;
  }

  return {
    chronikTxHistory,
    txHistoryUpdatedTokenInfoById,
    txHistoryNewTokensToCache,
  };
};
