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
  subscribeAllWalletsToPushNotification,
  unsubscribeAllWalletsFromPushNotification
} from '@utils/pushNotification';
import intl from 'react-intl-universal';
import styled from 'styled-components';

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
            <p>{intl.get('settings.notSupportIos')}</p>
            <div className="heading">{intl.get('settings.twoStepEnableNotification')}</div>
            <ul>
              <li>
                {intl.get('settings.allowNotification')}
                <em>{intl.get('settings.forBrowser')}</em>.
              </li>
              <li>
                {intl.get('settings.thenAllowNotification')}
                <em>{intl.get('settings.sendlotusOnBrower')}</em>.
              </li>
            </ul>
          </div>
        )
      });
    }}
  />
);

const PushNotificationSetting = ({ pushNotificationConfig }) => {
  const [permission, setPermission] = useState(() => getPlatformPermissionState());

  const showModal = () => {
    Modal.confirm({
      centered: true
      title: intl.get('settings.enableNotification'),
      icon: <ExclamationCircleOutlined />,
      content: intl.get('settings.grantPermisson'),
      okText: intl.get('settings.ok'),
      async onOk() {
        // get user permissioin
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
        pushNotificationConfig.turnOnPushNotification();
        setPermission(getPlatformPermissionState());
      }
    });
  };

  const handleNotificationToggle = (checked, event) => {
    if (checked) {
      if (permission === 'granted') {
        subscribeAllWalletsToPushNotification(pushNotificationConfig, false);
        pushNotificationConfig.turnOnPushNotification();
      } else {
        showModal();
      }
    } else {
      // unsubscribe
      unsubscribeAllWalletsFromPushNotification(pushNotificationConfig);
      pushNotificationConfig.turnOffPushNotification();
    }
  };

  return (
    <>
      <div className="title">
        <BellFilled /> {intl.get('settings.notifications')}
      </div>
      {pushNotificationConfig ? (
        permission !== 'denied' ? (
          <Switch
            size="small"
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={pushNotificationConfig.allowPushNotification ? true : false}
            onChange={handleNotificationToggle}
          />
        ) : (
          <div>
            <Tag color="warning" icon={<ExclamationCircleFilled />}>
              {intl.get('settings.BlockedDevice')}
            </Tag>
            {helpInfoIcon}
          </div>
        )
      ) : (
        <Tag color="warning" icon={<ExclamationCircleFilled />}>
          {intl.get('settings.notSupported')}
        </Tag>
      )}
    </>
  );
};

export default PushNotificationSetting;
