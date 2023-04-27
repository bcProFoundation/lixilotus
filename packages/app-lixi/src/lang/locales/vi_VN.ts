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
  'special.or': 'Hoặc',
  'special.cancel': 'Hủy bỏ',
  'special.copy': 'Sao chép',
  'label.shortId': 'ID rút gọn',
  'label.ticker': 'Mã',
  'label.name': 'Tên',
  'label.burnXPI': 'Đốt XPI',
  'label.comment': 'Bình luận',
  'label.created': 'Khởi tạo',
  'label.action': 'Hành động',
  'text.createPage':
    'Trang là không gian nơi mọi người có thể kết nối công khai với doanh nghiệp, thương hiệu cá nhân hoặc tổ chức của bạn. Bạn có thể làm những việc như giới thiệu sản phẩm và dịch vụ, quyên góp.',
  'text.createPageName':
    'Sử dụng tên doanh nghiệp, thương hiệu hoặc tổ chức của bạn hoặc tên giải thích nội dung của Trang.',
  'text.createPageCategory': 'Chọn một danh mục mô tả loại hình kinh doanh, tổ chức hoặc chủ đề mà Trang đại diện.',
  'text.createPageDescription':
    'Viết về hoạt động kinh doanh của bạn, các dịch vụ bạn cung cấp hoặc mục đích của Trang.',
  'text.post': 'bài viết',
  'text.selectXpi': 'Bạn muốn đốt bao nhiêu Xpi cho {name}?',
  'burn.selectXpi': 'Vui lòng chọn số lượng Xpi bạn muốn đốt cho {name}',
  'burn.post': 'bài viết',
  'burn.comment': 'bình luận',
  'burn.token': 'token',
  'burn.doneBurning': 'Đốt thành công!',

  /* 01.General */
  'general.tokens': 'Tokens',
  'general.home': 'Nhà',
  'general.accounts': 'Tài khoản',
  'general.lixi': 'Quản lý lì xì',
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
  'general.scanBarcode': 'Quét mã vạch',
  'general.scanBarcodeError':
    'Lỗi trong lúc quét mã Barcode. Vui lòng đảm bảo rằng máy ảnh của bạn đang không sử dụng vào mục đích khác. Do các yêu cầu giới hạn của Apple với các trình duyệt thứ ba, bạn phải sử dụng trình duyệt của Safari để quét mã barcode từ điện thoại iPhone.',
  'general.num': 'STT',
  'general.amount': 'Số dư',
  'general.chooseCamera': 'Chọn camera',
  'general.chooseCameraTip': 'Thử đổi camera nếu quét không thành công',
  'general.notifications': 'Thông báo',
  'general.viewmore': 'Xem thêm',
  'general.ended': 'Đã kết thúc',
  'general.running': 'Đang hoạt động',
  'general.waiting': 'Vui lòng đợi',
  'general.page': 'Trang',
  'general.sendLotus': 'Send Lotus',
  'general.lotusiaShop': 'Cửa hàng Lotusia',
  'general.send': 'Gửi',
  'general.createPage': 'Tạo trang',
  'general.pages': 'Trang',
  'general.profile': 'Hồ sơ',
  'general.claimed': 'Lì xì đã nhận',
  'general.manageAccounts': 'Quản lý tài khoản',
  'general.subTitleSettings': 'Đặt cài đặt bảo mật và thông báo',
  'general.manageLixi': 'Quản lý lì xì',
  'general.manageInfo': 'Quản lý thông tin',
  'general.managePage': 'Quản lý trang',
  'general.manageNotifications': 'Quản lý thông báo',
  'general.feedPage': 'Khám phá và kết nối với các doanh nghiệp trên LixiLotus',
  'general.subTitleEditPage': 'Thay đổi thông tin trang của bạn',
  'general.subTitleClaimed': 'Chi tiết lì xì đâ nhận',
  'general.notFoundTitle': 'Opp! Không tìm thấy trang',
  'general.notFoundDescription': 'Xin lỗi, Chúng tôi không thể tìm thấy trang bạn đang tìm',
  'general.goBackToHome': 'Trở về trang chủ',
  'general.searchResults': 'Kết quả tìm kiếm của "{text}"',
  'general.post': 'Đăng',
  'general.burnUp': 'Đốt lên',
  'general.burnDown': 'Đốt xuống',
  'general.more': 'Thêm',
  'general.goodOrNot': 'Tốt hay không?',
  'general.customBurn': 'Tùy chọn đốt',
  'general.burnForType': 'Đốt cho loại',
  'general.failed': 'Thất bại',
  'general.minBurnt': 'XPI tối thiểu đã đốt:',
  'general.showMore': 'Xem thêm',
  'general.showLess': 'Xem ít',
  'general.topAccounts': 'Xếp hạng tài khoản đã đốt',

  /* 02.Account */
  'account.mnemonicRequired': 'Bạn cần nhập đúng cụm từ bảo mật',
  'account.mnemonic': 'mnemonic (cụm từ bảo mật)',
  'account.manageLixi': 'Quản lí Lì xì',
  'account.managePage': 'Quản lí Trang',
  'account.refreshLixiList': 'Làm mới danh sách',
  'account.unableCreateLixi': 'Tạo Lì xì không thành công.',
  'account.selectLixiFirst': 'Hãy chọn một tài khoản trước khi tạo Lì xì',
  'account.random': 'Ngẫu nhiên',
  'account.fixed': 'Cố định',
  'account.divided': 'Giảm dần',
  'account.equal': 'Chia đều',
  'account.eachClaim': 'Mệnh giá mỗi lần nhận',
  'account.perPack': 'SL mỗi gói',
  'account.lixiForPack': 'lì xì/gói',
  'account.numberLixiPerPackage': 'Số lượng bao lì xì phụ trong mỗi gói ',
  'account.numberOfSubLixi': 'Số lượng bao Lì xì phụ',
  'account.defaultValueToGive': 'Tổng giá trị gửi tặng',
  'account.dividedNumber': 'số dư lì xì (tối đa 1,000,000)',
  'account.min': 'Từ',
  'account.max': 'Đến',
  'account.minValueToGive': 'Từ',
  'account.maxValueToGive': 'Đến',
  'account.checkMaxClaim': 'Giới hạn số lượng lì xì',
  'account.maxClaim': 'Số lượng phiên bản',
  'account.enterMaxClaimNumber': 'Nhập số lượt Lì xì',
  'account.minStaking': 'Số lượng stake tối thiểu',
  'account.enterMinStaking': 'Nhập số lượng stake tối thiểu',
  'account.expiryTime': 'Thời hạn nhận Lì xì',
  'account.activatedTime': 'Thời gian kích hoạt Lì xì',
  'account.validityFrom': 'Hiệu lực từ',
  'account.validityTo': 'Hiệu lực đến',
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
  'account.login': 'Đăng nhập',
  'account.register': 'Đăng ký',
  'account.verify': 'Xác thực',
  'account.emailRequired': ' Vui lòng nhập email',
  'account.passwordRequired': 'Vui lòng nhập mật khẩu',
  'account.invalidEmail': 'Email không hợp lệ',
  'account.invalidPassword': 'Mật khẩu không hợp lệ',
  'account.matchPassword': 'Mật khẩu phải trùng',
  'account.repeatPassword': 'Vui lòng nhập lại mật khẩu ',
  'account.nameRequired': 'Vui lòng nhập tên đăng nhập',
  'account.verificationCodeRequired': 'Vui lòng nhập mã xác thực',
  'account.verificationCodeSent': 'Mã xác thực đã được gửi tới <b>{email}</b>. Vui lòng kiểm tra email của bạn !',
  'account.transactionHistory': 'Lịch sử giao dịch',
  'account.loginSuccess': 'Đăng nhập thành công!',
  'account.loginFailed': 'Đăng nhập thất bại',
  'account.registerEmailSuccess': 'Đăng kí qua email thành công!',
  'account.registerEmailFailed': 'Đăng kí qua email thất bại',
  'account.verifiedEmailFailed': 'Email không hợp lệ',
  'account.budget': 'Ngân sách',
  'account.balance': 'Số dư',
  'account.country': 'Quốc gia áp dụng',
  'account.envelope': 'Hình ảnh',
  'account.networkType': 'Kiểu kết nối',
  'account.recent': 'Gần đây',
  'account.reply': 'Trả lời',
  'account.from': 'Nhận từ',
  'account.to': 'Gửi đến',
  'account.insufficientFunds': 'Không đủ số dư trong ví',
  'account.insufficientBurningFunds': 'Ví không còn đủ số dư để đốt tiếp',
  'account.burning': 'Đang đốt',
  'account.burningList': 'Đang đốt {burnForType} với {burnValue} XPI',

  /* 03.Lixi */
  'lixi.createLixi': 'Tạo lixi mới',
  'lixi.sectionCreateLixi': 'Tạo lixi mới',
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
  'lixi.totalAmountRequire': 'Tổng số lượng cần: {newLixiAmount}',
  'lixi.NumberOfSub': 'Số lượng bao Lì xì phụ: {newNumberOfSubLixi}',
  'lixi.numberLixiPerPackage': 'Số lượng bao lì xì phụ trong mỗi gói: {newNumberLixiPerPackage}',
  'lixi.package': 'Package',
  'lixi.maxClaim': 'Số lần nhận tối đa: {newMaxClaim}',
  'lixi.country': 'Quốc gia: ',
  'lixi.validCountries': 'Các quốc gia hợp lệ',
  'lixi.allCountries': 'Tất cả các quốc gia',
  'lixi.minStake': 'Số lần trữ tới thiểu: {newMinStaking}',
  'lixi.expireAt': 'Hến hạn vào:',
  'lixi.activatedAt': 'Kích hoạt vào:',
  'lixi.settingConfirm': 'Hãy xác nhận thông tin Lì xì của bạn.',
  'lixi.name': 'Tên của lixi',
  'lixi.fundForAccount': 'Chi từ tài khoản:',
  'lixi.optionFamilyFriendly': 'Tùy chọn: Gia đình cùng nhận Lì xì"',
  'lixi.optional': 'Tùy chọn',
  'lixi.networkType': 'Dạng kết nối: {networkType}',
  'lixi.lixiInfo': 'Thông tin Lì xì {lixiName}',
  'lixi.claimType': 'Loại Lì xì',
  'lixi.type': 'Loại mã',
  'lixi.rules': 'Mệnh giá',
  'lixi.totalClaimed': 'Lì xì đã nhận',
  'lixi.remaining': 'Còn lại',
  'lixi.remainingXPI': 'XPI còn lại',
  'lixi.message': 'Thông điệp',
  'lixi.loadmore': 'Xem thêm',
  'lixi.addLeader': 'thêm trưởng nhóm',
  'lixi.lixiDetail': 'Bấm để xem chi tiết Lì xì',
  'lixi.lixiLeader': 'Bấm để xem chi tiết Lì xì',
  'lixi.downloadCode': 'Tải về mã code',
  'lixi.copyClaim': 'Sao chép mã code',
  'lixi.refreshLixi': 'Làm mới Lì xì',
  'lixi.exportLixi': 'Export Lixi',
  'lixi.noLixiSelected': 'Chọn ít nhất một Lì xì',
  'lixi.fileTypeError': 'Bạn chỉ có thể tải lên tệp JPG/PNG/GIF !',
  'lixi.fileSizeError': 'Hình ảnh phải nhỏ hơn 10MB!',
  'lixi.fileUploadError': 'Lỗi khi tải thiệp lên server',
  'lixi.fileUploadSuccess': 'Tải thiệp lên thành công',
  'lixi.uploadDividerText': 'Thiệp tự chọn',
  'lixi.browser': 'Chọn ảnh từ thiết bị',
  'lixi.uploadText': 'Đăng thiệp',
  'lixi.uploadingText': 'Đang tải...',
  'lixi.previewFileFailed': 'Không thể xem trước file',
  'lixi.envelopesSelect': 'Chọn từ mẫu có sẵn',
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
  'lixi.isCharity': 'Quỹ từ thiện',
  'lixi.optionNFTEnabled': 'Tùy chọn: Kích hoạt NFT',
  'lixi.unableDownloadSub': 'Không thể tải về các Lì xì phụ.',
  'lixi.loyaltyProgram': 'Khách hàng thân thiết',
  'lixi.staffAddress': 'Địa chỉ ví nhân viên',
  'lixi.charityAddress': 'Địa chỉ ví từ thiện',
  'lixi.lotteryAddress': 'Địa chỉ ví xổ số',
  'lixi.lotteryAddressCheck': 'Xác nhận',
  'lixi.registrantAddress': 'Địa chỉ người đăng ký',
  'lixi.addressCopied': 'Địa chỉ đã được sao chép.',
  'lixi.redeemLixi': 'Nhận lì xì',
  'lixi.status': 'Trạng thái',
  'lixi.active': 'Hoạt động',
  'lixi.archived': 'Đã khoá',
  'NetworkType.SingleIP': 'Một địa chỉ duy nhất',
  'NetworkType.FamilyFriendly': 'Gia đình thân thiêt',
  'NetworkType.NoWifiRestriction': 'Không giới hạn',
  'NetworkType.SingleIPInfo': 'Chỉ một người dùng có thể nhận Lixi trong mạng wifi',
  'NetworkType.FamilyFriendlyInfo': 'Tối đa người dùng có thể nhận Lixi trong mạng wifi',
  'NetworkType.NoWifiRestrictionInfo': 'Không giới hạn người dùng có thể nhận Lixi trong mạng wifi',
  'lixi.detail': 'Chi tiết lì xì',
  'lixi.accountLixi': 'tài khoản của lì xì',
  'lixi.balance': 'Số dư',
  'lixi.valuePerClaim': 'Giá trị mỗi lần nhận',
  'lixi.validity': 'Hiệu lực',
  'lixi.overview': 'Tổng quan đã nhận',
  'lixi.archive': 'Lưu trữ',
  'lixi.unarchive': 'Hủy lưu trữ',
  'lixi.withdraw': 'Rút tiền',
  'lixi.claimed': 'Đã nhận',
  'lixi.budget': 'Ngân sách',
  'lixi.redeemed': 'Đã nhận',
  /* 04.Claim */
  'claim.claim': 'Nhận Lì xì',
  'claim.claimReport': 'Danh sách đã nhận lì xì',
  'claim.titleShared': 'Lì xì gửi đến bạn một món quà nhỏ!',
  'claim.copyToClipboard': 'Liên kết đã được sao chép',
  'claim.youClaimedLixi': 'Nhận lì xì thành công',
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
  'settings.general': 'Thiết lập chung',
  'settings.lockApp': 'Khóa ứng dụng',
  'settings.notSupported': 'Không hỗ trợ',
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
  'notification.earlier': 'Trước đó',
  'notification.readAll': 'Xem tất cả',

  /* 10.NFT */
  'lixinft.unableToMint': 'Không thể tạo NFT',

  /* 11.Register */
  'register.register': 'Register',

  /* 12.Send */
  'send.unableToSend': 'Không thể gửi thành công',
  'send.sendAmountSmallerThanDust': 'Số tiền gửi nhỏ hơn số tiền gửi tối thiểu"',
  'send.utxoEmpty': 'Danh sách UTXO trống',
  'send.unableSendTransaction': 'Không thể gửi giao dịch',
  'send.insufficientFund': 'Số dư tài khoản không đủ',
  'send.invalidDecimalPlaces': 'Số tiền gửi đi không đúng định dạng',
  'send.insufficientPriority': 'Không đủ phí gửi trên giao dịch',
  'send.networkError': 'Lỗi mạng',
  'send.longMempoolChain': 'Số tiền khả dụng chưa được xác nhận quá nhiều',
  'send.communicateApi': 'Không thể kết nối với máy chủ. Vui lòng thử lại',
  'send.manyAncestors':
    'Bạn đang gửi XPI với nhiều nguồn tiền chưa được xác thưc (giới hạn 50 ). Việc gửi sẽ được gửi đi sau khi nguồn tiền được xác nhận. Hãy thử lại sau 10 phút',
  'send.onlyMessage': 'Chỉ gửi tin nhắn',
  'send.canNotEncryptMessage': 'Không thể mã hoá tin nhắn',
  'send.addressNoOutgoingTrans':
    'Địa chỉ này không có giao dịch gửi đi trước đó, không thể gửi tin nhắn tới địa chỉ này',
  'send.newAddress': 'Địa chỉ này mới được khởi tạo, hãy kiểm tra kỹ trước khi thực hiện giao dịch với số tiền lớn',
  'send.canNotSendToYourSelf': 'Không thể tự gửi cho bản thân!',
  'send.calcMaxError': 'Không thể tính số tiền tối đa bạn có thể gửi',
  'send.sendModalTitle': 'Bạn có muốn gửi số tiền {value} {ticker} tới {address}?',
  'send.queryString':
    'Bạn đang gửi giao dịch với định dạng đặc biệt "{queryStringText}." Chỉ có tham số "amount", với đồng tiền {currency} satoshis, được hỗ trợ.',
  'send.optionalPrivateMessage': 'Tin nhắn riêng tư',
  /* 12.Zero balance header */
  'zeroBalanceHeader.noBalance': 'Hiện tại bạn đang có {ticker} trong tài khoản',
  'zeroBalanceHeader.deposit': 'Hãy nạp thêm vào tài khoản để có thể sử dụng tính năng giao dịch',
  'send.syntaxError': "Syntax error. XPI to give can't be less than or equal to 0",

  /* 13.Page */
  'page.createNewPage': 'Tạo trang mới',
  'page.createPage': 'Tạo trang',
  'page.yourPage': 'Trang của bạn',
  'page.discover': 'Khám phá',
  'page.createYourPage': 'Tạo trang của bạn',
  'page.editPage': 'Cập nhật trang',
  'page.editCoverPhoto': 'Cập nhật ảnh bìa',
  'page.updatePage': 'Cập nhật thông tin của trang',
  'page.name': 'Tên',
  'page.inputName': 'Vui lòng nhập tên',
  'page.category': 'Danh mục',
  'page.title': 'Tiêu đề',
  'page.titleShared': 'Please input title',
  'page.inputTitle': 'Vui lòng nhập tiêu đề',
  'page.walletAddress': 'Địa chỉ ví',
  'page.avatar': 'Cập nhật ảnh đại diện',
  'page.chooseAvatar': 'Chọn ảnh đại diện...',
  'page.cover': 'Cập nhật ảnh bìa',
  'page.chooseCover': 'Chọn ảnh bìa...',
  'page.upload': 'Tải lên',
  'page.website': 'Trang web',
  'page.description': 'Mô tả',
  'page.countryName': 'Quốc gia',
  'page.country': 'Tìm kiếm quốc gia',
  'page.stateName': 'Tỉnh thành',
  'page.state': 'Tìm kiếm tỉnh thành',
  'page.address': 'Địa chỉ',
  'page.inputAddress': 'Vui lòng nhập địa chỉ',
  'page.couldNotpostPage': 'Tạo trang không thành công',
  'page.createPageSuccessful': 'Trang đã tạo thành công',
  'page.updatePageSuccessful': 'Trang đã được cập nhật thành công',
  'page.unableCreatePageServer': 'Không thể kết nối server tạo trang',
  'page.errorWhenCreatePage': 'Đã có lỗi xảy ra khi tạo mới trang',
  'page.copyToClipboard': 'Liên kết đã được sao chép',
  'page.unableCreatePage': 'Không thể tạo trang.',
  'page.unableUpdatePage': 'Không thể sửa trang.',
  'page.selectAccountFirst': 'Hãy chọn một tài khoản trước khi tạo trang',
  'category.foodAndDrink': 'Đồ ăn và thức uống',

  /* 14.Country */
  'country.unablegetCountries': 'Không thể tải quốc gia',
  'country.unablegetStates': 'Không thể tải tỉnh thành',

  /* 15.Post */
  'post.createNewPage': 'tạo bài viết mới',
  'post.createPage': 'tạo bài viết',
  'post.editPost': 'Sửa bài viết chưa đốt',
  'post.edited': 'Đã chỉnh sửa',
  'post.name': 'Tên',
  'post.inputName': 'Vui lòng nhập tên',
  'post.title': 'Tiêu đề',
  'post.titleShared': 'Please input title',
  'post.inputTitle': 'Vui lòng nhập tiêu đề',
  'post.walletAddress': 'Địa chỉ ví',
  'post.avatar': 'Cập nhật ảnh đại diện',
  'post.chooseAvatar': 'Chọn ảnh đại diện...',
  'post.cover': 'Cập nhật ảnh bìa',
  'post.chooseCover': 'Chọn ảnh bìa...',
  'post.upload': 'Tải lên',
  'post.description': 'Mô tả',
  'post.countryName': 'Quốc gia',
  'post.country': 'Tìm kiếm quốc gia',
  'post.stateName': 'Tỉnh thành',
  'post.state': 'Tìm kiếm tỉnh thành',
  'post.address': 'Địa chỉ',
  'post.inputAddress': 'Vui lòng nhập địa chỉ',
  'post.createPostSuccessful': 'Tạo bài viết thành công',
  'post.editPostSuccessful': 'Cập nhật bài viết thành công',
  'post.unableCreatePostServer': 'Không thể tạo bài viết trên server',
  'post.unableEditPostServer': 'Không thể cập nhật bài biết trên server',
  'post.copyToClipboard': 'Liên kết đã được sao chép',
  'post.unableCreatePost': 'Không thể tạo bài viết.',
  'post.unableUpdatePost': 'Không thể sửa bài viết.',
  'post.selectAccountFirst': 'Hãy chọn một tài khoản trước khi tạo bài viết',
  'post.unableToBurn': 'Không thể đốt cho bài viết.',
  'post.burning': 'Đang đốt cho bài viết',
  'post.doneBurning': 'Đốt thành công',

  /* 16.Token */
  'token.importToken': 'Thêm token',
  'token.couldNotpostToken': 'Không thể tạo token',
  'token.createTokenSuccessful': 'Tạo token thành công',
  'token.unableCreateTokenServer': 'Không thể kết nối server tạo token',
  'token.errorWhenCreateToken': 'Đã có lỗi xảy ra khi tạo mới token',
  'token.couldNotFindToken': 'Không thể tìm thấy token',
  'token.unableCreateToken': 'Không thể tạo token',
  'token.unableSelect': 'Không thể chọn token',
  'token.inputTokenId': 'Nhập token Id',
  'token.tokenIdNotFound': 'Token Id không tồn tại',
  'token.tokenIdInvalid': 'Token Id không hợp lệ',
  'token.copyId': 'Token Id đã được sao chép.',
  'token.unableToBurn': 'Không thể đốt cho mã tiền',
  //Show more info in token page
  'token.ticker': 'Mã',
  'token.name': 'Tên',
  'token.burntxpi': 'Xpi đã đốt',
  'token.id': 'Id',
  'token.created': 'Ngày tạo',
  'token.comments': 'Ngày đăng bài',

  /* 17. Comment */
  'comment.unableCreateComment': 'Không thể tạo bình luận',
  'comment.unableToBurn': 'Không thể đốt cho bình luận',
  'comment.writeComment': 'Viết bình luận...',

  /* 18. Category */
  'category.art': 'Mỹ thuật',
  'category.crafts': 'Đồ thủ công',
  'category.dance': 'Nhảy',
  'category.film': 'Phim ảnh',
  'category.foodAndDrinks': 'Đồ ăn thức uống',
  'category.games': 'Trò chơi',
  'category.gardening': 'làm vườn',
  'category.houseDecor': 'trang trí nhà cửa',
  'category.literature': 'Văn học',
  'category.music': 'Âm nhạc',
  'category.networking': 'mạng',
  'category.party': 'Bữa tiệc',
  'category.religion': 'Tôn giáo',
  'category.shopping': 'Mua sắm',
  'category.sports': 'Các môn thể thao',
  'category.theater': 'Nhà hát',
  'category.wellness': 'sức khỏe',
  'category.carsAndVehicles': 'Ô tô và Xe cộ',
  'category.comedy': 'Hài kịch',
  'category.economicsAndTrade': 'Kinh tế và Thương mại',
  'category.education': 'Giáo dục',
  'category.entertainment': 'Sự giải trí',
  'category.moviesAndAnimation': 'Phim và Hoạt hình',
  'category.historyAndFacts': 'Lịch sử và sự kiện',
  'category.liveStyle': 'Cách sống',
  'category.natural': 'Thiên nhiên',
  'category.newsAndPolitics': 'Thời sự và Chính trị',
  'category.peopleAndNations': 'Con người và Quốc gia',
  'category.petsAndAnimals': 'Vật nuôi',
  'category.placesAndRegions': 'Địa điểm và Khu vực',
  'category.scienceAndTechnology': 'Khoa học và Công nghệ',
  'category.healthAndFitness': 'Sức khỏe và Thể hình',
  'category.travelAndEvents': 'Du lịch và Sự kiện',
  'category.other': 'Khác',
  // Burned
  'burned.burn': 'Đã đốt cháy',
};
