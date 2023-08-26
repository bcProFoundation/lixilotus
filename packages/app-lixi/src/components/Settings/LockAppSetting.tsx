import React from 'react';
import { LockFilled, CheckOutlined, CloseOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Switch, Tag } from 'antd';
import intl from 'react-intl-universal';
import { AuthenticationContext } from '@context/index';
import { GeneralSettingsItem } from '@components/Common/Atoms/GeneralSettingsItem';

const LockAppSetting = () => {
  const authenticationContextValue = React.useContext(AuthenticationContext);

  const handleAppLockToggle = (checked: boolean, e: React.MouseEvent<HTMLButtonElement>) => {
    if (checked) {
      // if there is an existing credential, that means user has registered
      // simply turn on the Authentication Required flag
      if (authenticationContextValue.credentialId) {
        authenticationContextValue.turnOnAuthentication();
      } else {
        // there is no existing credential, that means user has not registered
        // user need to register
        authenticationContextValue.signUp();
      }
    } else {
      authenticationContextValue.turnOffAuthentication();
    }
  };

  return (
    <GeneralSettingsItem>
      {/* Lock app */}
      <div className="title">
        <LockFilled width={18} height={18} /> {intl.get('settings.lockAppDesc')}
      </div>
      {authenticationContextValue ? (
        <Switch
          checkedChildren={<>ON</>}
          unCheckedChildren={<>OFF</>}
          checked={
            authenticationContextValue.isAuthenticationRequired && authenticationContextValue.credentialId
              ? true
              : false
          }
          // checked={false}
          onChange={handleAppLockToggle}
        />
      ) : (
        <Tag color="warning" icon={<ExclamationCircleFilled />}>
          {intl.get('settings.notSupported')}
        </Tag>
      )}
    </GeneralSettingsItem>
  );
};

export default LockAppSetting;
