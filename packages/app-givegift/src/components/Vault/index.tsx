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
import VaultList from './VaultList';
import { useAppSelector } from 'src/store/hooks';
import { getAllVaults } from 'src/store/vault/selectors';

const Vault: React.FC = () => {

  const { getXPI, getRestUrl } = useXPI();
  const vaults = useAppSelector(getAllVaults);

  // jestBCH is only ever specified for unit tests, otherwise app will use getBCH();
  // const BCH = jestBCH ? jestBCH : getBCH();
  const XPI = getXPI();

  return (
    <>
      <CreateVaultForm
        XPI={XPI}
        getRestUrl={getRestUrl}
      />
      <ImportVaultForm
        XPI={XPI}
        getRestUrl={getRestUrl}
        createVault={() => { }}
      />
      <VaultList vaults={vaults} />
    </>
  )
};

export default Vault;