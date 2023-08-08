import PageDetailLayout from '@components/Layout/PageDetailLayout';
import PageDetail from '@components/Pages/PageDetail';
import { useCheckIfFollowPageQuery } from '@store/follow/follows.api';
import { usePageQuery } from '@store/page/pages.generated';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import { getSelectorsByUserAgent } from 'react-device-detect';
import MainLayout from '@components/Layout/MainLayout';
import { END } from 'redux-saga';
import { useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account';
import React from 'react';

const PageDetailPage = props => {
  const { pageId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `pages/${pageId}`;
  const selectedAccount = useAppSelector(getSelectedAccount);

  const { currentData: currentDataPageQuery, isSuccess: isSuccessPageQuery } = usePageQuery({ id: pageId });
  const { currentData: currentDataCheckIsFollowed, isSuccess: isSuccessCheckIsFollowed } = useCheckIfFollowPageQuery(
    {
      pageId: pageId
    },
    { skip: !selectedAccount || !isSuccessPageQuery }
  );

  return (
    <React.Fragment>
      {isSuccessPageQuery && (
        <React.Fragment>
          <NextSeo
            title={currentDataPageQuery.page.name}
            description="The lixi program send you a small gift ."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'Lixi',
              description: currentDataPageQuery.page.description || 'Save your attention save the world!',
              images: [{ url: '' }],
              site_name: 'Lixi'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <PageDetail
            page={currentDataPageQuery.page}
            isMobile={isMobile}
            checkIsFollowed={currentDataCheckIsFollowed?.checkIfFollowPage}
          />
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
  const pageId: string = slug;

  return {
    props: {
      pageId,
      isMobile
    }
  };
});

PageDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default PageDetailPage;
