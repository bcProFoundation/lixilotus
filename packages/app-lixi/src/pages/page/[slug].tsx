import PageDetail from '@components/Pages/PageDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import pageApi from '@store/page/api';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import PageDetailLayout from '@components/Layout/PageDetailLayout';
import ProfileDetail from '@components/Profile/ProfileDetail';
import { usePageQuery } from '@store/page/pages.generated';
import { useCheckIsFollowedPageQuery } from '@store/follow/follows.api';

const PageDetailPage = props => {
  const { pageId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `pages/${pageId}`;
  let currentPage;
  let checkIsFollowed;

  const { currentData: currentDataPageQuery, isSuccess: isSuccessPageQuery } = usePageQuery({ id: pageId });
  const { currentData: currentDataCheckIsFollowed, isSuccess: isSuccessCheckIsFollowed } = useCheckIsFollowedPageQuery({
    pageId: pageId
  });

  if (isSuccessPageQuery && isSuccessCheckIsFollowed) {
    currentPage = currentDataPageQuery.page;
    checkIsFollowed = currentDataCheckIsFollowed.checkIsFollowedPage.isFollowed;
  }

  return (
    <>
      {isSuccessPageQuery && isSuccessCheckIsFollowed && (
        <>
          <NextSeo
            title="Lixi Program"
            description="The lixi program send you a small gift ."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'LixiLotus',
              description: currentPage.description || 'LixiLotus allow you to giveaway your Lotus effortlessly',
              images: [{ url: '' }],
              site_name: 'LixiLotus'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <PageDetail page={currentPage} isMobile={isMobile} checkIsFollowed={checkIsFollowed} />
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
  const pageId: string = slug;

  return {
    props: {
      pageId,
      isMobile
    }
  };
});

PageDetailPage.Layout = ({ children }) => <PageDetailLayout children={children} />;

export default PageDetailPage;
