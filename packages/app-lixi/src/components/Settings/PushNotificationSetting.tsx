import {
  BellFilled,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { GeneralSettingsItem } from '@components/Common/Atoms/GeneralSettingsItem';
import { ServiceWorkerContext } from '@context/index';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { saveWebPushNotifConfig } from '@store/settings/actions';
import { getWebPushNotifConfig } from '@store/settings/selectors';
import {
  askPermission,
  buildSubscribeCommand,
  buildUnsubscribeCommand,
  getPlatformPermissionState
} from '@utils/pushNotification';
import { Modal, Switch, Tag } from 'antd';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { getAllAccounts } from '@store/account';
import { getAllWalletPaths } from '@store/wallet';
import { WEBPUSH_CLIENT_APP_ID } from 'src/shared/constants';
import { subscribe, unsubscribe } from '@store/webpush/actions';

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
  const accounts = useAppSelector(getAllAccounts);
  const walletPaths = useAppSelector(getAllWalletPaths);

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
              return;
            }
          });
        } catch (error) {
          Modal.error({
            title: intl.get('settings.permisionError'),
            content: error.message
          });
          return;
        }

        const applicationServerKey = process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY;
        const registration = await navigator.serviceWorker.getRegistration();
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        };
        const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
        const command = buildSubscribeCommand(
          pushSubscription,
          accounts,
          walletPaths,
          webPushNotifConfig.deviceId,
          WEBPUSH_CLIENT_APP_ID
        );

        dispatch(subscribe(command));
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

        const command = buildSubscribeCommand(
          pushSubscription,
          accounts,
          walletPaths,
          webPushNotifConfig.deviceId,
          WEBPUSH_CLIENT_APP_ID
        );

        dispatch(subscribe(command));
        dispatch(
          saveWebPushNotifConfig({
            ...webPushNotifConfig,
            allowPushNotification: true
          })
        );
      } else {
        showModal();
      }
    } else {
      // unsubscribe
      const registration = await navigator.serviceWorker.getRegistration();
      const pushSubscription = await registration.pushManager.getSubscription();
      const command = buildUnsubscribeCommand(pushSubscription, webPushNotifConfig.deviceId, WEBPUSH_CLIENT_APP_ID);

      dispatch(unsubscribe(command));
      dispatch(
        saveWebPushNotifConfig({
          ...webPushNotifConfig,
          allowPushNotification: false
        })
      );
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
