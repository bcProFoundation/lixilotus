import React from 'react';
import { END } from 'redux-saga';
import { SagaStore, wrapper } from '@store/store';
import { getSelectedLocalUserAccount } from '../store/localAccount/selectors';
import { useAppSelector } from '@store/hooks';
import OnboardingComponent from '@components/Onboarding/Onboarding';
import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from 'src/models/session';

const OnboardingPage = () => {
  const selectedLocalAccount = useAppSelector(getSelectedLocalUserAccount);

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
