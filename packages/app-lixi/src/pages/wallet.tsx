import React from 'react';

import ClaimedLayout from '@components/Layout/ClaimedLayout';
import FullWalletComponent from '@components/Wallet/FullWallet';

const WalletPage = () => {
  return <FullWalletComponent />;
};

WalletPage.Layout = ({ children }) => <ClaimedLayout children={children} />;

export default WalletPage;
