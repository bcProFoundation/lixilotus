import '../styles/style.less';
import 'antd/dist/reset.css';
// import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import MainLayout from '@components/Layout/MainLayout';

import { ServiceWorkerProvider, AuthenticationProvider, WalletProvider, AuthorizationProvider, callConfig } from '@context/index';
import { ConnectedRouter } from 'connected-next-router';
import { wrapper } from '@store/store';
import OutsideCallConsumer, { createCaller } from 'react-outside-call';
import { Spin } from 'antd';
import SplashScreen from '@components/Common/SplashScreen';
import { ConfigProvider } from 'antd';
import lightTheme from 'src/styles/themes/lightTheme';

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
      <ServiceWorkerProvider>
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
                    <PersistGate persistor={store.__persistor} loading={<SplashScreen />}>
                      <ConfigProvider theme={lightTheme}>
                        <Component {...props.pageProps} />
                      </ConfigProvider>
                    </PersistGate>
                  </ConnectedRouter>
                </Layout>
              </OutsideCallConsumer>
            </AuthorizationProvider>
          </AuthenticationProvider>
        </WalletProvider>
      </ServiceWorkerProvider>
    </Provider>
  );
};

export default LixiApp;
