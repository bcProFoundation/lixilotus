import PageDetail from '@components/Pages/PageDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
<<<<<<< HEAD
import CreatePageComponent from '@components/Pages/CreatePageComponent';
=======
>>>>>>> master

const PageDetailPage = props => {
  const { shopId, isMobile } = props;
  const slug = shopId;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `pages/${slug}`;

  return (
    <>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'LixiLotus',
          description: shopId ?? 'LixiLotus allow you to giveaway your Lotus effortlessly',
          images: [{ url: '' }],
          site_name: 'LixiLotus'
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image'
        }}
      />
      <PageDetail shopId={shopId} isMobile={isMobile} />
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
  const shopId: string = slug;

  return {
    props: {
      shopId,
      isMobile
    }
  };
});

PageDetailPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default PageDetailPage;
