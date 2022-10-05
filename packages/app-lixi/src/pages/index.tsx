import PagesListing from '@components/Pages/PagesListing';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { SagaStore, wrapper } from '@store/store';
import { withIronSessionSsr } from 'iron-session/next';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';
import { LocalUser } from 'src/models/localUser';
import { sessionOptions } from 'src/models/session';
import { useEffect } from 'react';
import { LocalUserAccount } from '@bcpros/lixi-models';
import { setLocalUserAccount, silentLocalLogin } from '@store/localAccount';
import Router from 'next/router';
import { getIsBootstrapped } from '@store/persistor/selectors';
import { generateAccount } from '@store/account/actions';

type HomePageProps = {
  isMobile: boolean;
  localUser: LocalUser;
};

const HomePage = ({ isMobile, localUser }: HomePageProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const isHydrated = useAppSelector(getIsBootstrapped);

  useEffect(() => {
    if (isHydrated) {
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
        dispatch(setLocalUserAccount(localAccount));

        const localUser: LocalUser = {
          id: localAccount.address,
          address: localAccount.address,
          name: localAccount.name
        };
        dispatch(silentLocalLogin(localUser));
      }
    }
  }, [selectedAccount, localUser, isHydrated]);

  return <PagesListing />;
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
