import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  checkInWithPushNotificationServer,
  unsubscribeAllWalletsFromPushNotification
} from '@utils/pushNotification';
import { saveWebPushNotifConfig } from '@store/settings/actions';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { WEBPUSH_CLIENT_APP_ID } from 'src/shared/constants';


const usePushNotification = () => {
  const [isWebPushNotifSupported, setIsWebPushNotifSupported] = useState(false);
  const [allowPushNotification, setAllowPushNotification] = useState(undefined);

  const dispatch = useAppDispatch();
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);

  const askPermission = () => {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (result) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    });
  }

  const savePushNotificationConfigToStorage = async ({ allowPushNotification, clientAppId, deviceId }) => {
    try {
      dispatch(
        saveWebPushNotifConfig({
          allowPushNotification,
          clientAppId,
          deviceId
        })
      );
    } catch (err) {
      console.error('Could not save webpush config');
      // TODO: log the error
      throw err;
    }
  };

  // subscribe all wallets
  const subscribeAllWalletsToPushNotification = async (pushNotificationConfig, interactiveMode) => {
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
      const addresses = await getAddressesOfSavedWallets();

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

  // run only once
  useEffect(() => {
    (async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
        setIsWebPushNotifSupported(true);

        if (!webPushNotifConfig) {
          // no configuration saved on the local storage
          // generate a new one and save it to local storage
          savePushNotificationConfigToStorage({
            allowPushNotification: undefined,
            clientAppId: WEBPUSH_CLIENT_APP_ID,
            deviceId: undefined
          });
        } else {
          const permission = await askPermission();
          if (permission !== 'granted' && (pushConfiguration as NotificationConfig).allowPushNotification) {
            unsubscribeAllWalletsFromPushNotification(pushConfiguration);
            (pushConfiguration as NotificationConfig).allowPushNotification = false;
          }
        }
        setPushNotification(pushConfiguration);
        checkInWithPushNotificationServer(pushConfiguration);
      }

      return null;
    })();
  }, []);

  // save the configuration to local storage whenever it is changed
  useEffect(() => {
    async () => {
      if (pushNotification) {
        await savePushNotificationConfigToStorage(pushNotification);
      }
    };
  }, [pushNotification]);

  if (!pushNotification) return null;

  return {
    ...pushNotification,
    turnOffPushNotification: () => {
      setPushNotification({
        ...pushNotification,
        allowPushNotification: false
      });
    },
    turnOnPushNotification: () => {
      setPushNotification({
        ...pushNotification,
        allowPushNotification: true
      });
    }
  };
};

export default usePushNotification;
