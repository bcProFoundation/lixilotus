import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import TokensListing from '@components/Token/TokensListing';

const TokensListingPage = () => {
  return (
    <>
      <TokensListing />
    </>
  );
};

TokensListingPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default TokensListingPage;
