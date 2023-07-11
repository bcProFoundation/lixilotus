import MainLayout from '@components/Layout/MainLayout';
import TokensFeed from '@components/Token/TokensFeed';
import { SagaStore, wrapper } from '@store/store';
import { useTokenQuery } from '@store/token/tokens.generated';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';

const TokenDetailPage = props => {
  const { tokenId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `token/${tokenId}`;

  let currentToken;
  const { currentData, isSuccess } = useTokenQuery({ tokenId: tokenId });
  if (isSuccess) currentToken = currentData.token;

  return (
    <>
      {isSuccess && (
        <>
          <NextSeo
            title="Tokens Feed"
            description="Share your opinion about this token."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'Lixi',
              images: [{ url: '' }],
              site_name: 'Lixi'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <TokensFeed token={currentToken} hasFollowed={currentToken.isFollowed} isMobile={isMobile} />
        </>
      )}
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
  const tokenId: string = slug;

  return {
    props: {
      tokenId,
      isMobile
    }
  };
});

TokenDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default TokenDetailPage;
