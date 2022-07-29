import BigNumber from 'bignumber.js';

import { currency } from '../constants/ticker';

export const fromSmallestDenomination = (amount: number, cashDecimals = currency.cashDecimals): number => {
  const amountBig = new BigNumber(amount);
  const multiplier = new BigNumber(10 ** (-1 * cashDecimals));
  const amountInBaseUnits = amountBig.times(multiplier);
  return amountInBaseUnits.toNumber();
};

export const toSmallestDenomination = (sendAmount: BigNumber, cashDecimals = currency.cashDecimals): BigNumber => {
  // Replace the BCH.toSatoshi method with an equivalent function that works for arbitrary decimal places
  // Example, for an 8 decimal place currency like Bitcoin
  // Input: a BigNumber of the amount of Bitcoin to be sent
  // Output: a BigNumber of the amount of satoshis to be sent, or false if input is invalid

  // Validate
  // Input should be a BigNumber with no more decimal places than cashDecimals
  const isValidSendAmount = BigNumber.isBigNumber(sendAmount) && sendAmount.dp() <= cashDecimals;
  if (!isValidSendAmount) {
    throw new Error('Invalid amount.');
  }
  const conversionFactor = new BigNumber(10 ** cashDecimals);
  const sendAmountSmallestDenomination = sendAmount.times(conversionFactor);
  return sendAmountSmallestDenomination;
};
