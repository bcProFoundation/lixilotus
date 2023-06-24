import { WebAuthnConfig, WebPushNotifConfig } from './model';

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
  isTopPosts: boolean;
}
