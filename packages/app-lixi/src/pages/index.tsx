import React from 'react';

import PagesListing from '@components/Pages/PagesListing';
import { END } from 'redux-saga';
import { SagaStore, wrapper } from '@store/store';

const ListingPage = () => {
  return <PagesListing />;
};

export const getStaticProps = wrapper.getStaticProps((store: SagaStore) => async context => {
  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const result = await (store as SagaStore).getState();

  return {
    props: {}
  };
});

export default ListingPage;
