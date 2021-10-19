import BigNumber from 'bignumber.js';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker.js';
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

export const isValidVaultName = (vaultName: string) => {
  return (
    typeof vaultName === 'string' &&
    vaultName.length > 0 &&
    vaultName.length < 100
  );
};

export const isValidAmountInput = (cashAmount: string) => {
  let testedAmount = new BigNumber(cashAmount);
  return (!testedAmount.isNaN() && testedAmount.isFinite())
}

// export const isValidQty = (quantityValue) => {

//     const tokenIntialQtyBig = new BigNumber(quantityValue);
//     return (
//         tokenIntialQtyBig.lt(100000000000)
//     );
// };