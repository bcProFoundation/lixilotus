import React from 'react';

import RegisterComponent from '@components/Register';
import ClaimedLayout from '@components/Layout/ClaimedLayout';

const ClaimPage = () => {
  return (
    <RegisterComponent />
  );
}

ClaimPage.Layout = ({ children }) => <ClaimedLayout children={children} />

export default ClaimPage;
