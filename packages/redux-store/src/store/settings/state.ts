import { SearchConfig, WebAuthnConfig, WebPushNotifConfig } from './model';

export interface SettingsState {
  navCollapsed: boolean;
  locale: string;
  initIntlStatus: boolean;
  webAuthnConfig?: WebAuthnConfig;
  webPushNotifConfig?: WebPushNotifConfig;
  filterPostsHome: number;
  filterPostsPage: number;
  filterPostsToken: number;
  filterPostsProfile: number;
  searchPosts: SearchConfig;
  searchPage: SearchConfig;
  searchToken: SearchConfig;
}
