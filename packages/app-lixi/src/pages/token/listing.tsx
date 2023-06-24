import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import TokensListing from '@components/Token/TokensListing';
import MainLayout from '@components/Layout/MainLayout';

const TokensListingPage = () => {
  return (
    <>
      <TokensListing />
    </>
  );
};

TokensListingPage.Layout = ({ children }) => <MainLayout children={children} />;

export default TokensListingPage;
