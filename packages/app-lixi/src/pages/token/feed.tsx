import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import TokensFeed from '@components/Tokens/TokensFeed';

const FeedPage = () => {
  return <TokensFeed />;
};

FeedPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default FeedPage;
