import React, { createContext, FC } from 'react';
// import '../styles/globals.css';

import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
// import { ConnectedRouter } from 'connected-next-router';
// import { XPI, Wallet, AppContext, SagaStore } from '../store/store';
// import App from '../components/App';
// import '../index.css';
// import { END } from "redux-saga";
// import Head from 'next/head';
import { wrapper, AppContext, XPI, Wallet } from '../store/store';

// import useXPI from '@hooks/useXPI';
// import useWallet from '@hooks/useWallet';
import BCHJS from '@abcpros/xpi-js';
import Head from 'next/head';


// const { getXPI } = useXPI();
// export const XPI: BCHJS = getXPI(0);
// export const Wallet = useWallet(XPI);
// export const AppContext = createContext({ XPI, Wallet });


const LixiApp: FC<AppProps> = ({ Component, ...rest }) => {

  const { store, props } = wrapper.useWrappedStore(rest);

  return (
    <Provider store={store}>
      <AppContext.Provider value={{ XPI, Wallet }}>
        <Head>
          <title>LixiLotus</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        {/* <PersistGate persistor={store.__persistor}> */}
        {/* <ConnectedRouter> */}
        {/* {GA.init() && <GA.RouteTracker />} */}
        <Component {...props.pageProps} />
        {/* </ConnectedRouter> */}
        {/* </PersistGate> */}
      </AppContext.Provider>
    </Provider>
  );

  // const { store, props } = wrapper.useWrappedStore(rest);
  // return (
  //   <Provider store={store}>
  //     <AppContext.Provider value={{ XPI, Wallet }}>
  //       <Component {...props.pageProps} />
  //     </AppContext.Provider>
  //   </Provider>
  // );
}

// LixiApp.getInitialProps = wrapper.getInitialAppProps((store: SagaStore) => async (context) => {

//   const { ctx, Component } = context;

//   const pageProps = {
//     // https://nextjs.org/docs/advanced-features/custom-app#caveats
//     ...(await App.getInitialProps(context)).pageProps,
//   };

//   // 2. Stop the saga if on server
//   if (ctx.req) {
//     store.dispatch(END);
//     await (store as SagaStore).__sagaTask.toPromise();
//   }

//   // 3. Return props
//   return { pageProps };
// });

export default LixiApp;
