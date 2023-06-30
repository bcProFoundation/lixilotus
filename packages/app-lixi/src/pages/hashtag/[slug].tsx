import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { useHashtagQuery } from '@store/hashtag/hashtag.generated';
import MainLayout from '@components/Layout/MainLayout';
import { PrismaClient } from '@bcpros/lixi-prisma';
import { stripHtml } from 'string-strip-html';
import Hashtag from '@components/Hashtag';
import FourOhFourPage from '../404';

const HashtagPage = props => {
  const { hashtagContent, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `hashtag/${hashtagContent}`;

  const hashtagQuery = useHashtagQuery({ content: hashtagContent });

  return (
    <React.Fragment>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'Lixi',
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_LIXI_URL}images/lixilotus-logo.svg`,
              width: 800,
              height: 600,
              alt: 'Lotus Logo',
              type: 'image/jpeg'
            }
          ],
          site_name: `#${hashtagContent} at Lixi`
        }}
        twitter={{
          handle: '@lixilotus',
          site: '@lixilotus',
          cardType: 'summary_large_image'
        }}
        facebook={{
          appId: '264679442628200'
        }}
      />
      {hashtagQuery && hashtagQuery.isSuccess && <Hashtag hashtag={hashtagQuery.data.hashtag} isMobile={isMobile} />}
      {hashtagQuery && hashtagQuery.error && <FourOhFourPage />}
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
  const hashtagContent: string = slug;

  return {
    props: {
      hashtagContent,
      isMobile
    }
  };
});

HashtagPage.Layout = ({ children }) => <MainLayout children={children} />;

export default HashtagPage;
