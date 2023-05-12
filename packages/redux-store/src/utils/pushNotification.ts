import {
  Account,
  WebpushSubscribeCommand,
  WebpushSubscriberCommand,
  WebpushUnsubscribeCommand
} from '@bcpros/lixi-models';
import { WalletPathAddressInfo } from '@store/wallet';
import messageLib from 'bitcoinjs-message';
import * as _ from 'lodash';
import * as wif from 'wif';
import { convertArrayBufferToBase64 } from './convertArrBuffBase64';

/**
 * Ask user for permission to send push notification
 * @returns {Promise<NotificationPermission>}
 */
export const askPermission = (): Promise<NotificationPermission> => {
  return new Promise(function (resolve, reject) {
    const permissionResult = Notification.requestPermission(function (result) {
      // The callback syntax is used by safari
      resolve(result);
    });

    if (permissionResult) {
      // The promise syntax is used by chrome
      permissionResult.then(resolve, reject);
    }
  });
};

/**
 * Get the current notification permission state of the browser
 * @returns {NotificationPermission | null} return null if the browser does not support push notification
 */
export const getPlatformPermissionState = (): NotificationPermission | null => {
  if ('Notification' in window) {
    return Notification.permission;
  }

  return null;
};

export const buildSubscribeCommand = (
  pushSubscription: PushSubscription,
  accounts: Account[],
  walletPaths: WalletPathAddressInfo[],
  deviceId: string,
  clientAppId: string
): WebpushSubscribeCommand => {
  try {
    const auth = pushSubscription.getKey('auth');
    const p256dh = pushSubscription.getKey('p256dh');
    const expirationTime = pushSubscription.expirationTime;

    const subscribers: WebpushSubscriberCommand[] = _.compact(
      accounts.map(account => {
        const associatedWallet = _.find(walletPaths, wallet => account.address === wallet.xAddress);
        if (!associatedWallet) return null;

        const { fundingWif, xAddress, legacyAddress } = associatedWallet;
        const { privateKey, compressed } = wif.decode(fundingWif);
        const signature = messageLib.sign(xAddress, privateKey, compressed).toString('base64');
        const subscriber: WebpushSubscriberCommand = {
          address: account.address,
          legacyAddress: legacyAddress,
          accountId: account.id,
          expirationTime: expirationTime ? new Date(expirationTime) : null,
          signature: signature
        };
        return subscriber;
      })
    );

    const subscribeCommand: WebpushSubscribeCommand = {
      subscribers,
      auth: convertArrayBufferToBase64(auth),
      p256dh: convertArrayBufferToBase64(p256dh),
      endpoint: pushSubscription.endpoint,
      clientAppId,
      deviceId
    };

    return subscribeCommand;
  } catch (error) {
    return null;
  }
};

export const buildUnsubscribeCommand = (pushSubscription: PushSubscription, addresses: string[], deviceId: string, clientAppId: string) => {
  try {
    if (!pushSubscription) return null;

    const auth = pushSubscription.getKey('auth');
    const p256dh = pushSubscription.getKey('p256dh');

    const unsubscribeCommand: WebpushUnsubscribeCommand = {
      addresses,
      auth: convertArrayBufferToBase64(auth),
      p256dh: convertArrayBufferToBase64(p256dh),
      endpoint: pushSubscription.endpoint,
      clientAppId,
      deviceId
    };

    return unsubscribeCommand;
  } catch (error) {
    return null;
  }
};
