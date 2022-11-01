import intl from 'react-intl-universal';

export const navBarHeaderList = [
  {
    name: intl.get('general.accounts'),
    subTitle: intl.get('general.manageAccounts'),
    path: '/wallet'
  },
  {
    name: intl.get('general.send'),
    subTitle: intl.get('general.sendLotus'),
    path: '/send'
  },
  {
    name: intl.get('general.registerPack'),
    subTitle: intl.get('general.registerPack'),
    path: '/admin/pack-register'
  },
  {
    name: intl.get('general.createPage'),
    subTitle: intl.get('general.createPage'),
    path: '/page/create'
  },
  {
    name: intl.get('general.settings'),
    subTitle: intl.get('general.subtitleSettings'),
    path: '/settings'
  },
  {
    name: intl.get('general.lixi'),
    subTitle: intl.get('manageLixi'),
    path: '/lixi'
  },
  {
    name: intl.get('general.profile'),
    subTitle: intl.get('general.manageInfo'),
    path: '/profile'
  },
  {
    name: intl.get('general.page'),
    subTitle: intl.get('general.managePage'),
    path: '/page'
  },
  {
    name: intl.get('general.notifications'),
    subTitle: intl.get('general.manageNotifications'),
    path: '/notifications'
  },
  {
    name: intl.get('general.pages'),
    subTitle: intl.get('general.feedPage'),
    path: '/page/feed'
  },
  {
    name: intl.get('general.pages'),
    subTitle: intl.get('general.subTitleEditPage'),
    path: '/page/edit'
  },
  {
    name: intl.get('general.claimed'),
    subTitle: intl.get('general.subTitleClaimed'),
    path: '/claimed/'
  }
];
