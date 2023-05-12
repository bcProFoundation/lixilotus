import 'antd/dist/reset.css';
import '../styles/style.less';
// import '../styles/globals.css';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import MainLayout from '@components/Layout/MainLayout';

import SplashScreen from '@components/Common/SplashScreen';
import {
  AuthenticationProvider,
  AuthorizationProvider,
  ServiceWorkerProvider,
  WalletProvider,
  callConfig
} from '@context/index';
import { wrapper } from '@store/store';
import { ConfigProvider } from 'antd';
import { ConnectedRouter } from 'connected-next-router';
import OutsideCallConsumer from 'react-outside-call';
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
      <PersistGate persistor={store.__persistor} loading={<SplashScreen />}>
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
                      <ConfigProvider theme={lightTheme}>
                        <Component {...props.pageProps} />
                      </ConfigProvider>
                    </ConnectedRouter>
                  </Layout>
                </OutsideCallConsumer>
              </AuthorizationProvider>
            </AuthenticationProvider>
          </WalletProvider>
        </ServiceWorkerProvider>
      </PersistGate>
    </Provider>
  );
};

export default LixiApp;
