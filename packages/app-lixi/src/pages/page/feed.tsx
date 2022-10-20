import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import PageHomeFeed from '@components/Pages/PageHomeFeed';

const FeedPage = () => {
  return (
    <>
      <PageHomeFeed />
    </>
  );
};

FeedPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default FeedPage;
