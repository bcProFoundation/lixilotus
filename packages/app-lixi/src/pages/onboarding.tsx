import { LocalUserAccount } from '@bcpros/lixi-models';
import OnboardingComponent from '@components/Onboarding/Onboarding';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setLocalUserAccount, silentLocalLogin } from '@store/localAccount';
import { SagaStore, wrapper } from '@store/store';
import { withIronSessionSsr } from 'iron-session/next';
import Router from 'next/router';
import { useEffect } from 'react';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';
import { LocalUser } from 'src/models/localUser';
import { sessionOptions } from 'src/models/session';

type OnboardingProps = {
  isMobile: boolean;
  localUser: LocalUser;
};

const OnboardingPage = ({ isMobile, localUser }: OnboardingProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);

  if (selectedAccount && localUser && selectedAccount.address == localUser.id && localUser.isLocalLoggedIn === true) {
    Router.push('/');
  }

  useEffect(() => {
    if (selectedAccount && !localUser) {
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
      Router.push('/');
    }
  }, [selectedAccount, localUser]);

  return <OnboardingComponent />;
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

export default OnboardingPage;
