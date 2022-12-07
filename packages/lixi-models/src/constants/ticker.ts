export const currency = {
  name: 'Lotus',
  ticker: 'XPI',
  legacyPrefix: 'bitcoincash',
  prefixes: ['lotus'],
  defaultFee: 2.01,
  dustSats: 550,
  etokenSats: 546,
  cashDecimals: 6,
  blockExplorerUrl: 'https://explorer.givelotus.org',
  tokenExplorerUrl: 'https://explorer.be.cash',
  blockExplorerUrlTestnet: 'https://texplorer.bitcoinabc.org',
  tokenName: 'eToken',
  tokenTicker: 'eToken',
  tokenPrefixes: ['etoken'],
  tokenIconsUrl: 'https://etoken-icons.s3.us-west-2.amazonaws.com',
  txHistoryCount: 20,
  hydrateUtxoBatchSize: 20,
  defaultSettings: { fiatCurrency: 'usd' },
  settingsValidation: {
    fiatCurrency: [
      'usd',
      'idr',
      'krw',
      'cny',
      'zar',
      'vnd',
      'cad',
      'nok',
      'eur',
      'gbp',
      'jpy',
      'try',
      'rub',
      'inr',
      'brl'
    ]
  },
  fiatCurrencies: {
    usd: { name: 'US Dollar', symbol: '$', slug: 'usd' },
    brl: { name: 'Brazilian Real', symbol: 'R$', slug: 'brl' },
    gbp: { name: 'British Pound', symbol: '£', slug: 'gbp' },
    cad: { name: 'Canadian Dollar', symbol: '$', slug: 'cad' },
    cny: { name: 'Chinese Yuan', symbol: '元', slug: 'cny' },
    eur: { name: 'Euro', symbol: '€', slug: 'eur' },
    inr: { name: 'Indian Rupee', symbol: '₹', slug: 'inr' },
    idr: { name: 'Indonesian Rupiah', symbol: 'Rp', slug: 'idr' },
    jpy: { name: 'Japanese Yen', symbol: '¥', slug: 'jpy' },
    krw: { name: 'Korean Won', symbol: '₩', slug: 'krw' },
    nok: { name: 'Norwegian Krone', symbol: 'kr', slug: 'nok' },
    rub: { name: 'Russian Ruble', symbol: 'р.', slug: 'rub' },
    zar: { name: 'South African Rand', symbol: 'R', slug: 'zar' },
    try: { name: 'Turkish Lira', symbol: '₺', slug: 'try' },
    vnd: { name: 'Vietnamese đồng', symbol: 'đ', slug: 'vnd' }
  },
  opReturn: {
    opReturnPrefixHex: '6a',
    opReturnAppPrefixLengthHex: '04',
    opPushDataOne: '4c',
    appPrefixesHex: {
      eToken: '534c5000',
      lotusChat: '02020202',
      lotusChatEncrypted: '03030303'
    },
    encryptedMsgByteLimit: 206,
    unencryptedMsgByteLimit: 215
  }
};

export function isValidLotusPrefix(addressString: string) {
  // Note that this function validates prefix only
  // Check for prefix included in currency.prefixes array
  // For now, validation is handled by converting to bitcoincash: prefix and checksum
  // and relying on legacy validation methods of bitcoincash: prefix addresses

  // Also accept an address with no prefix, as some exchanges provide these
  for (let i = 0; i < currency.prefixes.length; i += 1) {
    // If the addressString being tested starts with an accepted prefix or no prefix at all
    if (addressString.startsWith(currency.prefixes[i])) {
      return true;
    }
  }
  return false;
}
