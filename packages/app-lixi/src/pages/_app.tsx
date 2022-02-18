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



const LixiApp = ({ Component, ...rest }) => {

  const { store, props } = wrapper.useWrappedStore(rest);

  const Layout = Component.Layout || MainLayout;

  const router = useRouter();

  const isServer = typeof window === 'undefined';

  return (
    <Provider store={store}>
      <AppContext.Provider value={{ XPI, Wallet }}>
        <Layout>
          <Head>
            <title>LixiLotus</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          {/* <PersistGate persistor={store.__persistor} loading={<div>Loading</div>}> */}
          <ConnectedRouter>
            {/* {GA.init() && <GA.RouteTracker />} */}

            {isServer ? (<PersistGate persistor={store}>
              <Component {...props.pageProps} router={router} />
            </PersistGate>) : (
              <PersistGate persistor={store}> loading={<div>Loading</div>}
                <Component {...props.pageProps} router={router} />
              </PersistGate>
            )}
          </ConnectedRouter>
          {/* </PersistGate> */}
        </Layout>
      </AppContext.Provider>
    </Provider>
  );

}

LixiApp.getInitialProps = wrapper.getInitialAppProps((store: SagaStore) => async (context) => {

  const { ctx, Component } = context;

  const pageProps = {
    // https://nextjs.org/docs/advanced-features/custom-app#caveats
    ...(await App.getInitialProps(context)).pageProps,
  };

  // 2. Stop the saga if on server
  if (ctx.req) {
    store.dispatch(END);
    await (store as SagaStore).__sagaTask.toPromise();
  }

  // 3. Return props
  const propsData = {
    ...pageProps,
  };

  let layoutProps = {};

  if ((Component as any)?.Layout) {
    layoutProps = await (Component as any)?.Layout?.getInitialProps?.({
      ...ctx,
      pageProps: propsData,
    });
  } else {
    layoutProps = await (MainLayout as any)?.getInitialProps?.({
      ...ctx,
      pageProps: propsData,
    });
  }

  return {
    pageProps: {
      ...propsData,
      ...layoutProps
    },
  };
});

export default LixiApp;
