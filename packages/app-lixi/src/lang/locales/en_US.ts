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
  /* 00. special*/
  'special.or': 'Or',
  'special.cancel': 'Cancel',
  'special.copy': 'Copy',
  'label.shortId': 'Short ID',
  'label.ticker': 'Ticker',
  'label.name': 'Name',
  'label.burnXPI': 'Burn XPI',
  'label.comment': 'Comments',
  'label.created': 'Created',
  'label.action': 'Action',
  'text.createPage':
    'A Page is a space where people can publicly connect with your business, personal brand or organisation. You can do things such as showcase products and services, collect donations.',
  'text.createPageName':
    'Use the name of your business, brand or organisation, or a name that explains what the Page is about.',
  'text.createPageCategory':
    'Choose a category that describes what type of business, organisation or topic the Page represents.',
  'text.createPageDescription':
    'Write about what your business does, the services that you provide or the purpose of the Page.',
  'text.post': 'this post',
  'text.selectXpi': 'How many XPI you want to burn for {name}?',
  'burn.selectXpi': 'Please select Xpi you want to burn for {name}',
  'burn.youBurning': 'You are burning ',
  'burn.post': 'post',
  'burn.comment': 'comment',
  'burn.token': 'token',
  'burn.page': 'page',
  'burn.account': 'account',
  'burn.doneBurning': 'Burning completed!',
  'burn.sendXpi': 'You will send ',
  'burn.owner': ' to {name} owner',
  'burn.feeMiner': "Miners' fees excluded",

  /* 01.General */
  'general.tokens': 'Tokens',
  'general.home': 'Home',
  'general.accounts': 'Accounts',
  'general.lixi': 'Lixi management',
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
  'general.scanBarcode': 'Scan Barcode',
  'general.scanBarcodeError':
    'Error in Barcode scanner. Please ensure your camera is not in use. Due to Apple restrictions on third-party browsers, you must use Safari browser for barcode scanning on an iPhone.',
  'general.num': 'No.',
  'general.amount': 'Amount',
  'general.chooseCamera': 'Please choose camera',
  'general.chooseCameraTip': 'Try switching camera when its not working properly',
  'general.notifications': 'Notifications',
  'general.viewmore': 'View more',
  'general.ended': 'Ended',
  'general.running': 'Running',
  'general.waiting': 'Waiting',
  'general.page': 'Pages',
  'general.sendLotus': 'Send Lotus',
  'general.lotusiaShop': 'Lotusia Shop',
  'general.send': 'Send',
  'general.createPage': 'Create Page',
  'general.pages': 'Pages',
  'general.profile': 'Profile',
  'general.claimed': 'claimed',
  'general.manageAccounts': 'Manage Accounts',
  'general.subTitleSettings': 'Set Privacy and Notification settings',
  'general.manageLixi': 'Manage Lixi',
  'general.manageInfo': 'Manage Info',
  'general.managePage': 'Manage Page',
  'general.manageNotifications': 'Manage Notifications',
  'general.feedPage': 'Discover and connect with businesses on LixiLotus',
  'general.subTitleEditPage': 'Change information your page',
  'general.subTitleClaimed': 'Detail of claimed',
  'general.notFoundTitle': 'Opp! Page not found',
  'general.notFoundDescription': 'Sorry, we can’t find the page you’re looking for.',
  'general.goBackToHome': 'Go back',
  'general.searchResults': 'Search results for "{text}"',
  'general.post': 'Post',
  'general.burnUp': 'Burn up',
  'general.burnDown': 'Burn down',
  'general.more': 'More',
  'general.goodOrNot': 'Good or not? Burn for it',
  'general.customBurn': 'Custom burn',
  'general.burnForType': 'Burn For Type',
  'general.failed': 'Failed',
  'general.level': 'Level',
  'general.showMore': 'Show more',
  'general.showLess': 'Show less',
  'general.topAccounts': 'Top Accounts',
  'general.topPages': 'Top Pages',
  'general.burned': 'Burned',
  'general.fee': 'Fee: ',

  /* 02.Account */
  'account.mnemonicRequired': 'Valid mnemonic seed phrase required',
  'account.mnemonic': 'mnemonic (seed phrase)',
  'account.manageLixi': 'Manage Lixi',
  'account.managePage': 'Manage Page',
  'account.refreshLixiList': 'Refresh Lixi List',
  'account.unableCreateLixi': 'Unable to create lixi.',
  'account.selectLixiFirst': 'Please Select an account first before creating lixi',
  'account.random': 'Random',
  'account.fixed': 'Fixed',
  'account.divided': 'Divided',
  'account.equal': 'Equal',
  'account.eachClaim': 'Value of each claim',
  'account.perPack': 'Per pack',
  'account.lixiForPack': 'lixi/package',
  'account.numberLixiPerPackage': 'number of sub lixi per package',
  'account.numberOfSubLixi': 'Number of codes',
  'account.defaultValueToGive': 'Default value to give',
  'account.dividedNumber': 'Dividend number (Max 1,000,000)',
  'account.min': 'Min value',
  'account.max': 'Max value',
  'account.minValueToGive': 'Min value to give',
  'account.maxValueToGive': 'Max value to give',
  'account.checkMaxClaim': 'Limit the number of instances',
  'account.maxClaim': 'Number of instances',
  'account.enterMaxClaimNumber': 'Enter max Claim number',
  'account.minStaking': 'Min Staking',
  'account.enterMinStaking': 'Enter minimum staking number',
  'account.activatedTime': 'Select activation time',
  'account.expiryTime': 'Expiry time for your lixi',
  'account.validityFrom': 'Validity from',
  'account.validityTo': 'Validity to',
  'account.createLixi': 'Create Lixi',
  'account.enterLixiName': 'Enter a name for your lixi',
  'account.enterLixiBalance': 'Enter balance for your lixi',
  'account.lixiMessage': 'Enter the lixi message',
  'account.allCountry': 'All of country',
  'account.lo': 'Lotusia',
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
  'account.login': 'Sign In',
  'account.register': 'Register',
  'account.verify': 'Verify',
  'account.emailRequired': ' Email is required',
  'account.passwordRequired': 'Password is required',
  'account.invalidEmail': 'Invalid email address',
  'account.invalidPassword': 'Invalid password',
  'account.matchPassword': 'Password must match',
  'account.repeatPassword': 'Repeat password',
  'account.nameRequired': 'Username is required',
  'account.verificationCodeRequired': 'Verification code is required',
  'account.verificationCodeSent': 'Verification code has been sent to <b>{email}</b>. Please check your inbox !',
  'account.transactionHistory': 'Transaction History',
  'account.loginSuccess': 'Login sucessfully!',
  'account.loginFailed': 'Login failed',
  'account.registerEmailSuccess': 'Register via email success!',
  'account.registerEmailFailed': 'Register via email failed',
  'account.verifiedEmailFailed': 'Email is not verified',
  'account.budget': 'Budget',
  'account.balance': 'Balance',
  'account.country': 'Applying country',
  'account.envelope': 'Image',
  'account.networkType': 'Network Type',
  'account.recent': 'Recent',
  'account.reply': 'Reply',
  'account.from': 'From',
  'account.to': 'To',
  'account.insufficientFunds': 'Insufficient funds',
  'account.insufficientBurningFunds': 'Insufficient funds to continue burning',
  'account.burning': 'Burning',
  'account.burningList': 'Burning {burnForType} for {burnValue} XPI',

  /* 03.Lixi */
  'lixi.createLixi': 'Create new lixi',
  'lixi.sectionCreateLixi': 'Section create new lixi',
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
  'lixi.validCountries': 'Valid Countries',
  'lixi.allCountries': 'All of countries',
  'lixi.minStake': 'Minimum Staking: {newMinStaking}',
  'lixi.expireAt': 'Expiry at:',
  'lixi.activatedAt': 'Activate at:',
  'lixi.settingConfirm': 'Please confirm your lixi settings.',
  'lixi.name': 'Name',
  'lixi.fundForAccount': 'Fund for the account:',
  'lixi.optionFamilyFriendly': 'Option: Family Friendly',
  'lixi.optional': 'Optional',
  'lixi.networkType': 'Network Type: {networkType}',
  'lixi.lixiInfo': 'Lixi info for {lixiName}',
  'lixi.claimType': 'Claim Type',
  'lixi.type': 'Type of code',
  'lixi.rules': 'Rules',
  'lixi.totalClaimed': 'Total Claimed',
  'lixi.remaining': 'Remaining',
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
  'lixi.fileSizeError': 'Image must smaller than 10MB!',
  'lixi.fileUploadError': 'Error uploading to server',
  'lixi.fileUploadSuccess': 'Upload Successfully',
  'lixi.uploadDividerText': 'Custom Enevelope',
  'lixi.browser': 'Browser',
  'lixi.uploadText': 'Upload',
  'lixi.uploadingText': 'Uploading...',
  'lixi.previewFileFailed': 'Cannot preview file',
  'lixi.envelopesSelect': 'Select from our library',
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
  'lixi.registrantAddress': "Registrant's Address",
  'lixi.addressCopied': 'The address has been copied.',
  'lixi.redeemLixi': 'Redeem lixi',
  'lixi.status': 'Status',
  'lixi.active': 'Active',
  'lixi.archived': 'Archived',
  'NetworkType.SingleIP': 'Single IP',
  'NetworkType.FamilyFriendly': 'Family Friendly',
  'NetworkType.NoWifiRestriction': 'No Wifi Restriction',
  'NetworkType.SingleIPInfo': 'Only one user can claim Lixi under the wifi network',
  'NetworkType.FamilyFriendlyInfo': 'Max 5 users can claim Lixi under the wifi network',
  'NetworkType.NoWifiRestrictionInfo': 'Unlimited user can claim Lixi under the wifi network',
  'lixi.detail': 'Details of lixi',
  'lixi.accountLixi': 'Account of lixi ',
  'lixi.balance': 'Balance',
  'lixi.valuePerClaim': 'Value per claim',
  'lixi.validity': 'Validity',
  'lixi.overview': 'Claim Overview',
  'lixi.archive': 'Archive',
  'lixi.unarchive': 'Unarchive',
  'lixi.withdraw': 'Withdraw',
  'lixi.withdrawn': 'Withdrawn',
  'lixi.claimed': 'Claimed',
  'lixi.budget': 'Budget',
  'lixi.redeemed': 'Redeemed',

  /* 04.Claim */
  'claim.claim': 'Claim',
  'claim.claimReport': 'Claim Report',
  'claim.titleShared': 'Lixi Program sent you a small gift!',
  'claim.copyToClipboard': 'Link copied to clipboard',
  'claim.youClaimedLixi': 'Successful claim',
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
  'settings.general': 'General Settings',
  'settings.lockApp': 'Lock App',
  'settings.notifications': 'Notifications',
  'settings.notSupported': 'Not Supported',
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
  'settings.en': 'English',
  'settings.vi': 'Vietnamese',
  'settings.allowNotification': 'Allow notification for the',
  'settings.forBrowser': 'browser on your device',
  'settings.thenAllowNotification': 'Then allow notification for',
  'settings.lixilotusOnBrower': 'lixilotus.com on your browser',
  'settings.enableNotification': 'Enable Notification',
  'settings.grantPermisson': 'You will be prompted to grant permisson for notification, Please click "Allow"',
  'settings.ok': 'OK',
  'settings.permissionError': 'Error - Permision Error',
  'settings.blockedDevice': 'Blocked by device',
  'setting.notSupported': 'Not Supported',
  'setting.gotIt': 'Got It',
  'settings.howEnableNotification': 'How to enable notification',
  'settings.deviceSupport': 'This feature works best with Chrome or Brave on Android device',
  'settings.twoStepEnableNotification': '2 steps to enable notification',

  /* 06.Countries */
  'country.all': 'All of country',
  'country.vn': 'Vietnam',
  'country.us': 'United States',
  'country.id': 'Indonesia',
  'country.ph': 'Philippines',
  'country.lo': 'Lotusia',

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
  'notification.earlier': 'Earlier',
  'notification.readAll': 'Read all',

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
  'send.syntaxError': 'Lỗi cú pháp. XPI để tặng không được nhỏ hơn hoặc bằng 0',

  /* 12.Zero balance header */
  'zeroBalanceHeader.noBalance': 'You currently have 0 {ticker}',
  'zeroBalanceHeader.deposit': 'Deposit some funds to use this feature',

  /* 13.Page */
  'page.createNewPage': 'Create new page',
  'page.createPage': 'Create page',
  'page.yourPage': 'Your pages',
  'page.discover': 'Discover',
  'page.createYourPage': 'Create your page',
  'page.editPage': 'Edit profile',
  'page.editCoverPhoto': 'Edit cover photo',
  'page.updatePage': 'Update page’s information',
  'page.name': 'Name',
  'page.inputName': 'Please input name',
  'page.inputNamePattern': 'Name must contain at least 6 characters',
  'page.category': 'Category',
  'page.selectCategory': 'Please select category',
  'page.title': 'Title',
  'page.titleShared': 'Please input title',
  'page.inputTitle': 'Please input title',
  'page.walletAddress': 'Wallet address',
  'page.avatar': 'Avatar Update',
  'page.chooseAvatar': 'Choose picture avatar...',
  'page.cover': 'Cover Update',
  'page.chooseCover': 'Choose picture cover...',
  'page.upload': 'Click to upload',
  'page.website': 'Website',
  'page.description': 'Description',
  'page.countryName': 'Country',
  'page.country': 'Search to select country',
  'page.stateName': 'State',
  'page.state': 'Search to select state',
  'page.address': 'Address',
  'page.inputAddress': 'Please input address',
  'page.createPostFee': 'Create post fee',
  'page.createCommentFee': 'Create comment fee',
  'page.couldNotpostPage': 'Could not create page',
  'page.createPageSuccessful': 'Create page successful',
  'page.unableCreatePageServer': 'Unable to create page on server',
  'page.updatePageSuccessful': 'Update the page successful',
  'page.errorWhenCreatePage': "There's an error happens when create new Page",
  'page.copyToClipboard': 'Link copied to clipboard',
  'page.unableCreatePage': 'Unable to create page.',
  'page.unableUpdatePage': 'Unable to update the page.',
  'page.xpiHasBurned': 'XPI has been burned',
  'page.noXpiHasBurned': 'No one has burned for this page!',
  'page.selectAccountFirst': 'Please Select an account first before creating page',

  /* 14.Country */
  'country.unablegetCountries': 'Unable to get countries',
  'country.unablegetStates': 'Unable to get states',

  /* 15.Post */
  'general.allPost': 'All',
  'general.followsPost': 'Follows',
  'post.createNewPage': 'Create new post',
  'post.createPost': 'Create post',
  'post.editPost': 'Edit unburnt post',
  'post.edited': 'Edited',
  'post.name': 'Name',
  'post.inputName': 'Please input name',
  'post.title': 'Title',
  'post.titleShared': 'Please input title',
  'post.inputTitle': 'Please input title',
  'post.walletAddress': 'Wallet address',
  'post.avatar': 'Avatar',
  'post.cover': 'Cover',
  'post.upload': 'Click to upload',
  'post.website': 'Website',
  'post.description': 'Description',
  'post.countryName': 'Country',
  'post.country': 'Search to select country',
  'post.stateName': 'State',
  'post.state': 'Search to select state',
  'post.address': 'Address',
  'post.inputAddress': 'Please input address',
  'post.createPostSuccessful': 'Create post successful',
  'post.editPostSuccessful': 'Update post successful',
  'post.unableCreatePostServer': 'Unable to create post on server',
  'post.unableEditPostServer': 'Unable to create post on server',
  'post.errorWhenCreatePage': "There's an error happens when create new Page",
  'post.copyToClipboard': 'Link copied to clipboard',
  'post.unableCreatePost': 'Unable to create post.',
  'post.unableUpdatePost': 'Unable to update the post.',
  'post.selectAccountFirst': 'Please Select an account first before creating post',
  'post.content': 'Content',
  'post.unableToBurn': 'Unable to burn for the post',
  'post.burning': 'Burning post',
  'post.doneBurning': 'Done burning post!',
  'post.page': 'Page',
  'post.token': 'Token',
  'post.public': 'Public',

  /* 16.Token */
  'token.importToken': 'Import token',
  'token.couldNotpostToken': 'Could not create token',
  'token.createTokenSuccessful': 'Create token successful',
  'token.unableCreateTokenServer': 'Unable to create token on server',
  'token.errorWhenCreateToken': "There's an error happens when create new Token",
  'token.couldNotFindToken': 'Could not find tokens',
  'token.unableCreateToken': 'Unable to create token.',
  'token.unableSelect': 'Unable to select token',
  'token.inputTokenId': 'Input token Id',
  'token.tokenIdNotFound': 'Token ID not found',
  'token.tokenIdInvalid': 'Token ID invalid',
  'token.copyId': 'The token Id has been copied.',
  'token.unableToBurn': 'Unable to burn for the token',
  //Show more info in token page
  'token.ticker': 'Ticker',
  'token.name': 'Name',
  'token.burntxpi': 'Burnt XPI',
  'token.id': 'ID',
  'token.created': 'Created',
  'token.comments': 'Comments',

  /* 17. Comment */
  'comment.unableCreateComment': 'Unable to create comment',
  'comment.unableToBurn': 'Unable to burn for the comment',
  'comment.writeComment': 'Write a comment...',
  'comment.writeCommentFree': 'Write a free comment on this page...',
  'comment.writeCommentXpi': '{commentFee} to comment on this page...',

  /* 18. Category */
  'category.art': 'Art',
  'category.crafts': 'Crafts',
  'category.dance': 'Dance',
  'category.film': 'Film',
  'category.foodAndDrinks': 'Food And Drinks',
  'category.games': 'Games',
  'category.gardening': 'Gardening',
  'category.houseDecor': 'House Decor',
  'category.literature': 'Literature',
  'category.music': 'Music',
  'category.networking': 'Networking',
  'category.party': 'Party',
  'category.religion': 'Religion',
  'category.shopping': 'Shopping',
  'category.sports': 'Sports',
  'category.theater': 'Theater',
  'category.wellness': 'Wellness',
  'category.carsAndVehicles': 'Cars And Vehicles',
  'category.comedy': 'Comedy',
  'category.economicsAndTrade': 'Economics And Trade',
  'category.education': 'Education',
  'category.entertainment': 'Entertainment',
  'category.moviesAndAnimation': 'Movies And Animation',
  'category.historyAndFacts': 'History And Facts',
  'category.lifeStyle': 'Life Style',
  'category.nature': 'Nature',
  'category.newsAndPolitics': 'News And Politics',
  'category.peopleAndNations': 'People And Nations',
  'category.petsAndAnimals': 'Pets And Animals',
  'category.placesAndRegions': 'Places And Regions',
  'category.scienceAndTechnology': 'Science And Technology',
  'category.healthAndFitness': 'Health And Fitness',
  'category.travelAndEvents': 'Travel And Events',
  'category.other': 'Other',
  'category.cryptoCurrencies': 'Crypto Currencies',
  'category.realEstate': 'Real Estate',
  'category.agriculture': 'Agriculture',
  'category.permaculture': 'Permaculture',
  'category.humanitarian': 'Humanitarian',
  'category.hospitality': 'Hospitality',

  /* 19. Webpush */
  'webpush.unableToSubscribe': 'Unable to subscriber.',
  'webpush.unableToUnsubscribe': 'Unable to unsubscriber.',
  'webpush.serviceWorkerNotReady': 'The service worker is not ready.',

  /* 20. Follow*/
  'general.follow': 'Follow',
  'general.followBack': 'Follow back',
  'general.unfollow': 'Unfollow',
  'general.followers': 'Followers',
  'general.followings': 'Followings',
  'general.youFollow': 'You Follow',
  'general.followingPages': 'Following Pages',
  'follow.followSuccess': 'Follow successful',
  'follow.followFailure': 'Follow failure'
};
