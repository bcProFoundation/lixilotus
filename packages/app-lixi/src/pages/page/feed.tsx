import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import PageHomeFeed from '@components/Pages/PageHomeFeed';
import MainLayout from '@components/Layout/MainLayout';

const FeedPage = () => {
  return <PageHomeFeed />;
};

FeedPage.Layout = ({ children }) => <MainLayout children={children} />;

export default FeedPage;
