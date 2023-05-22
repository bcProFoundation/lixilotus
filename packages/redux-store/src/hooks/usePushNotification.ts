import { Account } from '@bcpros/lixi-models';
import { getSelectedAccount } from '@store/account';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveWebPushNotifConfig } from '@store/settings/actions';
import { getDeviceId, getWebPushNotifConfig } from '@store/settings/selectors';
import { subscribeSelectedAccount, unsubscribeAll, unsubscribeByAddresses } from '@store/webpush';
import { getPlatformPermissionState } from '@utils/pushNotification';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import usePrevious from './usePrevious';

const usePushNotification = (props: { registration: ServiceWorkerRegistration }) => {
  const { registration } = props;
  const dispatch = useAppDispatch();
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const previousSelectedAccount: Account = usePrevious(selectedAccount);
  const deviceId = useAppSelector(getDeviceId);

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
          let allowPushNotification = webPushNotifConfig?.allowPushNotification ?? false;
          if (permission !== 'granted' && webPushNotifConfig?.allowPushNotification === true) {
            // if the permission is not granted, we should not allow push notification
            // reset the allowPushNotification value to false
            allowPushNotification = false;
          }
          dispatch(
            saveWebPushNotifConfig({
              allowPushNotification: allowPushNotification,
              // generate new deviceId if it is not available
              deviceId: webPushNotifConfig?.deviceId ?? uuidv4()
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
      webPushNotifConfig?.allowPushNotification &&
      getPlatformPermissionState() == 'granted' &&
      webPushNotifConfig?.deviceId
    ) {
      // unsubscribe webpush for all by device id
      // with the previous account
      if (previousSelectedAccount && previousSelectedAccount.address != selectedAccount.address) {
        dispatch(
          unsubscribeByAddresses({
            addresses: [previousSelectedAccount.address],
            modifySetting: false,
            clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
          })
        );
      }

      // then subscribe with the current active account
      dispatch(
        subscribeSelectedAccount({
          interactive: false,
          modifySetting: false,
          clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
        })
      );
    }
  }, [selectedAccount, registration, deviceId]);

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
