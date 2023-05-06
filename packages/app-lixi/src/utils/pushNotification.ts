import { Modal } from 'antd';
import { getAddressesOfWallet } from './cashMethods';

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

// subscribe all wallets
export const subscribeAllWalletsToPushNotification = async (pushNotificationConfig, interactiveMode) => {
  // get the PushSubscription Object from browser
  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_PUSH_SERVER_PUBLIC_KEY
    };
    pushSubscription = await registration.pushManager.subscribe(subscribeOptions);

    // get addresses of all the saved wallets
    const addresses = []; // await getAddressesOfSavedWallets();

    // send the subscription details to backend server
    const subscribeURL = process.env.REACT_APP_PUSH_SERVER_API + 'subscribe';
    const subscriptionObject = {
      ids: addresses,
      clientAppId: pushNotificationConfig.appId,
      pushSubscription
    };
    console.log(JSON.stringify(subscriptionObject));
    const res = await fetch(subscribeURL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(subscriptionObject)
    });
    const resData = await res.json();
    if (resData.error) {
      throw new Error(resData.error);
    }
    pushNotificationConfig.turnOnPushNotification();
    if (interactiveMode) {
      Modal.success({ content: 'Success! you will receive notification of new transaction' });
    }
  } catch (error) {
    console.log('Error in subscribeAllWalletsToPushNotification()', error);
    if (interactiveMode) {
      // show an error modal in interactive mode
      Modal.error({
        title: 'Error - Push Notification Subscription',
        content: error.message
      });
    }
    return;
  }
};

export const unsubscribeAllWalletsFromPushNotification = async () => {
  try {
    // const addresses = await getAddressesOfSavedWallets();
    // unsubscribePushNotification(addresses, pushNotificationConfig.appId);
  } catch (error) {
    console.log('Error is unsubscribeAllWalletsFromPushNotification()', error);
  }
};

// unsubscribe a single wallet
export const unsubscribeWalletFromPushNotification = async (pushNotificationConfig, wallet) => {
  if (!pushNotificationConfig || !wallet) return;

  const addresses = getAddressesOfWallet(wallet);
  unsubscribePushNotification(addresses, pushNotificationConfig.appId);
};

export const unsubscribePushNotification = async (addresses, appId) => {
  const unsubscriptionObject = { ids: addresses, clientAppId: appId };
  const unsubscribeURL = process.env.REACT_APP_PUSH_SERVER_API + 'unsubscribe';
  try {
    const res = await fetch(unsubscribeURL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(unsubscriptionObject)
    });
    res.json().then(data => {
      if (data.success) {
        console.log('Successfully unsubscribe Push Notification');
      } else {
        console.log(data.error);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
