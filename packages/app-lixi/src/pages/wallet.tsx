import React from 'react';

import RegisterComponent from '@components/PackRegister';
import ClaimedLayout from '@components/Layout/ClaimedLayout';
import WalletComponent from '@components/Wallet';
import FullWalletComponent from '@components/Wallet/FullWallet';

const WalletPage = () => {
  return (
    <FullWalletComponent />
  );
}

WalletPage.Layout = ({ children }) => <ClaimedLayout children={children} />

export default WalletPage;
