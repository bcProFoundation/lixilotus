import '../styles/style.less';

// import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import MainLayout from '@components/Layout/MainLayout';

import { AuthenticationProvider, WalletProvider, AuthorizationProvider } from 'src/context';
import { ConnectedRouter } from 'connected-next-router';
import { wrapper } from '../store/store';

const PersistGateServer = (props: any) => {
  return props.children;
};

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
      <WalletProvider>
        <AuthenticationProvider>
          <AuthorizationProvider>
            <Layout className="lixi-app-layout">
              <Head>
                <title>LixiLotus</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link
                  rel="stylesheet"
                  href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                />
              </Head>
              <ConnectedRouter>
                <PersistGate persistor={store.__persistor} loading={<div>Loading</div>}>
                  <Component {...props.pageProps} router={router} />
                </PersistGate>
              </ConnectedRouter>
            </Layout>
          </AuthorizationProvider>
        </AuthenticationProvider>
      </WalletProvider>
    </Provider>
  );
};

export default LixiApp;
