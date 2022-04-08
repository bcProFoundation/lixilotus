import BigNumber from 'bignumber.js';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker.js';
import { fromSmallestDenomination } from '@utils/cashMethods';

// Validate cash amount
// export const shouldRejectAmountInput = (
//     cashAmount,
//     selectedCurrency,
//     fiatPrice,
//     totalCashBalance,
// ) => {
//     // Take cashAmount as input, a string from form input
//     let error = false;
//     let testedAmount = new BigNumber(cashAmount);

//     if (selectedCurrency !== currency.ticker) {
//         // Ensure no more than currency.cashDecimals decimal places
//         testedAmount = new BigNumber(fiatToCrypto(cashAmount, fiatPrice));
//     }

//     // Validate value for > 0
//     if (isNaN(testedAmount)) {
//         error = 'Amount must be a number';
//     } else if (testedAmount.lte(0)) {
//         error = 'Amount must be greater than 0';
//     } else if (
//         testedAmount.lt(fromSmallestDenomination(currency.dustSats).toString())
//     ) {
//         error = `Send amount must be at least ${fromSmallestDenomination(
//             currency.dustSats,
//         ).toString()} ${currency.ticker}`;
//     } else if (testedAmount.gt(totalCashBalance)) {
//         error = `Amount cannot exceed your ${currency.ticker} balance`;
//     } else if (!isNaN(testedAmount) && testedAmount.toString().includes('.')) {
//         if (
//             testedAmount.toString().split('.')[1].length > currency.cashDecimals
//         ) {
//             error = `${currency.ticker} transactions do not support more than ${currency.cashDecimals} decimal places`;
//         }
//     }
//     // return false if no error, or string error msg if error
//     return error;
// };

export const isValidLixiName = (lixiName: string) => {
  return (
    typeof lixiName === 'string' &&
    lixiName.length > 0 &&
    lixiName.length < 100
  );
};

export const isValidAmountInput = (cashAmount: string) => {
  if (cashAmount === '') return true;
  let testedAmount = new BigNumber(cashAmount);
  return (!testedAmount.isNaN() && testedAmount.isFinite() && testedAmount.isPositive())
}