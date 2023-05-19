import OnboardingComponent from '@components/Onboarding/Onboarding';
import { SagaStore, wrapper } from '@store/store';
import { withIronSessionSsr } from 'iron-session/next';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';
import { LocalUser } from 'src/shared/models/localUser';
import { sessionOptions } from 'src/shared/models/session';

type OnboardingProps = {
  isMobile: boolean;
  localUser: LocalUser;
};

const OnboardingPage = ({ isMobile, localUser }: OnboardingProps) => {
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
