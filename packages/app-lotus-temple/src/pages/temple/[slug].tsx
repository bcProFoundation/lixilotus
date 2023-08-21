import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { useWorshipedPersonQuery } from '@store/worship/worshipedPerson.generated';
import MainLayout from '@components/Layout/MainLayout';
import TempleDetail from '@components/Temple/TempleDetail';
import { useTempleQuery } from '@store/temple/temple.generated';

const TempleDetailPage = props => {
  const { templeId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LOTUS_TEMPLE_URL + `temple/${templeId}`;

  const templeQuery = useTempleQuery({ id: templeId });

  return (
    <React.Fragment>
      {templeQuery && templeQuery.isSuccess && (
        <React.Fragment>
          <NextSeo
          // title="Lixi Program"
          // description="A place where you have complete control on what you want to see and what you want others to see collectively. No platform influence. No platform ads."
          // canonical={canonicalUrl}
          // openGraph={{
          //   url: canonicalUrl,
          //   title: 'LixiLotus',
          //   description: postQuery.data.post.content ?? 'LixiLotus allow you to giveaway your Lotus effortlessly',
          //   images: [{ url: '' }],
          //   site_name: 'LixiLotus'
          // }}
          // twitter={{
          //   handle: '@handle',
          //   site: '@site',
          //   cardType: 'summary_large_image'
          // }}
          />
          <TempleDetail temple={templeQuery.data.temple} isMobile={isMobile} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) => async context => {
  const { req } = context;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const { isMobile } = getSelectorsByUserAgent(userAgent);

  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const slug: string = _.isArray(context.params.slug) ? context.params.slug[0] : context.params.slug;
  const templeId: string = slug;

  return {
    props: {
      templeId,
      isMobile
    }
  };
});

TempleDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default TempleDetailPage;
