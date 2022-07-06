import React from 'react';

import ClaimComponent from '@components/Claim';
import ClaimedLayout from '@components/Layout/ClaimedLayout';

const ClaimPage = () => {
  return (
    <ClaimComponent />
  );
}

ClaimPage.Layout = ({ children }) => <ClaimedLayout children={children} />

export default ClaimPage;
