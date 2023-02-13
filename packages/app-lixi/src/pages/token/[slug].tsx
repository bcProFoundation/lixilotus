import React from 'react';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import TokensFeed from '@components/Token/TokensFeed';
import { NextSeo } from 'next-seo';
import { SagaStore, wrapper } from '@store/store';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { END } from 'redux-saga';
import _ from 'lodash';
import { useTokenQuery } from '@store/token/tokens.generated';

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
              title: 'LixiLotus',
              images: [{ url: '' }],
              site_name: 'LixiLotus'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <TokensFeed token={currentToken} isMobile={isMobile} />
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

TokenDetailPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default TokenDetailPage;
