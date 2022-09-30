import React, { useEffect } from 'react';
import { END } from 'redux-saga';
import { SagaStore, wrapper } from '@store/store';
import { getSelectedLocalUserAccount } from '../store/localAccount/selectors';
import { useAppSelector } from '@store/hooks';
import OnboardingComponent from '@components/Onboarding/Onboarding';
import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from 'src/models/session';
import accountApi from '@store/account/api';
import { LocalUser } from 'src/models/localUser';
import Router from 'next/router';

type OnboardingProps = {
  isMobile: boolean;
  localUser: LocalUser;
}

const OnboardingPage = ({ isMobile, localUser }: OnboardingProps) => {

  const selectedLocalAccount = useAppSelector(getSelectedLocalUserAccount);

  if (
    selectedLocalAccount &&
    localUser &&
    selectedLocalAccount.address == localUser.id &&
    localUser.isLocalLoggedIn === true
  ) {
    Router.push('/');
  }

  useEffect(() => {
    if (selectedLocalAccount &&
      !localUser) {
      // Local local with nextjs api route
      const newLocalUser: LocalUser = {
        name: selectedLocalAccount.name,
        id: selectedLocalAccount.address,
        address: selectedLocalAccount.address
      };
      accountApi.localLogin(newLocalUser).then(() => {
        Router.push('/');
      });

    }
  }, [selectedLocalAccount, localUser])

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
      const UAParser = eval('require("ua-parser-js")');
      const parser = new UAParser();
      const device = parser.setUA(headers['user-agent']).getDevice();

      if (device.type === 'mobile') {
        isMobile = true;
      }
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
