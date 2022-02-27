import React from 'react';

import Home from '@components/Home/Home';
import { END } from 'redux-saga';

import { SagaStore, wrapper } from '../store/store';

const HomePage = (): JSX.Element => {
  return (
    <Home />
  );
}

export const getStaticProps = wrapper.getStaticProps((store: SagaStore) => async (context) => {
  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  return {
    props: {
    }
  };
})


export default HomePage;
