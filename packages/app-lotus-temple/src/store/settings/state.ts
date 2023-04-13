import { WebAuthnConfig } from './model';

export interface SettingsState {
  navCollapsed: boolean;
  locale: string;
  initIntlStatus: boolean;
  webAuthnConfig?: WebAuthnConfig;
  filterPostsHome: number;
  filterPostsPage: number;
  filterPostsToken: number;
}
