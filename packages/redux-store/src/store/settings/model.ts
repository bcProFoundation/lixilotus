export interface WebAuthnConfig {
  isAuthenticationRequired: boolean;
  userId: string;
  credentialId: string;
}

export interface WebPushNotifConfig {
  allowPushNotification: boolean;
  clientAppId: string;
  deviceId: string;
}
