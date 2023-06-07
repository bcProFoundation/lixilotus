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
import { NextSeo } from 'next-seo';
import { stripHtml } from 'string-strip-html';

const PersistGateServer = (props: any) => {
  return props.children;
};

const getDescription = (postAsString): string => {
  const post = JSON.parse(postAsString);

  return `${post.postAccount.name} at LixiLotus: "${stripHtml(post.content).result}"`;
};

const getSitename = (postAsString): string => {
  const post = JSON.parse(postAsString);

  return `Posted by ${post.postAccount.name}`;
};

const LixiApp = ({ Component, ...rest }) => {
  const { store, props } = wrapper.useWrappedStore(rest);

  const Layout = Component.Layout || MainLayout;
  const defaultImage = `${process.env.NEXT_PUBLIC_LIXI_URL}images/lixilotus-logo.svg`;
  const { pageProps } = props;
  const { postId, isMobile, postAsString } = pageProps;

  const canonicalUrl = postId ? process.env.NEXT_PUBLIC_LIXI_URL + `post/${postId}` : process.env.NEXT_PUBLIC_LIXI_URL;
  const description = postId ? getDescription(postAsString) : 'LixiLotus allow you to giveaway your Lotus effortlessly';
  const sitename = postId ? getSitename(postAsString) : 'lixilotus.com';

  // const router = useRouter();

  // const isServer = () => typeof window === 'undefined';

  // let PersistGate = PersistGateServer;
  // if (typeof window === 'undefined') {
  //   PersistGate = PersistGateClient as any;
  // }

  return (
    <Provider store={store}>
      <Head>
        <title>LixiLotus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      </Head>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'LixiLotus',
          description: description,
          images: [
            {
              url: defaultImage,
              width: 800,
              height: 600,
              alt: 'Lotus Logo',
              type: 'image/jpeg'
            }
          ],
          site_name: sitename
        }}
        twitter={{
          handle: '@lixilotus',
          site: '@lixilotus',
          cardType: 'summary_large_image'
        }}
        facebook={{
          appId: '264679442628200'
        }}
      />
      <PersistGate persistor={store.__persistor} loading={<SplashScreen />}>
        <ServiceWorkerProvider>
          <WalletProvider>
            <AuthenticationProvider>
              <AuthorizationProvider>
                <OutsideCallConsumer config={callConfig}>
                  <Layout className="lixi-app-layout">
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
