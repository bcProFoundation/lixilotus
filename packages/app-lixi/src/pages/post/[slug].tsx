import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { usePostQuery } from '@store/post/posts.generated';
import MainLayout from '@components/Layout/MainLayout';

const PostDetailPage = props => {
  const { postId, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `posts/${postId}`;

  const postQuery = usePostQuery({ id: postId });
  // TODO: test meta tag
  return (
    <>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'LixiLotus',
          description: postQuery.data.post.content ?? 'LixiLotus allow you to giveaway your Lotus effortlessly',
          images: [
            {
              url: 'https://img5.thuthuatphanmem.vn/uploads/2022/01/12/999-hinh-anh-ngau-nhat_095431489.jpg',
              width: 800,
              height: 600,
              alt: 'Og Image Alt',
              type: 'image/jpeg',
            },
            {
              url: 'https://img5.thuthuatphanmem.vn/uploads/2022/01/12/999-hinh-anh-ngau-nhat_095431489.jpg',
              width: 900,
              height: 800,
              alt: 'Og Image Alt Second',
              type: 'image/jpeg',
            },
            { url: 'https://img5.thuthuatphanmem.vn/uploads/2022/01/12/999-hinh-anh-ngau-nhat_095431489.jpg' },
            { url: 'https://img5.thuthuatphanmem.vn/uploads/2022/01/12/999-hinh-anh-ngau-nhat_095431489.jpg' },
          ],
          siteName: 'SiteName',
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image',
        }}
      />
      {/* {postQuery && postQuery.isSuccess && (
        <>
          <NextSeo
            title="Lixi Program"
            description="The lixi program send you a small gift ."
            canonical={canonicalUrl}
            openGraph={{
              url: canonicalUrl,
              title: 'LixiLotus',
              description: postQuery.data.post.content ?? 'LixiLotus allow you to giveaway your Lotus effortlessly',
              images: [{ url: '' }],
              site_name: 'LixiLotus'
            }}
            twitter={{
              handle: '@handle',
              site: '@site',
              cardType: 'summary_large_image'
            }}
          />
          <PostDetail post={postQuery.data.post} isMobile={isMobile} />
        </>
      )} */}
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
  const postId: string = slug;

  return {
    props: {
      postId,
      isMobile
    }
  };
});

PostDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default PostDetailPage;
