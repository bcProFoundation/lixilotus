import React from 'react';

import Home from '@components/Home/Home';
import { END } from 'redux-saga';

import { AppContext, SagaStore, Wallet, wrapper, XPI } from '../store/store';
import App, { AppProps } from 'next/app';

import MainLayout from '@components/Layout/MainLayout';
import { GetStaticPropsResult } from 'next';
import { Params } from 'next/dist/server/router';

const HomePage = (): JSX.Element => {
  return (
    <Home />
  );
}

// HomePage.getStaticProps = wrapper.getStaticProps((store: SagaStore) => async (context) => {
//   store.dispatch(END);
//   await (store as SagaStore).__sagaTask.toPromise();

//   return {
//     props: {
//     }
//   };
// })


export default HomePage;
