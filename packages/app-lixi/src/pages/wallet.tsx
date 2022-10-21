import React from 'react';

import FullWalletComponent from '@components/Wallet/FullWallet';
import DeviceProtectableComponentWrapper from '@components/Authentication/DeviceProtectableComponentWrapper';

const WalletPage = () => {
  return (
    <>
      <DeviceProtectableComponentWrapper>
        <FullWalletComponent />
      </DeviceProtectableComponentWrapper>
    </>
  );
};

export default WalletPage;
