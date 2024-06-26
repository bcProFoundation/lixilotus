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
import { getWebPushNotifConfig } from '@store/settings/selectors';
import { getAllWalletPaths } from '@store/wallet';
import { subscribeSelectedAccount, unsubscribeAll } from '@store/webpush/actions';
import { askPermission, getPlatformPermissionState } from '@utils/pushNotification';
import { Modal, Switch, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
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
  const { registration, turnOnWebPushNotification, turnOffWebPushNotification } =
    React.useContext(ServiceWorkerContext);
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
          askPermission().then(async result => {
            setPermission(result);
            if (result === 'granted') {
              dispatch(
                subscribeSelectedAccount({
                  interactive: true,
                  modifySetting: true,
                  clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
                })
              );
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
        dispatch(
          subscribeSelectedAccount({
            interactive: true,
            modifySetting: true,
            clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
          })
        );
      } else {
        showModal();
      }
    } else {
      // unsubscribe
      if (registration) {
        dispatch(
          unsubscribeAll({
            interactive: true,
            modifySetting: true,
            clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
          })
        );
      }
    }
  };

  useEffect(() => {
    if (registration && permission !== 'granted') {
      dispatch(
        unsubscribeAll({
          interactive: false,
          modifySetting: true,
          clientAppId: process.env.NEXT_PUBLIC_WEBPUSH_CLIENT_APP_ID
        })
      );
    }
  }, [permission, registration]);

  return (
    <GeneralSettingsItem>
      <div className="title">
        <BellFilled width={18} height={18} /> {intl.get('settings.notificationsDesc')}
      </div>
      {webPushNotifConfig ? (
        permission !== 'denied' ? (
          <Switch
            checkedChildren={<>ON</>}
            unCheckedChildren={<>OFF</>}
            checked={webPushNotifConfig?.allowPushNotification ?? false}
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
