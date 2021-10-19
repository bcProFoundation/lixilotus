import React, { useState, useEffect } from 'react';
import { Row, Col, Form, notification, message, Modal, Alert } from 'antd';
import { isMobile, isIOS, isSafari } from 'react-device-detect';
import PrimaryButton, {
  SecondaryButton,
} from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { VaultCollapse } from '@abcpros/givegift-components/components/Common/StyledCollapse';
import {
  FormItemRedeemCodeXpiInput,
  FormItemWithQRCodeAddon,
} from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useXPI from '@hooks/useXPI';
import { parseAddress } from '@utils/addressMethods';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';
import CreateVaultForm from './CreateVaultForm';
import ImportVaultForm from './ImportVaultForm';
import MyGivingInfo from '@components/Home/MyGivingInfo';
import { StoreContext } from 'src/store/context';

const Vault: React.FC = () => {
  const ContextValue = React.useContext(StoreContext);
  const { createVault } = ContextValue;

  const { getXPI, getRestUrl } = useXPI();

  // jestBCH is only ever specified for unit tests, otherwise app will use getBCH();
  // const BCH = jestBCH ? jestBCH : getBCH();
  const XPI = getXPI();

  return (
    <>
      <CreateVaultForm
        XPI={XPI}
        getRestUrl={getRestUrl}
        createVault={createVault}
      // passLoadingStatus={passLoadingStatus}
      />
      <ImportVaultForm
        XPI={XPI}
        getRestUrl={getRestUrl}
        createVault={() => { }}
      />
      <MyGivingInfo />
    </>
  )
};

export default Vault;