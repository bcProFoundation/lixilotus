import SlpWallet from '@abcpros/minimal-xpi-slp-wallet';

export default function useXPI() {
  const SEND_XPI_ERRORS = {
    INSUFFICIENT_FUNDS: 0,
    NETWORK_ERROR: 1,
    INSUFFICIENT_PRIORITY: 66, // ~insufficient fee
    DOUBLE_SPENDING: 18,
    MAX_UNCONFIRMED_TXS: 64,
  };

  const getRestUrl = (apiIndex = 0) => {
    const apiString: string =
      process.env.REACT_APP_NETWORK === `mainnet`
        ? process.env.REACT_APP_XPI_APIS!
        : process.env.REACT_APP_XPI_APIS_TEST!;
    const apiArray = apiString.split(',');
    return apiArray[apiIndex];
  };

  const getXPI = (apiIndex = 0) => {
    let ConstructedSlpWallet;

    ConstructedSlpWallet = new SlpWallet('', {
      restURL: getRestUrl(apiIndex),
      hdPath: "m/44'/10605'/0'/0/0"
    });
    return ConstructedSlpWallet.bchjs;
  }

  return {
    getXPI
  };
}