import React, { createContext, FC } from 'react';
import { Provider } from 'react-redux';
import { AppProps } from 'next/app';
import { wrapper } from '../store';

import useXPI from '@hooks/useXPI';
import useWallet from '@hooks/useWallet';
import BCHJS from '@abcpros/xpi-js';


const { getXPI } = useXPI();
export const XPI: BCHJS = getXPI(0);
export const Wallet = useWallet(XPI);

export const AppContext = createContext({ XPI, Wallet });

const MyApp: FC<AppProps> = ({ Component, ...rest }) => {
    const { store, props } = wrapper.useWrappedStore(rest);
    return (
        <Provider store={store}>
            <AppContext.Provider value={{ XPI, Wallet }}>
                <Component {...props.pageProps} />
            </AppContext.Provider>
        </Provider>
    );
};

export default MyApp;
