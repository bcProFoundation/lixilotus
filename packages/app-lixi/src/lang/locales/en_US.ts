/* eslint-disable import/no-anonymous-default-export */
/* SendLotus Language Texts

Table of Contents

01.General
02.Account
03.Lixi
04.Claim
05.Settings
06.Countries
07.Onboarding
08.Notification
*/

export default {
  /* 01.General */
  'general.home': 'Home',
  'general.accounts': 'Accounts',
  'general.lixi': 'Lixi',
  'general.claim': 'Claim',
  'general.settings': 'Settings',
  'general.registerPack': 'Register Pack',
  'general.swapCard': 'Swap Card',
  'general.connectionLost': 'API connection lost.',
  'general.reEstablishing': 'Re-establishing connection...',
  'general.qrScannerError': 'Error in QR scanner:',
  'general.scanQRCode': 'Scan QR code',
  'general.scanQRCodeError':
    'Error in QR scanner. Please ensure your camera is not in use. Due to Apple restrictions on third-party browsers, you must use Safari browser for QR code scanning on an iPhone.',
  'general.num': 'Num',
  'general.amount': 'Amount',

  /* 02.Account */
  'account.mnemonicRequired': 'Valid mnemonic seed phrase required',
  'account.mnemonic': 'mnemonic (seed phrase)',
  'account.manageLixi': 'Manage Lixi',
  'account.refreshLixiList': 'Refresh Lixi List',
  'account.unableCreateLixi': 'Unable to create lixi.',
  'account.selectLixiFirst': 'Please Select an account first before creating lixi',
  'account.random': 'Random',
  'account.fixed': 'Fixed',
  'account.divided': 'Divided',
  'account.equal': 'Equal',
  'account.perPack': 'Per pack',
  'account.numberLixiPerPackage': 'number of sub lixi per package',
  'account.numberOfSubLixi': 'Number of sub lixi',
  'account.defaultValueToGive': 'Default value to give',
  'account.dividedNumber': 'Dividend number (Max 1,000,000)',
  'account.min': 'Min',
  'account.max': 'Max',
  'account.minValueToGive': 'Min value to give',
  'account.maxValueToGive': 'Max value to give',
  'account.maxClaim': 'Max Claim',
  'account.enterMaxClaimNumber': 'Enter max Claim number',
  'account.minStaking': 'Min Staking',
  'account.enterMinStaking': 'Enter minimum staking number',
  'account.expiryTime': 'Expiry time for your lixi',
  'account.activatedTime': 'Activated time for your lixi',
  'account.createLixi': 'Create Lixi',
  'account.enterLixiName': 'Enter a name for your lixi',
  'account.enterLixiBalance': 'Enter balance for your lixi',
  'account.lixiMessage': 'Enter the lixi message',
  'account.allCountry': 'All of country',
  'account.advance': 'Advance',
  'account.amount': 'Amount',
  'account.singleCode': 'Single code',
  'account.oneTimeCode': 'One-time codes',
  'account.familyFriendly': 'Family Friendly',
  'account.sub-lixi': 'Sub-lixi',
  'account.couldNotFetchAccount': 'Could not fetch the account from api.',
  'account.unableGetAccountFromServer': 'Unable to get the account from server',
  'account.couldNotPostAccount': 'Could not post the account to the api.',
  'account.createAccountSuccessful': 'Create account successfully.',
  'account.unableToCreateServer': 'Unable to create account on the server.',
  'account.couldNotInport': 'Could not import the account.',
  'account.unableToImport': 'Unable to import the account.',
  'account.unableToSelect': 'Unable to select the account.',
  'account.unableToRename': 'Unable to rename the account.',
  'account.unableToChangeLocaleAccount': 'Unable to change locale the account.',
  'account.unableToDelete': 'Unable to delete the account.',
  'account.unableToRefresh': 'Unable to refresh lixi list.',
  'account.renameFailed': 'Rename failed. All accounts must have a unique name.',
  'account.deleteFailed': 'Delete failed. Could not delete the account.',
  'account.accountRenamedSuccess': 'Account has renamed to {accountName}',
  'account.accountChangeLocaleSuccess': 'Account locale has changed to {language}',
  'account.accountDeleteSuccess': 'The account has been deleted successfully.',
  'account.accountImportSuccess': 'The account has been imported successfully.',

  /* 03.Lixi */
  'lixi.sub-lixi': 'Sub-lixi',
  'lixi.dividedBy': 'Divided by',
  'lixi.fundGiveFixed': 'The fund giving is fixed',
  'lixi.fixedFund': 'The fixed fund:',
  'lixi.fundGiveDividend': 'The fund giving is dividend',
  'lixi.dividedFund': 'Divided by:',
  'lixi.fundGiveEqual': 'The fund giving is equal',
  'lixi.equalFund': 'Equal:',
  'lixi.fundGiveRandomize': 'The fund giving is randomized',
  'lixi.randomFund': 'Min: {newLixiMinValue}; Max: {newLixiMaxValue}',
  'lixi.amount': 'Amount: {newLixiAmount}',
  'lixi.totalAmountRequire': 'Total amount require: {newLixiAmount}',
  'lixi.numberOfSub': 'Number of sub lixi: {newNumberOfSubLixi}',
  'lixi.numberLixiPerPackage': 'Number of sub-lixi per package: {newNumberLixiPerPackage}',
  'lixi.package': 'Package',
  'lixi.maxClaim': 'Max Redemption: {newMaxClaim}',
  'lixi.country': 'Country: ',
  'lixi.minStake': 'Minimum Staking: {newMinStaking}',
  'lixi.expireAt': 'Expiry at:',
  'lixi.activatedAt': 'Activate at:',
  'lixi.settingConfirm': 'Please confirm your lixi settings.',
  'lixi.name': 'Name:',
  'lixi.fundForAccount': 'Fund for the account:',
  'lixi.optionFamilyFriendly': 'Option: Family Friendly',
  'lixi.optional': 'Optional',
  'lixi.lixiInfo': 'Lixi info for {lixiName}',
  'lixi.claimType': 'Claim Type',
  'lixi.type': 'Type',
  'lixi.totalClaimed': 'Total Claimed',
  'lixi.remainingLixi': 'Remaining Lixi',
  'lixi.remainingXPI': 'XPI Remaining',
  'lixi.message': 'Message',
  'lixi.loadmore': 'Load More',
  'lixi.addLeader': 'Add Leader',
  'lixi.lixiDetail': 'Click to reveal Lixi detail',
  'lixi.lixiLeader': 'Click to reveal Lixi detail',
  'lixi.downloadCode': 'Download Code',
  'lixi.copyClaim': 'Copy Claim Code',
  'lixi.refreshLixi': 'Refresh Lixi',
  'lixi.exportLixi': 'Export Lixi',
  'lixi.noLixiSelected': 'No lixi is selected',
  'lixi.fileTypeError': 'You can only upload JPG/PNG/GIF file!',
  'lixi.fileSizeError': 'Image must smaller than 5MB!',
  'lixi.fileUploadError': 'Error uploading to server',
  'lixi.fileUploadSuccess': 'Upload Successfully',
  'lixi.uploadDividerText': 'Custom Enevelope',
  'lixi.uploadText': 'Upload',
  'lixi.uploadingText': 'Uploading...',
  'lixi.previewFileFailed': 'Cannot preview file',
  'lixi.renameLixi': 'Rename Lixi',
  'lixi.enterNewLixiName': 'Enter new lixi name',
  'lixi.lixiLengthError': 'Lixi name must be a string between 1 and 24 characters long',
  'lixi.couldNotFetchLixi': 'Could not fetch the lixi from api.',
  'lixi.unableGetLixi': 'Unable to get the lixi from server',
  'lixi.unableGetChildLixi': 'Unable to get the children lixies from server',
  'lixi.unableCreateLixi': 'Unable to create the lixi.',
  'lixi.unableCreateChildLixi': 'Unable to create the children lixies from server',
  'lixi.couldNotPostLixi': 'Could not post the lixi to the api.',
  'lixi.createLixiSuccessful': 'Create lixi successfully.',
  'lixi.errorWhenCreateLixi': "There's an error happens when create new lixi.",
  'lixi.unableCreateLixiServer': 'Unable to create lixi on server',
  'lixi.unableRegisterLixiPack': 'Unable to register lixi pack',
  'lixi.unableRefresh': 'Unable to refresh the lixi.',
  'lixi.unableSelect': 'Unable to select the lixi.',
  'lixi.unableUnlock': 'Unable to unlock the lixi.',
  'lixi.unableLock': 'Unable to lock the lixi.',
  'lixi.unableWithdraw': 'Unable to withdraw the lixi.',
  'lixi.unableRename': 'Unable to rename the lixi.',
  'lixi.unableExportSub': 'Unable to export sub-lixies.',
  'lixi.unableExport': 'Unable to export the lixi.',
  'lixi.errorWhenUnlock': "There's an error happens when create unlock lixi.",
  'lixi.errorWhenLock': "There's an error happens when lock lixi.",
  'lixi.errorWhenWithdraw': "There's an error happens when withdraw lixi.",
  'lixi.refreshSuccess': 'Refresh the lixi successfully.',
  'lixi.unlockSuccess': 'Unlock lixi successfully.',
  'lixi.lockSuccess': 'Lock lixi successfully.',
  'lixi.withdrawSuccess': 'Withdraw lixi successfully.',
  'lixi.renameSuccess': 'Lixi has been renamed to {lixiName}',
  'lixi.registerSuccess': 'Register lixi pack successfully',
  'lixi.renameFailed': 'Rename failed. All lixi must have a unique name.',
  'lixi.isNFTEnabled': 'NFT Enabled',
  'lixi.isCharity': 'Charity Fund',
  'lixi.optionNFTEnabled': 'Option: NFT Enabled',
  'lixi.unableDownloadSub': 'Unable to download the sub-lixies.',
  'lixi.loyaltyProgram': 'Loyalty Programs',
  'lixi.staffAddress': 'Staff Address',
  'lixi.charityAddress': 'Charity Address',
  'lixi.lotteryAddress': 'Lottery Address',
  'lixi.lotteryAddressCheck': 'Confirm',
  'lixi.addressCopied': 'The address has been copied.',

  /* 04.Claim */
  'claim.claim': 'Claim',
  'claim.titleShared': 'Lixi Program sent you a small gift!',
  'claim.copyToClipboard': 'Link copied to clipboard',
  'claim.youClaimedLixi': 'You have claimed lixi',
  'claim.addressNotValid': 'Destination is not a valid {ticker} address',
  'claim.invalidAddress': 'Invalid {ticker} address',
  'claim.tickerAddress': '{ticker} Address',
  'claim.claimCode': 'Claim Code',
  'claim.claimSuccess': 'Claim Success',
  'claim.unableClaim': 'Unable to claim',
  'claim.claimSuccessAmount': 'Claim successfully {xpiAmount} XPI',
  'claim.claimCodeCopied': 'The claim code has been copied.',
  'claim.unableDownloadClaimCode': 'Unable to download claim code.',
  'claim.pleaseCopyManually': 'Please copy the code manually',
  'claim.withdrawSuccess': 'Withdraw successfully',
  'claim.refreshSuccess': 'Refresh successfully',

  /* 05.Settings */
  'settings.languages': 'Languages',
  'settings.backupAccount': 'Backup your account',
  'settings.manageAccounts': 'Manage Accounts',
  'settings.newAccount': 'New Account',
  'settings.importAccount': 'Import Account',
  'settings.activated': 'Activated',
  'settings.savedAccount': 'Saved accounts',
  'settings.revealPhrase': 'Click to reveal seed phrase',
  'settings.backupAccountWarning':
    'Your seed phrase is the only way to restore your account. Write it down. Keep it safe.',
  'settings.backupAccountHint': 'Copy and paste your mnemonic seed phrase below to import an existing account',
  'settings.accountLengthMessage': 'Account name must be a string between 1 and 24 characters long',
  'settings.enterAccountName': 'Enter new account name',
  'settings.renameAccount': 'Rename Account',
  'settings.deleteAccountConfirm': 'Type "delete {account}" to confirm',
  'settings.deleteAccountConfirmMessage': 'Are you sure you want to delete account "{account}"?',
  'settings.yourConfirmationPhraseMustExact': 'Your confirmation phrase must match exactly',
  en: 'English',
  vi: 'Vietnamese',

  /* 06.Countries */
  'country.all': 'All of country',
  'country.vn': 'Vietnam',
  'country.us': 'United States',
  'country.id': 'Indonesia',
  'country.ph': 'Philippines',

  /* 07.Onboarding */
  'onboarding.dontForgetBackup': "Don't forget to back up your account",
  'onboarding.dontForgetBackupConfirm': 'Okay, make me a account!',
  'onboarding.dontForgetBackupDescription':
    'Once your account is created you can back it up by writing down your 12-word seed. You can find your seed on the Settings page. If you are browsing in Incognito mode or if you clear your browser history, you will lose any funds that are not backed up!',
  'onboarding.cancel': 'Cancel',
  'onboarding.newAccount': 'New Account',
  'onboarding.importAccount': 'Import Account',
  'onboarding.import': 'Import',
  'onboarding.welcomeToLotus': 'Welcome to LixiLotus!',
  'onboarding.lixiLotusIntroduce1': 'LixiLotus is an open-source, non-custodial web wallet for Lotus.',
  'onboarding.lixiLotusIntroduce2': 'LixiLotus allow you to giveaway your Lotus effortlessly.',
  'onboarding.lixiLotusIntroduce3': 'To start, install LixiLotus to your device follow',
  'onboarding.lixiLotusIntroduce4': 'the guide',

  /* 08.Envelope */
  'envelope.unableGetEnvelope': 'Unable to get the envelope from server',
  'envelope.pleaseSelectEnvelope': 'Please select your envelope',
  'envelope.couldNotFetch': 'Could not fetch the envelope from api.',

  /* 09.Notification */
  'notification.unableToFetch': 'Unable to fetch the notification.',
  'notification.unableToDelete': 'Unable to delete the notification.',
  'notification.unableToRead': 'Unable to read the notification.',

  /* 10.NFT */
  'lixinft.unableToMint': 'Unable to mint the lixi NFT',

  /* 11.Register */
  'register.register': 'Register',

  /* 12.Send */
  'send.unableToSend': 'Unable to send',
  'send.sendAmountSmallerThanDust': 'The send amount is smaller than dust',
  'send.utxoEmpty': 'UTXO list is empty',
  'send.unableSendTransaction': 'Unable to send transaction',
  'send.insufficientFund': 'Insufficient fund',
  'send.invalidDecimalPlaces': 'Invalid decimal places for send amount',
  'send.insufficientPriority': 'Insufficient priority',
  'send.networkError': 'Network Error',
  'send.longMempoolChain': 'too-long-mempool-chain, too many unconfirmed ancestors',
  'send.communicateApi': 'Could not communicate with API. Please try again.',
  'send.manyAncestors':
    'The XPI you are trying to send has too many unModaled ancestors to send (limit 50). Sending will be possible after a block Modal.ation. Try again in about 10 minutes.',
  'send.onlyMessage': 'Send only message',
  'send.canNotEncryptMessage': 'Cannot encrypt message',
  'send.addressNoOutgoingTrans': 'This address has no outgoing transaction, you cannot send message.',
  'send.newAddress': 'It looks like this address is NEW, please verify it before sending a large amount.',
  'send.canNotSendToYourSelf': 'Cannot send to yourself!',
  'send.calcMaxError': 'Unable to calculate the max value due to network errors',
  'send.sendModalTitle': 'Are you sure you want to send {value} {ticker} to {address}?',
  'send.queryString':
    'You are sending a transaction to an address including query parameters "{queryStringText}." Only the "amount" parameter, in units of {currency} satoshis, is currently supported.',
  'send.optionalPrivateMessage': 'Optional Private Message',
  /* 12.Zero balance header */
  'zeroBalanceHeader.noBalance': 'You currently have 0 {ticker}',
  'zeroBalanceHeader.deposit': 'Deposit some funds to use this feature',

  /* 13.Page */
  'page.createNewPage': 'Create new page',
  'page.createPage': 'Create page',
  'page.editPage': 'Edit page',
  'page.name': 'Name',
  'page.inputName': 'Please input name',
  'page.title': 'Title',
  'page.inputTitle': 'Please input title',
  'page.walletAddress': 'Wallet address',
  'page.avatar': 'Avatar',
  'page.cover': 'Cover',
  'page.upload': 'Click to upload',
  'page.website': 'Website',
  'page.description': 'Description',
  'page.country': 'Search to select country',
  'page.state': 'Search to select state',
  'page.address': 'Address',
  'page.inputAddress': 'Please input address',
  'page.couldNotpostPage': 'Could not create page',
  'page.createPageSuccessful': 'Create page successful',
  'page.unableCreatePageServer': 'Unable to create page on server',
  'page.errorWhenCreatePage': "There's an error happens when create new Page",

  /* 14.Country */
  'country.unablegetCountries': 'Unable to get countries',
  'country.unablegetStates': 'Unable to get states'
};
