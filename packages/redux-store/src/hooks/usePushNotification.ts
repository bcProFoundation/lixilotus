import { getSelectedAccount } from '@store/account';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveWebPushNotifConfig } from '@store/settings/actions';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { subscribeSelectedAccount, unsubscribeAll } from '@store/webpush';
import { getPlatformPermissionState } from '@utils/pushNotification';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const usePushNotification = (props: { registration: ServiceWorkerRegistration }) => {
  const { registration } = props;
  const dispatch = useAppDispatch();
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);
  const selectedAccount = useAppSelector(getSelectedAccount);

  // run only once
  useEffect(() => {
    (async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
        // Because we use redux-persist with PersistGate so webPushNotifConfig should be hydrated before the useEffect is run
        // webPushNotifConfig should be already hydrated from indexeddb at this point.
        if (!webPushNotifConfig) {
          // no webpush notification configuration saved on the redux
          // generate a new one and save it to redux store
          dispatch(
            saveWebPushNotifConfig({
              allowPushNotification: true,
              deviceId: uuidv4()
            })
          );
        } else {
          const permission = getPlatformPermissionState();
          let allowPushNotification = webPushNotifConfig.allowPushNotification;
          if (permission !== 'granted' && webPushNotifConfig.allowPushNotification === true) {
            // if the permission is not granted, we should not allow push notification
            // reset the allowPushNotification value to false
            allowPushNotification = false;
          }
          dispatch(
            saveWebPushNotifConfig({
              allowPushNotification: allowPushNotification,
              // generate new deviceId if it is not available
              deviceId: webPushNotifConfig.deviceId ?? uuidv4()
            })
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (
      selectedAccount &&
      registration &&
      webPushNotifConfig &&
      webPushNotifConfig.allowPushNotification &&
      getPlatformPermissionState() == 'granted' &&
      webPushNotifConfig.deviceId
    ) {
      // unsubscribe webpush for all by device id
      // then subscribe with the current active account
      dispatch(
        unsubscribeAll({
          interactive: false,
          modifySetting: false,
          clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
        })
      );
      dispatch(
        subscribeSelectedAccount({
          interactive: false,
          modifySetting: false,
          clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
        })
      );
    }
  }, [selectedAccount, registration]);

  return {
    turnOffWebPushNotification: () => {
      dispatch(
        saveWebPushNotifConfig({
          ...webPushNotifConfig,
          allowPushNotification: false
        })
      );
    },
    turnOnWebPushNotification: () => {
      dispatch(
        saveWebPushNotifConfig({
          ...webPushNotifConfig,
          allowPushNotification: true
        })
      );
    }
  };
};

export default usePushNotification;
