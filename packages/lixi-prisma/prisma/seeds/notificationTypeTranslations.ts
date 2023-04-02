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
    template: 'There is an error happens in creating child codes for lixi the {{name}}. Please withdrawn your fund and try again.' 
  }, 
  { 
    id: 8, 
    notificationTypeId: 4, 
    language: 'vi', 
    isDefault: false, 
    template: 'Đã có lỗi xảy ra trong quá trình tạo mã con cho Lì xì {{name}}. Xin hãy rút Lotus về tài khoản chính và thử lại.' 
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
  // burn 
  { 
    id: 15, 
    notificationTypeId: 8, 
    language: 'en', 
    isDefault: true, 
    template: '{{senderName}} {{burnType}} {{xpiBurn}} XPI on your {{burnForType}}.' 
  }, 
  { 
    id: 16, 
    notificationTypeId: 8, 
    language: 'vi', 
    isDefault: false, 
    template: '{{senderName}} {{burnType}} {{xpiBurn}} XPI cho {{burnForType}} của bạn.' 
  }, 
  // burn-tip 
  { 
    id: 17, 
    notificationTypeId: 9, 
    language: 'en', 
    isDefault: true, 
    template: '{{senderName}} {{burnType}} {{xpiBurn}} XPI on your {{burnForType}}.  You received {{xpiTip}} XPI.' 
  }, 
  { 
    id: 18, 
    notificationTypeId: 9, 
    language: 'vi', 
    isDefault: false, 
    template: '{{senderName}} {{burnType}} {{xpiBurn}} XPI cho {{burnForType}} của bạn. Bạn được nhận {{xpiTip}} XPI.' 
  }, 
  // burn-fee 
  { 
    id: 19, 
    notificationTypeId: 10, 
    language: 'en', 
    isDefault: true, 
    template: '{{senderName}} {{burnType}} {{xpiBurn}} XPI for {{burnForType}} on your {{pageName}} page. You received {{xpiFee}} XPI fee.' 
  }, 
  { 
    id: 20, 
    notificationTypeId: 10, 
    language: 'vi', 
    isDefault: false, 
    template: '{{senderName}} {{burnType}} {{xpiBurn}} XPI cho {{burnForType}} trong trang {{pageName}} của bạn. Bạn được nhận {{xpiFee}} XPI tiền phí.' 
  } 
];