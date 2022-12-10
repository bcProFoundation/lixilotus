import '../styles/style.less';

// import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import MainLayout from '@components/Layout/MainLayout';

import { AuthenticationProvider, WalletProvider, AuthorizationProvider, callConfig } from 'src/context';
import { ConnectedRouter } from 'connected-next-router';
import { wrapper } from '../store/store';
import OutsideCallConsumer, { createCaller } from 'react-outside-call';
import { Spin } from 'antd';

const PersistGateServer = (props: any) => {
  return props.children;
};

const LixiApp = ({ Component, ...rest }) => {
  const { store, props } = wrapper.useWrappedStore(rest);

  const Layout = Component.Layout || MainLayout;

  // const router = useRouter();

  // const isServer = () => typeof window === 'undefined';

  // let PersistGate = PersistGateServer;
  // if (typeof window === 'undefined') {
  //   PersistGate = PersistGateClient as any;
  // }

  return (
    <Provider store={store}>
      <WalletProvider>
        <AuthenticationProvider>
          <AuthorizationProvider>
            <OutsideCallConsumer config={callConfig}>
              <Layout className="lixi-app-layout">
                <Head>
                  <title>LixiLotus</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
                  <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                  />
                </Head>
                <ConnectedRouter>
                  <PersistGate
                    persistor={store.__persistor}
                    loading={
                      <div>
                        <Spin />
                      </div>
                    }
                  >
                    <Component {...props.pageProps} />
                  </PersistGate>
                </ConnectedRouter>
              </Layout>
            </OutsideCallConsumer>
          </AuthorizationProvider>
        </AuthenticationProvider>
      </WalletProvider>
    </Provider>
  );
};

export default LixiApp;
