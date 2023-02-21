import React from 'react';

import ClaimComponent from '@components/Claim';
import ClaimedLayout from '@components/Layout/ClaimedLayout';

const ClaimPage = () => {
  return <ClaimComponent isClaimFromAccount={false} />;
};

ClaimPage.Layout = ({ children }) => <ClaimedLayout children={children} />;

export default ClaimPage;
