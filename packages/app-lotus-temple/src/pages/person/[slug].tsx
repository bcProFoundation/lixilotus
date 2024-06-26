import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { useWorshipedPersonQuery } from '@store/worship/worshipedPerson.generated';
import MainLayout from '@components/Layout/MainLayout';
import PersonDetail from '@components/WorshipedPerson/PersonDetail';

const PersonDetailPage = props => {
  const { personId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `posts/${personId}`;

  //TODO: Uncomment the below code to execute query
  const personQuery = useWorshipedPersonQuery({ id: personId });

  return (
    <>
      {personQuery && personQuery.isSuccess && (
        <>
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
          <PersonDetail person={personQuery.data.worshipedPerson} isMobile={isMobile} />
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
  const personId: string = slug;

  return {
    props: {
      personId,
      isMobile
    }
  };
});

PersonDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default PersonDetailPage;
