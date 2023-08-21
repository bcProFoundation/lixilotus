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
  callConfig,
  SocketProvider
} from '@context/index';
import { wrapper } from '@store/store';
import { ConfigProvider } from 'antd';
import { ConnectedRouter } from 'connected-next-router';
import { NextSeo } from 'next-seo';
import OutsideCallConsumer from 'react-outside-call';
import lightTheme from 'src/styles/themes/lightTheme';
import { stripHtml } from 'string-strip-html';

const PersistGateServer = (props: any) => {
  return props.children;
};

const getDescription = (postAsString): string => {
  const post = JSON.parse(postAsString);

  return `${post.postAccount.name} at Lixi: "${stripHtml(post.content).result}"`;
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
  const description = postId ? getDescription(postAsString) : 'Your Attention Your Money!';
  const sitename = postId ? getSitename(postAsString) : 'lixi.social';

  return (
    <Provider store={store}>
      <Head>
        <title>Lixi</title>
        {/*This is for sharing on telegram. If didnt work remove next commit*/}
        <meta name="twitter:image:src" content={defaultImage} />
      </Head>
      <NextSeo
        title="Lixi"
        description="A place where you have complete control on what you want to see and what you want others to see collectively. No platform influence. No platform ads."
        canonical={canonicalUrl}
        openGraph={{
          type: 'website',
          url: canonicalUrl,
          title: 'Lixi',
          description: description,
          images: [
            {
              url: defaultImage,
              width: 1200,
              height: 630,
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
        <SocketProvider>
          <ServiceWorkerProvider>
            <WalletProvider>
              <AuthenticationProvider>
                <AuthorizationProvider>
                  <OutsideCallConsumer config={callConfig}>
                    <Layout className="lixi-app-layout">
                      <ConnectedRouter>
                        <Component {...props.pageProps} />
                      </ConnectedRouter>
                    </Layout>
                  </OutsideCallConsumer>
                </AuthorizationProvider>
              </AuthenticationProvider>
            </WalletProvider>
          </ServiceWorkerProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
  );
};

export default LixiApp;
