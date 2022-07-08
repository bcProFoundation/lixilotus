import React from 'react';

import RegisterComponent from '@components/PackRegister';
import ClaimedLayout from '@components/Layout/ClaimedLayout';
import WalletComponent from '@components/Wallet';
import FullWalletComponent from '@components/Wallet/FullWallet';
import SendComponent from '@components/Send';

const SendPage = () => {
  return (
    <SendComponent />
  );
}

SendPage.Layout = ({ children }) => <ClaimedLayout children={children} />

export default SendPage;
