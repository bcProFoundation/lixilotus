export const emailTemplateTranslations = [
  {
    id: 'a4c5e76b-7764-4f79-a849-2afbfb4b33d2',
    sender: 'noreply@lixilotus.com',
    emailTemplateId: '12e0af85-9fab-4e4d-a733-86af3e53c106',
    title: 'Activate Account',
    subject: 'Activate Account',
    language: 'en',
    isDefault: true,
    body: `<p>Hi {{username}},</p><p>A new account has been created using your email . Click below button to activate your account.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>`
  },
  {
    id: '03467379-be8f-40ae-af27-bd8b21fb4f9a',
    sender: 'noreply@lixilotus.com',
    emailTemplateId: '5f1746ca-de79-4c5a-9995-6a14aa7efe09',
    title: 'Two Factor Authentication',
    subject: 'Activate Two Factor Authentication',
    language: 'en',
    isDefault: true,
    body: `Activate Two Factor Authentication","<p>Hi {{username}},</p><p>This mail is sent because you requested to enable two factor authentication. To configure authentication via TOTP on multiple devices, during setup, scan the QR code using each device at the same time.</p><p><img src='{{qrcode}}' id='qr-code-otp' alt='QR code OTP'></p><p style='text-align:start'>A time-based one-time password (TOTP) application automatically generates an authentication code that changes after a certain period of time. We recommend using cloud-based TOTP apps such as:</p><ul><li><a href='https://support.1password.com/one-time-passwords/' target='_self'>1Password</a></li><li><a href='https://authy.com/guides/github/' target='_self'>Authy</a></li><li><a href='https://lastpass.com/auth/' target='_self'>LastPass Authenticator</a></li><li><a href='https://www.microsoft.com/en-us/account/authenticator/' target='_self'>Microsoft Authenticator</a></li><li><a href='https://docs.keeper.io/enterprise-guide/storing-two-factor-codes' target='_self'>Keeper</a></li></ul><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>`
  },
  {
    id: '9c1dd845-6f3e-4a9c-ada4-bac3174a52fc',
    sender: 'noreply@lixilotus.com',
    emailTemplateId: 'f2e93c35-0c1b-4d6c-a8d0-e54985b562a2',
    title: 'Reset Password',
    subject: 'Reset Password',
    language: 'en',
    isDefault: true,
    body: `<p>Hi {{username}},</p><p>You have requested to reset a password. Please use following link to complete the action. Please note this link is only valid for the next hour.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>`
  },
  {
    id: '673ba24e-9bdb-41b7-ad00-23722e5781d2',
    sender: 'noreply@lixilotus.com',
    emailTemplateId: 'a780f73c-a668-46dd-b4de-afde0df6f82d',
    title: 'Set Password',
    subject: 'Set Password',
    language: 'en',
    isDefault: true,
    body: `<p>Hi {{username}},</p><p>Your account password has been reset. Please use following link to set password for your account. Please note this link is only valid for the next hour.</p><p>{{link}}</p><p>If you haven't requested the code please ignore the email.</p><p>Thank you!.</p>`
  }
];
