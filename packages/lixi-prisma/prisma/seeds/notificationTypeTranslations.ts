export const notificationTypeTranslations = [
  {
    id: 1,
    notificationTypeId: 1,
    language: 'en',
    isDefault: true,
    template: 'You have successfully create child codes for the lixi {{name}}'
  },
  {
    id: 2,
    notificationTypeId: 2,
    language: 'en',
    isDefault: true,
    template: 'You have successfully widthdraw from all sub lixies of the lixi {{name}}'
  },
  {
    id: 3,
    notificationTypeId: 3,
    language: 'en',
    isDefault: true,
    template: 'You have successfully export the lixi {{name}}'
  },
  {
    id: 4,
    notificationTypeId: 1,
    language: 'vi',
    isDefault: false,
    template: 'Bạn đã tạo thành công mã con cho ví Lì xì {{name}}'
  },
  {
    id: 5,
    notificationTypeId: 2,
    language: 'vi',
    isDefault: false,
    template: 'Bạn đã rút thành công từ tất cả các ví phụ của ví Lì xì {{name}}'
  },
  {
    id: 6,
    notificationTypeId: 3,
    language: 'vi',
    isDefault: false,
    template: 'Bạn đã sao lưu thành công ví Lì xì {{name}}'
  },
  {
    id: 7,
    notificationTypeId: 4,
    language: 'en',
    isDefault: true,
    template:
      'There is an error happens in creating child codes for lixi the {{name}}. Please withdrawn your fund and try again.'
  },
  {
    id: 8,
    notificationTypeId: 4,
    language: 'vi',
    isDefault: false,
    template:
      'Đã có lỗi xảy ra trong quá trình tạo mã con cho Lì xì {{name}}. Xin hãy rút Lotus về tài khoản chính và thử lại.'
  },
  // post on page
  {
    id: 9,
    notificationTypeId: 5,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} posted on your {{pageName}} page.'
  },
  {
    id: 10,
    notificationTypeId: 5,
    language: 'vi',
    isDefault: false,
    template: '{{senderName}} đã tạo bài viết mới trong trang {{pageName}} của bạn.'
  },
  // comment on post
  {
    id: 11,
    notificationTypeId: 6,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} commented on your post.'
  },
  {
    id: 12,
    notificationTypeId: 6,
    language: 'vi',
    isDefault: false,
    template: '{{senderName}} đã bình luận trong bài viết của bạn.'
  },
  // comment to give
  {
    id: 13,
    notificationTypeId: 7,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} gave you {{xpiGive}} XPI.'
  },
  {
    id: 14,
    notificationTypeId: 7,
    language: 'vi',
    isDefault: false,
    template: '{{senderName}} đã tặng cho bạn {{xpiGive}} XPI.'
  },
  // burn-comment-on-postAccount
  {
    id: 15,
    notificationTypeId: 8,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} {{burnType}} {{xpiBurn}} Dana for comment on your post. You received {{xpiFee}} XPI fee.'
  },
  {
    id: 16,
    notificationTypeId: 8,
    language: 'vi',
    isDefault: false,
    template:
      '{{senderName}} {{burnType}} {{xpiBurn}} Dana cho bình luận trong bài viết của bạn. Bạn được nhận {{xpiFee}} XPI tiền phí.'
  },
  // burn-account-fee
  {
    id: 17,
    notificationTypeId: 9,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} {{burnType}} {{xpiBurn}} Dana on your post. You received {{xpiFee}} XPI fee.'
  },
  {
    id: 18,
    notificationTypeId: 9,
    language: 'vi',
    isDefault: false,
    template:
      '{{senderName}} {{burnType}} {{xpiBurn}} Dana cho bài viết của bạn. Bạn được nhận {{xpiFee}} XPI tiền phí.'
  },
  // burn-page-fee
  {
    id: 19,
    notificationTypeId: 10,
    language: 'en',
    isDefault: true,
    template:
      '{{senderName}} {{burnType}} {{xpiBurn}} Dana for {{burnForType}} on your {{pageName}} page. You received {{xpiFee}} XPI fee.'
  },
  {
    id: 20,
    notificationTypeId: 10,
    language: 'vi',
    isDefault: false,
    template:
      '{{senderName}} {{burnType}} {{xpiBurn}} Dana cho {{burnForType}} trong trang {{pageName}} của bạn. Bạn được nhận {{xpiFee}} XPI tiền phí.'
  },
  // follow-account
  {
    id: 23,
    notificationTypeId: 12,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} is following you.'
  },
  {
    id: 24,
    notificationTypeId: 12,
    language: 'vi',
    isDefault: false,
    template: '{{senderName}} hiện đang theo dõi bạn.'
  },
  // follow-page
  {
    id: 25,
    notificationTypeId: 13,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} is following your {{pageName}} page.'
  },
  {
    id: 26,
    notificationTypeId: 13,
    language: 'vi',
    isDefault: false,
    template: '{{senderName}} hiện đang theo dõi trang {{pageName}} của bạn.'
  },
  // page-message
  // request to send page-message
  {
    id: 27,
    notificationTypeId: 15,
    language: 'vi',
    isDefault: false,
    template: '{{senderName}} đã gửi {{lixiAmount}} với mong muốn trò chuyện với trang {{pageName}} của bạn'
  },
  {
    id: 28,
    notificationTypeId: 15,
    language: 'en',
    isDefault: true,
    template: '{{senderName}} sent you {{lixiAmount}} to request for a chat with your page {{pageName}}.'
  },
  //accept page-message
  {
    id: 29,
    notificationTypeId: 16,
    language: 'vi',
    isDefault: false,
    template: '{{pageName}} đồng ý yêu cầu trò chuyện của bạn. Nhấp vào để bắt đầu.'
  },
  {
    id: 30,
    notificationTypeId: 16,
    language: 'en',
    isDefault: true,
    template: 'Your request to chat with page {{pageName}} has been accepted. Click to start chatting.'
  },
  //denied page-message
  {
    id: 31,
    notificationTypeId: 17,
    language: 'vi',
    isDefault: false,
    template: 'Yêu cầu trò chuyện với trang {{pageName}} đã không được đồng ý. Bạn đã được hoàn lại {{lixiAmount}} XPI.'
  },
  {
    id: 32,
    notificationTypeId: 17,
    language: 'en',
    isDefault: true,
    template:
      'Your request to chat with page {{pageName}} has been declined. Your Lixi of {{lixiAmount}} XPI has been returned.'
  }
];
