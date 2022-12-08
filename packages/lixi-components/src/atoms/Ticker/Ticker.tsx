import mainLogo from '../../images/logo_primary.png';
import tokenLogo from '../../images/logo_secondary.png';

const Ticker = {
  installLink: 'https://chrome.google.com/webstore/detail/cashtab/obldfcmebhllhjlhjbnghaipekcppeag',
  coinName: 'eCash',
  coinDecimals: 2,
  coinSymbol: 'XEC',
  logo: mainLogo,
  prefix: 'ecash:',
  coingeckoId: 'bitcoin-cash-abc-2',
  defaultFee: 5.01,
  blockExplorerUrl: 'https://explorer.bitcoinabc.org',
  blockExplorerUrlTestnet: 'https://texplorer.bitcoinabc.org',
  tokenName: 'eToken',
  tokenTicker: 'eToken',
  tokenLogo: tokenLogo,
  tokenPrefix: 'etoken:',
  tokenIconsUrl: 'https://etoken-icons.s3.us-west-2.amazonaws.com',
  useBlockchainWs: false
};

export default Ticker;
