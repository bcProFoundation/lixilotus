import { PrismaClient } from '@bcpros/lixi-prisma';
import MainLayout from '@components/Layout/MainLayout';
import FullWalletComponent from '@components/Wallet/FullWallet';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';
import InApp from '@utils/inapp';
import CheckBrowser from '@components/InApp/check-browser';

const ClaimPage = props => {
  const inapp = new InApp(navigator.userAgent || navigator.vendor);

  const { userAddress, isMobile } = props;

  return (
    <>
      <CheckBrowser />
      {!inapp?.isInApp && <FullWalletComponent claimCode={userAddress}/>}
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) => async context => {
  const { req } = context;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const { isMobile } = getSelectorsByUserAgent(userAgent);

  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const slug: string = _.isArray(context.params.slug) ? context.params.slug[0] : context.params.slug;
  const userAddress: string = slug;

  return {
    props: {
      userAddress,
      isMobile
    }
  };
});

ClaimPage.Layout = ({ children }) => <MainLayout children={children} />;

export default ClaimPage;
