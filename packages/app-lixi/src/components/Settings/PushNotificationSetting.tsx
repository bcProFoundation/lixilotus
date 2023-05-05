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
  const [permission, setPermission] = useState(() => getPlatformPermissionState());
  const webPushNotifConfig = useAppSelector(getWebPushNotifConfig);
  const pushNotificationConfig = {};

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
          await askPermission();
        } catch (error) {
          Modal.error({
            title: intl.get('settings.permisionError'),
            content: error.message
          });
          return;
        }

        // subscribe all wallets to Push Notification in interactive mode
        subscribeAllWalletsToPushNotification(pushNotificationConfig, true);
        // pushNotificationConfig.turnOnPushNotification();
        setPermission(getPlatformPermissionState());
      }
    });
  };

  const handleNotificationToggle = (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    if (checked) {
      if (permission === 'granted') {
        subscribeAllWalletsToPushNotification(pushNotificationConfig, false);
        // pushNotificationConfig.turnOnPushNotification();
      } else if (permission === 'denied') {
        Modal.info({
          content: intl.get('settings.blockedDevice')
        });
      } else {
        showModal();
      }
    } else {
      // unsubscribe
      unsubscribeAllWalletsFromPushNotification(pushNotificationConfig);
      // pushNotificationConfig.turnOffPushNotification();
    }
  };

  return (
    <GeneralSettingsItem>
      <div className="title">
        <BellFilled /> {intl.get('settings.notifications')}
      </div>
      {pushNotificationConfig ? (
        permission !== 'denied' ? (
          <Switch
            size="small"
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={true}
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
