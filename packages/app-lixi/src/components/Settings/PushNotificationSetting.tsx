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
  const { registration, turnOnWebPushNotification, turnOffWebPushNotification } = React.useContext(ServiceWorkerContext);
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
          askPermission().then(async (result) => {
            setPermission(result);
            if (result === 'granted') {
              const applicationServerKey = process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY;
              const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
              };
              if (registration) {
                const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
                const command = buildSubscribeCommand(
                  pushSubscription,
                  accounts,
                  walletPaths,
                  webPushNotifConfig.deviceId,
                  WEBPUSH_CLIENT_APP_ID
                );
                dispatch(subscribe({ interactive: true, command }));
              }
              turnOnWebPushNotification();
            } else {
              turnOffWebPushNotification();
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
      }
    });
  };

  const handleNotificationToggle = async (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    if (checked) {
      if (permission === 'granted') {
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY
        };

        if (registration) {
          const pushSubscription: PushSubscription = await registration.pushManager.subscribe(subscribeOptions);

          const command = buildSubscribeCommand(
            pushSubscription,
            accounts,
            walletPaths,
            webPushNotifConfig.deviceId,
            WEBPUSH_CLIENT_APP_ID
          );

          dispatch(subscribe({ interactive: true, command }));
          turnOnWebPushNotification();
        }


      } else {
        showModal();
      }
    } else {
      // unsubscribe
      if (registration) {
        const pushSubscription = await registration.pushManager.getSubscription();
        const addresses = walletPaths.map(walletPath => walletPath.xAddress);
        const command = buildUnsubscribeCommand(pushSubscription, addresses, webPushNotifConfig.deviceId, WEBPUSH_CLIENT_APP_ID);

        dispatch(unsubscribe({ interactive: true, command }));
        dispatch(
          saveWebPushNotifConfig({
            ...webPushNotifConfig,
            allowPushNotification: false
          })
        );
      }
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
