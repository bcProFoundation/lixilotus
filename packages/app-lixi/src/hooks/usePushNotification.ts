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
  const [allowPushNotification, setAllowPushNotification] = useState(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);

  const savePushNotificationConfigToStorage = async ({ allowPushNotification: boolean, deviceId: string }) => {
    try {
      dispatch(
        saveWebPushNotifConfig({
          allowPushNotification,
          deviceId
        })
      );
    } catch (err) {
      console.error('Could not save webpush config');
      throw err;
    }
  };

  // save the config whenever the webPushNotifConfig's attributes are changed
  useEffect(() => {
    (async () => {
      await savePushNotificationConfigToStorage({ allowPushNotification, deviceId });
    })();
  }, [allowPushNotification, deviceId]);

  // run only once
  // useEffect(() => {
  //   (async () => {
  //     if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
  //       setIsWebPushNotifSupported(true);

  //       if (!webPushNotifConfig) {
  //         // no configuration saved on the local storage
  //         // generate a new one and save it to local storage
  //         savePushNotificationConfigToStorage({
  //           allowPushNotification: undefined,
  //           deviceId: undefined
  //         });
  //       } else {
  //         const permission = await askPermission();
  //         if (permission !== 'granted' && (pushConfiguration as NotificationConfig).allowPushNotification) {
  //           unsubscribeAllWalletsFromPushNotification(pushConfiguration);
  //           (pushConfiguration as NotificationConfig).allowPushNotification = false;
  //         }
  //       }
  //       setPushNotification(pushConfiguration);
  //       checkInWithPushNotificationServer(pushConfiguration);
  //     }

  //     return null;
  //   })();
  // }, []);

  // save the configuration to local storage whenever it is changed
  // useEffect(() => {
  //   async () => {
  //     if (pushNotification) {
  //       await savePushNotificationConfigToStorage(pushNotification);
  //     }
  //   };
  // }, [pushNotification]);

  // if (!pushNotification) return null;

  // return {
  //   ...pushNotification,
  //   turnOffPushNotification: () => {
  //     setPushNotification({
  //       ...pushNotification,
  //       allowPushNotification: false
  //     });
  //   },
  //   turnOnPushNotification: () => {
  //     setPushNotification({
  //       ...pushNotification,
  //       allowPushNotification: true
  //     });
  //   }
  // };
};

export default usePushNotification;
