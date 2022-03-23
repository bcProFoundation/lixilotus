import '../styles/style.less';

// import '../styles/globals.css';
import App, { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { createContext, FC } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { END } from 'redux-saga';


import MainLayout from '@components/Layout/MainLayout';

import { ConnectedRouter } from 'connected-next-router';
import { AppContext, SagaStore, Wallet, wrapper, XPI } from '../store/store';
import { loadGetInitialProps } from 'next/dist/shared/lib/utils';


const PersistGateServer = (props: any) => {
  return props.children;
}

const LixiApp = ({ Component, ...rest }) => {

  const { store, props } = wrapper.useWrappedStore(rest);

  const Layout = Component.Layout || MainLayout;

  const router = useRouter();

  // const isServer = () => typeof window === 'undefined';

  // let PersistGate = PersistGateServer;
  // if (typeof window === 'undefined') {
  //   PersistGate = PersistGateClient as any;
  // }

  return (
    <Provider store={store}>
      <AppContext.Provider value={{ XPI, Wallet }}>
        <Layout className='lixi-app-layout'>
          <Head>
            <title>LixiLotus</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <ConnectedRouter>
            <PersistGate persistor={store.__persistor} loading={<div>Loading</div>}>
              <Component {...props.pageProps} router={router} />
            </PersistGate>
          </ConnectedRouter>
        </Layout>
      </AppContext.Provider>
    </Provider>
  );

}

export default LixiApp;
