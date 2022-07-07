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
  'general.accounts': 'Tài khoản',
  'general.lixi': 'Lì xì',
  'general.claim': 'Nhận Lì xì',
  'general.settings': 'Cài đặt',
  'general.registerPack': 'Đăng ký Pack Lì xì',
  'general.swapCard': 'Đổi thẻ',
  'general.connectionLost': 'Mất kết nối API',
  'general.reEstablishing': 'Đang thiết lập lại kết nối...',
  'general.qrScannerError': 'Xảy ra lỗi khi scan QR code:',
  'general.scanQRCode': 'Quét mã QR',
  'general.scanQRCodeError':
    'Lỗi trong lúc quét mã QR. Vui lòng đảm bảo rằng máy ảnh của bạn đang không sử dụng vào mục đích khác. Do các yêu cầu giới hạn của Apple với các trình duyệt thứ ba, bạn phải sử dụng trình duyệt của Safari để quét mã QR từ điện thoại iPhone.',
  'general.num': 'STT',
  'general.amount': 'Số dư',

  /* 02.Account */
  'account.mnemonicRequired': 'Bạn cần nhập đúng cụm từ bảo mật',
  'account.mnemonic': 'mnemonic (cụm từ bảo mật)',
  'account.manageLixi': 'Quản lí Lì xì',
  'account.refreshLixiList': 'Làm mới danh sách',
  'account.unableCreateLixi': 'Tạo Lì xì không thành công.',
  'account.selectLixiFirst': 'Hãy chọn một tài khoản trước khi tạo Lì xì',
  'account.random': 'Ngẫu nhiên',
  'account.fixed': 'Cố định',
  'account.divided': 'Giảm dần',
  'account.equal': 'Chia đều',
  'account.perPack': 'SL mỗi gói',
  'account.numberLixiPerPackage': 'Số lượng bao lì xì phụ trong mỗi gói ',
  'account.numberOfSubLixi': 'Số lượng bao Lì xì phụ',
  'account.defaultValueToGive': 'Tổng giá trị gửi tặng',
  'account.dividedNumber': 'số bao Lì xì (tối đa 1,000,000)',
  'account.min': 'Từ',
  'account.max': 'Đến',
  'account.minValueToGive': 'Từ',
  'account.maxValueToGive': 'Đến',
  'account.maxClaim': 'Số lượt Lì xì',
  'account.enterMaxClaimNumber': 'Nhập số lượt Lì xì',
  'account.minStaking': 'Số lượng stake tối thiểu',
  'account.enterMinStaking': 'Nhập số lượng stake tối thiểu',
  'account.expiryTime': 'Thời hạn nhận Lì xì',
  'account.activatedTime': 'Thời gian kích hoạt Lì xì',
  'account.createLixi': 'Tạo Lì xì',
  'account.enterLixiName': 'Nhập tên Lì xì của bạn',
  'account.enterLixiBalance': 'Nhập số dư ban đầu Lì xì của bạn',
  'account.lixiMessage': 'Nhập thông điệp cho Lì xì của bạn',
  'account.allCountry': 'Tất cả Quốc gia',
  'account.advance': 'Nâng cao',
  'account.amount': 'Số dư',
  'account.singleCode': 'Single code',
  'account.oneTimeCode': 'One-time codes',
  'account.familyFriendly': 'Gia đình cùng nhận Lì xì',
  'account.sub-lixi': 'Lì xì phụ',
  'account.couldNotFetchAccount': 'Không thể làm mới tài khoản.',
  'account.unableGetAccountFromServer': 'Không thể lấy thông tin tài khoản từ máy chủ',
  'account.couldNotPostAccount': 'Không thể cập nhật thông tin tài khoản.',
  'account.createAccountSuccessful': 'Tạo tài khoản thành công.',
  'account.unableToCreateServer': 'Máy chủ không thể thực hiện tạo tài khoản.',
  'account.unableToImport': 'Không thể khôi phục tài khoản.',
  'account.unableToSelect': 'Không thể chọn tài khoản.',
  'account.unableToRename': 'Không thể đổi tên tài khoản.',
  'account.unableToChangeLocaleAccount': 'Đổi ngôn ngữ không thành công.',
  'account.unableToDelete': 'Không thể xóa tài khoản.',
  'account.unableToRefresh': 'Không thể làm mới danh sách Lì xì.',
  'account.renameFailed': 'Đổi tên tài khoản không thành công. Hãy thử lại với một tên khác.',
  'account.deleteFailed': 'Xóa tài khoản không thành công.',
  'account.accountRenamedSuccess': 'Tài khoản được sửa lại thành {accountName}.',
  'account.accountDeleteSuccess': 'Xóa tài khoản thành công.',
  'account.accountImportSuccess': 'Tài khoản được nhập thành công.',
  'account.accountChangeLocaleSuccess': 'Ngôn ngữ được cập nhật thành {language}.',

  /* 03.Lixi */
  'lixi.sub-lixi': 'Bao lì xì phụ',
  'lixi.dividedBy': 'Chia cho',
  'lixi.fundGiveFixed': 'Loại Lì xì: Cố định',
  'lixi.fixedFund': 'Giá trị:',
  'lixi.fundGiveDividend': 'Loại Lì xì: Giảm dần',
  'lixi.dividedFund': 'Giá trị:',
  'lixi.fundGiveEqual': 'Loại Lì xì: Chia đều',
  'lixi.equalFund': 'Giá trị:',
  'lixi.fundGiveRandomize': 'Loại Lì xì: Ngẫu nhiên',
  'lixi.randomFund': 'Từ: {newLixiMinValue}; Đến: {newLixiMaxValue}',
  'lixi.amount': 'Tổng cộng: {newLixiAmount}',
  'lixi.NumberOfSub': 'Số lượng bao Lì xì phụ: {newNumberOfSubLixi}',
  'lixi.numberLixiPerPackage': 'Số lượng bao lì xì phụ trong mỗi gói: {newNumberLixiPerPackage}',
  'lixi.package': 'Package',
  'lixi.maxClaim': 'Số lần nhận tối đa: {newMaxClaim}',
  'lixi.country': 'Quốc gia: ',
  'lixi.minStake': 'Số lần trữ tới thiểu: {newMinStaking}',
  'lixi.expireAt': 'Hến hạn vào:',
  'lixi.activatedAt': 'Kích hoạt vào:',
  'lixi.settingConfirm': 'Hãy xác nhận thông tin Lì xì của bạn.',
  'lixi.name': 'Tên:',
  'lixi.fundForAccount': 'Chi từ tài khoản:',
  'lixi.optionFamilyFriendly': 'Tùy chọn: Gia đình cùng nhận Lì xì"',
  'lixi.optional': 'Tùy chọn',
  'lixi.lixiInfo': 'Thông tin Lì xì {lixiName}',
  'lixi.claimType': 'Loại Lì xì',
  'lixi.type': 'Loại',
  'lixi.totalClaimed': 'Lì xì đã nhận',
  'lixi.remainingLixi': 'Lì xì còn lại',
  'lixi.remainingXPI': 'XPI còn lại',
  'lixi.message': 'Thông điệp',
  'lixi.loadmore': 'Xem thêm',
  'lixi.lixiDetail': 'Bấm để xem chi tiết Lì xì',
  'lixi.downloadCode': 'Tải về mã code',
  'lixi.copyClaim': 'Sao chép mã code',
  'lixi.refreshLixi': 'Làm mới Lì xì',
  'lixi.exportLixi': 'Export Lixi',
  'lixi.noLixiSelected': 'Chọn ít nhất một Lì xì',
  'lixi.fileTypeError': 'Bạn chỉ có thể tải lên tệp JPG!',
  'lixi.fileSizeError': 'Hình ảnh phải nhỏ hơn 2MB!',
  'lixi.lixiPostcard': 'Bưu thiếp Lì xì',
  'lixi.renameLixi': 'Đổi tên Lì xi',
  'lixi.enterNewLixiName': 'Nhập tên mới cho Lì xì',
  'lixi.lixiLengthError': 'Tên Lì xì phải là một chuỗi dài từ 1 đến 24 ký tự',
  'lixi.couldNotFetchLixi': 'Không thể làm mới Lì xì',
  'lixi.unableGetLixi': 'Không thể lấy thông tin Lì xì từ máy chủ',
  'lixi.unableGetChildLixi': 'Không thể lấy thông tin Lì xì phụ từ máy chủ',
  'lixi.unableCreateLixi': 'Không tạo được Lì xì.',
  'lixi.unableCreateChildLixi': 'Máy chủ tạo các Lì xì phụ không thành công',
  'lixi.couldNotPostLixi': 'Không thể tạo Lì xì từ máy chủ.',
  'lixi.createLixiSuccessful': 'Tạo mới Lì xì thành công.',
  'lixi.errorWhenCreateLixi': 'Lỗi không xác định. Tạo Lì xì không thành công.',
  'lixi.unableCreateLixiServer': 'Máy chủ tạo mới Lì xì không thành công',
  'lixi.unableRegisterLixiPack': 'Không thể đăng ký pack Lì xì',
  'lixi.unableRefresh': 'Không thể làm mới Lì xì.',
  'lixi.unableSelect': 'Không thể chọn lì xì.',
  'lixi.unableUnlock': 'Không thể mở khóa Lì xì.',
  'lixi.unableLock': 'Không thể khóa Lì xì.',
  'lixi.unableWithdraw': 'Không thể rút Lì xì.',
  'lixi.unableRename': 'Unable to rename the lixi.',
  'lixi.unableExportSub': 'Không thể trích xuất các Lì xì phụ.',
  'lixi.unableExport': 'Không thể trích xuất Lì xì.',
  'lixi.errorWhenUnlock': 'Lỗi không xác định. Mở khóa Lì xì không thành công.',
  'lixi.errorWhenLock': 'Lỗi không xác định. Khóa Lì xì không thành công.',
  'lixi.errorWhenWithdraw': 'Lỗi không xác định. Rút Lì xì không thành công.',
  'lixi.refreshSuccess': 'Làm mới Lì xì thành công.',
  'lixi.unlockSuccess': 'Mở khóa Lì xì thành công.',
  'lixi.lockSuccess': 'Khóa Lì xì thành công.',
  'lixi.withdrawSuccess': 'Rút Lì xì thành công.',
  'lixi.renameSuccess': 'Lì xì đã được đổi tên thành {lixiName}',
  'lixi.registerSuccess': 'Đăng ký pack Lì xì thành công',
  'lixi.renameFailed': 'Đổi tên không thành công. Hãy thử lại với một tên khác.',
  'lixi.isNFTEnabled': 'Kích hoạt NFT',
  'lixi.optionNFTEnabled': 'Tùy chọn: Kích hoạt NFT',
  'lixi.unableDownloadSub': 'Không thể tải về các Lì xì phụ.',

  /* 04.Claim */
  'claim.claim': 'Nhận Lì xì',
  'claim.titleShared': 'Lì xì gửi đến bạn một món quà nhỏ!',
  'claim.copyToClipboard': 'Liên kết đã được sao chép',
  'claim.youClaimedLixi': 'bạn vừa nhận được Lì xì',
  'claim.addressNotValid': 'Địa chỉ {ticker} không hợp lệ',
  'claim.invalidAddress': 'Địa chỉ {ticker} không hợp lệ',
  'claim.tickerAddress': 'Địa chỉ {ticker}',
  'claim.claimCode': 'Mã Lì xì',
  'claim.claimSuccess': 'Nhận thành công',
  'claim.unableClaim': 'Nhận không thành công',
  'claim.claimSuccessAmount': 'Nhận thành công {xpiAmount} XPI',
  'claim.claimCodeCopied': 'Sao chép mã nhận Lì xì thành công',
  'claim.unableDownloadClaimCode': 'Không thể tải mã nhạn Lì xì.',
  'claim.pleaseCopyManually': 'Hãy thử sao chép mã Lì xì và tiếp tục',
  'claim.withdrawSuccess': 'Rút thành công',
  'claim.refreshSuccess': 'Làm mới thành công',

  'settings.settings': 'Cài đặt',

  /* 05.Settings */
  'settings.languages': 'Ngôn ngữ',
  'settings.backupAccount': 'Sao lưu tài khoản của bạn',
  'settings.manageAccounts': 'Quản lý tài khoản',
  'settings.newAccount': 'Tạo tài khoản mới',
  'settings.importAccount': 'Khôi phục tài khoản',
  'settings.savedAccount': 'Tài khoản đã lưu',
  'settings.activated': 'Ví đang kích hoạt',
  'settings.revealPhrase': 'Nhấp vào để hiển thị cụm từ bảo mật gốc',
  'settings.backupAccountWarning':
    'Cụm từ bảo mật gốc là chìa khóa duy nhất để bạn lấy lại ví. Viết ra và lưu cụm từ bảo mật gốc ở nơi an toàn.',
  'settings.backupAccountHint': 'Sao chép và dán cụm từ bảo mật của bạn bên dưới để khôi phục tài khoản hiện có',
  'settings.accountLengthMessage': 'Tên tài khoản phải là một chuỗi dài từ 1 đến 24 ký tự',
  'settings.enterAccountName': 'Nhập tên tài khoản',
  'settings.renameAccount': 'Đổi tên tài khoản',
  'settings.deleteAccountConfirm': 'Nhập "delete {account}" để xác nhận',
  'settings.deleteAccountConfirmMessage': 'Bạn có chắc muốn xóa tài khoản "{account}"?',
  'settings.yourConfirmationPhraseMustExact': 'Bạn phải nhập chính xác cụm từ xác nhận',
  en: 'Tiếng Anh',
  vi: 'Tiếng Việt',

  /* 06.Countries */
  'country.all': 'Tất cả Quốc gia',
  'country.vn': 'Việt Nam',
  'country.us': 'United States',
  'country.id': 'Indonesia',
  'country.ph': 'Philippines',

  /* 07.Onboarding */
  'onboarding.dontForgetBackup': 'Đừng quên sao lưu tài khoản của bạn',
  'onboarding.dontForgetBackupConfirm': 'Ok, tạo tài khoản!',
  'onboarding.dontForgetBackupDescription':
    'Một khi tài khoản của bạn đã được tạo, bạn có thể sao lưu tài khoản bằng cách viết ra, ghi nhớ và lưu lại 12 từ trong cụm từ bảo mật gốc. Bạn có thể tìm cụm từ bảo mật gốc ở trang Cài Đặt. Nếu bạn đang vào trình duyệt dưới dạng ẩn danh hoặc bạn xóa lịch sử trình duyệt, bạn sẽ mất tất cả tiền mã hóa chưa được sao lưu',
  'onboarding.newAccount': 'Tạo tài khoản mới',
  'onboarding.cancel': 'Hủy',
  'onboarding.importAccount': 'Khôi phục tài khoản',
  'onboarding.import': 'Khôi phục',
  'onboarding.welcomeToLotus': 'Chào mừng bạn đến với LixiLotus!',
  'onboarding.lixiLotusIntroduce1':
    'LixiLotus là một ví sử dụng tiền mã hóa Lotus hoạt động trên trình duyệt web với mã nguồn mở không bị giám sát. ',
  'onboarding.lixiLotusIntroduce2': 'LixiLotus cho phép bạn cho đi Lotus một cách dễ dàng.',
  'onboarding.lixiLotusIntroduce3': 'Để bắt đầu, hãy cài đặt LixiLotus vào thiết bị của bạn theo',
  'onboarding.lixiLotusIntroduce4': 'hướng dẫn',

  /* 08.Envelope */
  'envelope.unableGetEnvelope': 'Không thể tải phong bì từ máy chủ',
  'envelope.pleaseSelectEnvelope': 'Hãy chọn 1 phong bì bạn thích',
  'envelope.couldNotFetch': 'Không thể làm mới phong bì.',

  /* 09.Notification */
  'notification.unableToFetch': 'Không thể tải thông báo.',
  'notification.unableToDelete': 'Không thể xóa thông báo.',
  'notification.unableToRead': 'Không thể đọc thông báo.',

  /* 10.NFT */
  'lixinft.unableToMint': 'Không thể tạo NFT',

  /* 11.Register */
  'register.register': 'Register'
};
