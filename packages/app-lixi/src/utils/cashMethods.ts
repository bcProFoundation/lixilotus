import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import BigNumber from 'bignumber.js';
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
