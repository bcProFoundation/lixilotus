import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import postApi from '@store/post/api';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import PostDetailLayout from '@components/Layout/PostDetailLayout';

const PostDetailPost = props => {
  const { post, isMobile } = props;
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `posts/${post.id}`;

  return (
    <>
      <NextSeo
        title="Lixi Program"
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'LixiLotus',
          description: post.description ?? 'LixiLotus allow you to giveaway your Lotus effortlessly',
          images: [{ url: '' }],
          site_name: 'LixiLotus'
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image'
        }}
      />
      <PostDetail post={post} isMobile={isMobile} />
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

  const post = await postApi.getDetailPost(postId).then(data => {
    return data;
  });

  return {
    props: {
      post,
      isMobile
    }
  };
});

PostDetailPost.Layout = ({ children }) => <PostDetailLayout children={children} />;

export default PostDetailPost;
