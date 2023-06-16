export interface WebAuthnConfig {
  isAuthenticationRequired: boolean;
  userId: string;
  credentialId: string;
}

export interface WebPushNotifConfig {
  allowPushNotification: boolean;
  deviceId: string;
}

export interface SearchConfig {
  searchValue: string;
  hashtags: Array<any>;
}
