import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import TokensTrading from '@components/Tokens/TokensTrading';

const TokensListingPage = () => {
  return (
    <>
      <TokensTrading />
    </>
  );
};

TokensListingPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default TokensListingPage;
