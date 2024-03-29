import { LocalUserAccount } from '@bcpros/lixi-models';
import Home from '@components/Home';
import { generateAccount, silentLogin } from '@store/account/actions';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setLocalUserAccount } from '@store/localAccount';
import { getIsBootstrapped } from '@store/persistor/selectors';
import { SagaStore, wrapper } from '@store/store';
import axios from 'axios';
import { withIronSessionSsr } from 'iron-session/next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';
import { LocalUser } from 'src/models/localUser';
import { sessionOptions } from 'src/models/session';

type HomePageProps = {
  isMobile: boolean;
  localUser: LocalUser;
};

const HomePage = ({ isMobile, localUser }: HomePageProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const isHydrated = useAppSelector(getIsBootstrapped);

  const localLogout = async () => {
    const url = '/_api/local-logout';
    await axios.post(url);
  };

  useEffect(() => {
    if (isHydrated) {
      console.log('localUser:', localUser);
      // Only check the user if the redux state is already hydrated
      if (!selectedAccount && !localUser) {
        // There's no account, need to create an account for user
        dispatch(generateAccount());
      } else if (selectedAccount && !localUser) {
        // Local local with nextjs api route
        const localAccount: LocalUserAccount = {
          mnemonic: selectedAccount.mnemonic,
          language: selectedAccount.language,
          address: selectedAccount.address,
          balance: selectedAccount.balance,
          name: selectedAccount.name,
          createdAt: selectedAccount.createdAt,
          updatedAt: selectedAccount.updatedAt
        };
        dispatch(setLocalUserAccount(localAccount)); // and local-login
        dispatch(silentLogin(selectedAccount.mnemonic));
      } else if (selectedAccount) {
        dispatch(silentLogin(selectedAccount.mnemonic));
      } else if (localUser) {
        localLogout();
      }
    }
  }, [selectedAccount, localUser, isHydrated]);

  return <Home />;
};

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) =>
  withIronSessionSsr(async function getServerSideProps(context) {
    const { req } = context;
    const { headers } = req;

    store.dispatch(END);
    await (store as SagaStore).__sagaTask.toPromise();

    let isMobile = false;
    if (typeof window === 'undefined' && headers['user-agent']) {
      const userAgent = req ? req.headers['user-agent'] : '';
      isMobile = getSelectorsByUserAgent(userAgent).isMobile;
    }

    const localUser = req.session.localUser;

    return {
      props: {
        isMobile,
        localUser: localUser ?? null
      }
    };
  }, sessionOptions)
);

export default HomePage;
