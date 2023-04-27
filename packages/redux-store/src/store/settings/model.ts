export interface WebAuthnConfig {
  isAuthenticationRequired: boolean;
  userId: string;
  credentialId: string;
}

export interface WebPushNotifConfig {
  allowPushNotification: boolean;
  userId: string;
}
