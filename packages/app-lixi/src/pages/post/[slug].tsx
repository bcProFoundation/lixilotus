import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { usePostQuery } from '@store/post/posts.generated';
import MainLayout from '@components/Layout/MainLayout';
import { PrismaClient } from '@bcpros/lixi-prisma';
import { stripHtml } from 'string-strip-html';
import intl from 'react-intl-universal';

const PostDetailPage = props => {
  const { postId, isMobile, postAsString } = props;
  const post = JSON.parse(postAsString);
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `post/${postId}`;

  const postQuery = usePostQuery({ id: postId });

  const document = new DOMParser().parseFromString(post.content, 'text/html');
  const paragraphElement = document.querySelector('.EditorLexical_paragraph');
  const paragraphText = paragraphElement?.textContent;

  return (
    <React.Fragment>
      <NextSeo
        title= {`${post.postAccount.name} ${intl.get('post.on')} LixiLotus: "${paragraphText}"`}
        description="The lixi program send you a small gift ."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'LixiLotus',
          description: post.content
            ? `${post.postAccount.name} at LixiLotus: "${stripHtml(post.content).result}"`
            : 'LixiLotus allow you to giveaway your Lotus effortlessly',
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_LIXI_URL}images/lixilotus-logo.svg`,
              width: 800,
              height: 600,
              alt: 'Lotus Logo',
              type: 'image/jpeg'
            }
          ],
          site_name: `Posted by ${post.postAccount.name}`
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
      {postQuery && postQuery.isSuccess && <PostDetail post={postQuery.data.post} isMobile={isMobile} />}
    </React.Fragment>
  );
};

export const getServerSideProps = wrapper.getServerSideProps((store: SagaStore) => async context => {
  const { req } = context;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const { isMobile } = getSelectorsByUserAgent(userAgent);
  const prisma = new PrismaClient();

  store.dispatch(END);
  await (store as SagaStore).__sagaTask.toPromise();

  const slug: string = _.isArray(context.params.slug) ? context.params.slug[0] : context.params.slug;
  const postId: string = slug;

  const result = await prisma.post.findUnique({
    where: {
      id: postId
    },
    include: {
      postAccount: {
        select: {
          name: true
        }
      }
    }
  });

  const postAsString = JSON.stringify(result);

  return {
    props: {
      postAsString,
      postId,
      isMobile
    }
  };
});

PostDetailPage.Layout = ({ children }) => <MainLayout children={children} />;

export default PostDetailPage;
