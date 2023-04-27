import * as localforage from 'localforage';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  checkInWithPushNotificationServer,
  getPlatformPermissionState,
  unsubscribeAllWalletsFromPushNotification
} from '@utils/pushNotification';

const KEY = 'pushNotificationConfig';
type NotificationConfig = {
  allowPushNotification: boolean;
  userId: string;
  lastPushMessageTimestamp: string;
};

export type DeviceNotificationValue = {
  allowPushNotification: boolean;
  credentialId: string;
  turnOnPushNotification: () => void;
  turnOffPushNotification: () => void;
};

const usePushNotification = () => {
  const [pushNotification, setPushNotification] = useState(null);
  const [allowPushNotification, setAllowPushNotification] = useState(undefined);
  const [userId, setUserId] = useState(Date.now().toString(16));

  const loadPushNotificationConfigFromStorage = async () => {
    try {
      return await localforage.getItem(KEY);
    } catch (error) {
      // TODO: log the error
      throw error;
    }
  };

  const savePushNotificationConfigToStorage = async ({ allowPushNotification, appId, lastPushMessageTimestamp }) => {
    try {
      return await localforage.setItem(KEY, {
        allowPushNotification,
        appId,
        lastPushMessageTimestamp
      });
    } catch (error) {
      console.error('ERROR in savePushNotificationConfigFromStorage() in usePushNotification()');
      // TODO: log the error
      throw error;
    }
  };

  // run only once
  useEffect(() => {
    (async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
        let pushConfiguration = await loadPushNotificationConfigFromStorage();
        if (!pushConfiguration) {
          // no configuration saved on the local storage
          // generate a new one and save it to local storage
          pushConfiguration = {
            allowPushNotification: undefined,
            appId: uuidv4(),
            lastPushMessageTimestamp: undefined
          };
        } else {
          const permission = getPlatformPermissionState();
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
