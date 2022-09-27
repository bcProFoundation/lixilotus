import { END } from 'redux-saga';
import { SagaStore, wrapper } from '@store/store';
import OnboardingComponent from '@components/Onboarding/Onboarding';

const OnboardingPage = () => {
  return <OnboardingComponent />;
};

export default OnboardingPage;
