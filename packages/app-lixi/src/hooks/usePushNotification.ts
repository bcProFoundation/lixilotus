import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  checkInWithPushNotificationServer,
  getPlatformPermissionState,
  unsubscribeAllWalletsFromPushNotification
} from '@utils/pushNotification';
import { saveWebPushNotifConfig } from '@store/settings/actions';
import { getWebPushNotifConfig } from '@store/settings/selectors';


export type DeviceNotificationValue = {
  allowPushNotification: boolean;
  credentialId: string;
  turnOnPushNotification: () => void;
  turnOffPushNotification: () => void;
};

const usePushNotification = () => {
  const [isWebPushNotifSupported, setIsWebPushNotifSupported] = useState(false);
  const [allowPushNotification, setAllowPushNotification] = useState(undefined);
  const [userId, setUserId] = useState(Date.now().toString(16));

  const dispatch = useAppDispatch();
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);

  const savePushNotificationConfigToStorage = async ({ allowPushNotification, appId, lastPushMessageTimestamp }) => {
    try {
      dispatch(
        saveWebPushNotifConfig({
          allowPushNotification,
          appId,
          lastPushMessageTimestamp
        })
      );
    } catch (err) {
      console.error('Could not save webpush config');
      // TODO: log the error
      throw err;
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
            appId: uuidv4(),
            lastPushMessageTimestamp: undefined
          });
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
