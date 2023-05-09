"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidLotusPrefix = exports.currency = void 0;
exports.currency = {
    name: 'Lotus',
    ticker: 'XPI',
    logo: '/images/lotus_logo.png',
    legacyPrefix: 'bitcoincash',
    prefixes: ['lotus'],
    coingeckoId: 'bitcoin-cash-abc-2',
    defaultFee: 2.01,
    dustSats: 550,
    etokenSats: 546,
    cashDecimals: 6,
    blockExplorerUrl: 'https://explorer.givelotus.org',
    tokenExplorerUrl: 'https://explorer.be.cash',
    blockExplorerUrlTestnet: 'https://texplorer.bitcoinabc.org',
    tokenName: 'eToken',
    tokenTicker: 'eToken',
    tokenLogo: '/images/logo_secondary.png',
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
        opReturnPrefixDec: '106',
        encryptedMsgByteLimit: 206,
        unencryptedMsgByteLimit: 215
    }
};
function isValidLotusPrefix(addressString) {
    // Note that this function validates prefix only
    // Check for prefix included in currency.prefixes array
    // For now, validation is handled by converting to bitcoincash: prefix and checksum
    // and relying on legacy validation methods of bitcoincash: prefix addresses
    // Also accept an address with no prefix, as some exchanges provide these
    for (let i = 0; i < exports.currency.prefixes.length; i += 1) {
        // If the addressString being tested starts with an accepted prefix or no prefix at all
        if (addressString.startsWith(exports.currency.prefixes[i])) {
            return true;
        }
    }
    return false;
}
exports.isValidLotusPrefix = isValidLotusPrefix;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVGlja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFhLFFBQUEsUUFBUSxHQUFHO0lBQ3RCLElBQUksRUFBRSxPQUFPO0lBQ2IsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsd0JBQXdCO0lBQzlCLFlBQVksRUFBRSxhQUFhO0lBQzNCLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNuQixXQUFXLEVBQUUsb0JBQW9CO0lBQ2pDLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQVEsRUFBRSxHQUFHO0lBQ2IsVUFBVSxFQUFFLEdBQUc7SUFDZixZQUFZLEVBQUUsQ0FBQztJQUNmLGdCQUFnQixFQUFFLGdDQUFnQztJQUNsRCxnQkFBZ0IsRUFBRSwwQkFBMEI7SUFDNUMsdUJBQXVCLEVBQUUsa0NBQWtDO0lBQzNELFNBQVMsRUFBRSxRQUFRO0lBQ25CLFdBQVcsRUFBRSxRQUFRO0lBQ3JCLFNBQVMsRUFBRSw0QkFBNEI7SUFDdkMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDO0lBQ3pCLGFBQWEsRUFBRSxpREFBaUQ7SUFDaEUsY0FBYyxFQUFFLEVBQUU7SUFDbEIsb0JBQW9CLEVBQUUsRUFBRTtJQUN4QixlQUFlLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0lBQ3hDLGtCQUFrQixFQUFFO1FBQ2xCLFlBQVksRUFBRTtZQUNaLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztZQUNMLEtBQUs7WUFDTCxLQUFLO1lBQ0wsS0FBSztTQUNOO0tBQ0Y7SUFDRCxjQUFjLEVBQUU7UUFDZCxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUss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