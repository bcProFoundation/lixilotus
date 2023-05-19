export declare const currency: {
  name: string;
  ticker: string;
  logo: string;
  legacyPrefix: string;
  prefixes: string[];
  coingeckoId: string;
  defaultFee: number;
  dustSats: number;
  etokenSats: number;
  cashDecimals: number;
  blockExplorerUrl: string;
  tokenExplorerUrl: string;
  blockExplorerUrlTestnet: string;
  tokenName: string;
  tokenTicker: string;
  tokenLogo: string;
  tokenPrefixes: string[];
  tokenIconsUrl: string;
  txHistoryCount: number;
  hydrateUtxoBatchSize: number;
  defaultSettings: {
    fiatCurrency: string;
  };
  settingsValidation: {
    fiatCurrency: string[];
  };
  fiatCurrencies: {
    usd: {
      name: string;
      symbol: string;
      slug: string;
    };
    brl: {
      name: string;
      symbol: string;
      slug: string;
    };
    gbp: {
      name: string;
      symbol: string;
      slug: string;
    };
    cad: {
      name: string;
      symbol: string;
      slug: string;
    };
    cny: {
      name: string;
      symbol: string;
      slug: string;
    };
    eur: {
      name: string;
      symbol: string;
      slug: string;
    };
    inr: {
      name: string;
      symbol: string;
      slug: string;
    };
    idr: {
      name: string;
      symbol: string;
      slug: string;
    };
    jpy: {
      name: string;
      symbol: string;
      slug: string;
    };
    krw: {
      name: string;
      symbol: string;
      slug: string;
    };
    nok: {
      name: string;
      symbol: string;
      slug: string;
    };
    rub: {
      name: string;
      symbol: string;
      slug: string;
    };
    zar: {
      name: string;
      symbol: string;
      slug: string;
    };
    try: {
      name: string;
      symbol: string;
      slug: string;
    };
    vnd: {
      name: string;
      symbol: string;
      slug: string;
    };
  };
  opReturn: {
    opReturnPrefixHex: string;
    opReturnAppPrefixLengthHex: string;
    opPushDataOne: string;
    appPrefixesHex: {
      eToken: string;
      lotusChat: string;
      lotusChatEncrypted: string;
    };
    opReturnPrefixDec: string;
    encryptedMsgByteLimit: number;
    unencryptedMsgByteLimit: number;
  };
};
export declare function isValidLotusPrefix(addressString: string): boolean;
