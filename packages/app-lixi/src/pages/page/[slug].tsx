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

const PageDetailPage = props => {
  const { pageId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `pages/${pageId}`;
  let currentPage;
  let checkIsFollowed;

  const { currentData: currentDataPageQuery, isSuccess: isSuccessPageQuery } = usePageQuery({ id: pageId });
  const { currentData: currentDataCheckIsFollowed, isSuccess: isSuccessCheckIsFollowed } = useCheckIfFollowPageQuery({
    pageId: pageId
  });

  if (isSuccessPageQuery && isSuccessCheckIsFollowed) {
    currentPage = currentDataPageQuery.page;
    checkIsFollowed = currentDataCheckIsFollowed.checkIfFollowPage;
  }

  return (
    <>
      {isSuccessPageQuery && isSuccessCheckIsFollowed && (
        <>
          <NextSeo
            title={currentPage.name}
            description="The lixi program send you a small gift ."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'LixiLotus',
              description: currentPage.description || 'Change your attention change the world!',
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

PageDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default PageDetailPage;
