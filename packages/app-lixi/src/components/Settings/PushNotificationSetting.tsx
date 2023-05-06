import React, { useState } from 'react';
import {
  BellFilled,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { Switch, Tag, Modal } from 'antd';
import {
  askPermission,
  getPlatformPermissionState,
  subscribeAllWalletsToPushNotification,
  unsubscribeAllWalletsFromPushNotification
} from '@utils/pushNotification';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { ServiceWorkerContext } from '@context/index';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { saveWebPushNotifConfig } from '@store/settings/actions';
import { GeneralSettingsItem } from '@components/Common/Atoms/GeneralSettingsItem';

const ThemedQuerstionCircleOutlinedFaded = styled(QuestionCircleOutlined)`
  color: #bb98ff !important;
`;

// Help (?) Icon that shows info
const helpInfoIcon = (
  <ThemedQuerstionCircleOutlinedFaded
    onClick={() => {
      Modal.info({
        centered: true,
        okText: intl.get('settings.gotIt'),
        title: intl.get('settings.howEnableNotification'),
        maskClosable: true,
        content: (
          <div>
            <p>{intl.get('settings.deviceSupport')}</p>
            <div className="heading">{intl.get('settings.twoStepEnableNotification')}</div>
            <ul>
              <li>
                {intl.get('settings.allowNotification')}
                <em>{intl.get('settings.forBrowser')}</em>.
              </li>
              <li>
                {intl.get('settings.thenAllowNotification')}
                <em>{intl.get('settings.lixilotusOnBrower')}</em>.
              </li>
            </ul>
          </div>
        )
      });
    }}
  />
);

const PushNotificationSetting = () => {
  const dispatch = useAppDispatch();
  const serviceWorkerContextValue = React.useContext(ServiceWorkerContext);
  const [permission, setPermission] = useState<NotificationPermission>(() => getPlatformPermissionState());
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);

  const showModal = () => {
    Modal.confirm({
      centered: true,
      title: intl.get('settings.enableNotification'),
      icon: <ExclamationCircleOutlined />,
      content: intl.get('settings.grantPermisson'),
      okText: intl.get('settings.ok'),
      async onOk() {
        // get user permission
        try {
          askPermission().then(result => {
            setPermission(result);
            if (result === 'granted') {
              dispatch(
                saveWebPushNotifConfig({
                  ...webPushNotifConfig,
                  allowPushNotification: true
                })
              );
            } else {
              dispatch(
                saveWebPushNotifConfig({
                  ...webPushNotifConfig,
                  allowPushNotification: false
                })
              );
            }
          });
        } catch (error) {
          Modal.error({
            title: intl.get('settings.permisionError'),
            content: error.message
          });
          return;
        }

        // subscribe all wallets to Push Notification in interactive mode
        // subscribeAllWalletsToPushNotification(pushNotificationConfig, true);
        // pushNotificationConfig.turnOnPushNotification();
      }
    });
  };

  const handleNotificationToggle = async (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    if (checked) {
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY
        };

        const pushSubscription: PushSubscription = await registration.pushManager.subscribe(subscribeOptions);

        console.log('pushSubscription', pushSubscription);

        // subscribeAllWalletsToPushNotification(pushNotificationConfig, false);
        // pushNotificationConfig.turnOnPushNotification();
      } else {
        showModal();
      }
    } else {
      // unsubscribe
      // unsubscribeAllWalletsFromPushNotification(pushNotificationConfig);
      // pushNotificationConfig.turnOffPushNotification();
    }
  };

  return (
    <GeneralSettingsItem>
      <div className="title">
        <BellFilled /> {intl.get('settings.notifications')}
      </div>
      {webPushNotifConfig ? (
        permission !== 'denied' ? (
          <Switch
            size="small"
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={webPushNotifConfig.allowPushNotification}
            onChange={handleNotificationToggle}
          />
        ) : (
          <div>
            <Tag color="warning" icon={<ExclamationCircleFilled />}>
              {intl.get('settings.blockedDevice')}
            </Tag>
            {helpInfoIcon}
          </div>
        )
      ) : (
        <Tag color="warning" icon={<ExclamationCircleFilled />}>
          {intl.get('settings.notSupported')}
        </Tag>
      )}
    </GeneralSettingsItem>
  );
};

export default PushNotificationSetting;
