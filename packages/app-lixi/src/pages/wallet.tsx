import React from 'react';

import FullWalletComponent from '@components/Wallet/FullWallet';
import DeviceProtectableComponentWrapper from '@components/Authentication/DeviceProtectableComponentWrapper';
import ListWallet from '@components/Wallet/ListWallet';

const WalletPage = () => {
  return (
    <>
      <DeviceProtectableComponentWrapper>
        {/* //TODO: support multi currencies */}
        {/* <ListWallet /> */}
        <FullWalletComponent />
      </DeviceProtectableComponentWrapper>
    </>
  );
};

export default WalletPage;
