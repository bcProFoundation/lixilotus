import React from 'react';

import ClaimedLayout from '@components/Layout/ClaimedLayout';
import SendComponent from '@components/Send';

const SendPage = () => {
  return (
    <SendComponent />
  );
}

SendPage.Layout = ({ children }) => <ClaimedLayout children={children} />

export default SendPage;
