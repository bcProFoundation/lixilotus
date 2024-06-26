import PostDetail from '@components/Posts/PostDetail';
import { SagaStore, wrapper } from '@store/store';
import _ from 'lodash';
import { NextSeo } from 'next-seo';
import React, { useEffect } from 'react';
import { END } from 'redux-saga';
import { getSelectorsByUserAgent } from 'react-device-detect';
import { usePostQuery } from '@store/post/posts.generated';
import MainLayout from '@components/Layout/MainLayout';
import { PrismaClient } from '@bcpros/lixi-prisma';
import { stripHtml } from 'string-strip-html';
import intl from 'react-intl-universal';
import { AnalyticEvent } from '@bcpros/lixi-models';
import { analyticEvent } from '@store/analytic-event';
import { useAppDispatch } from '@store/hooks';

const PostDetailPage = props => {
  const dispatch = useAppDispatch();
  const { postId, isMobile, postAsString } = props;
  const post = JSON.parse(postAsString);
  const canonicalUrl = process.env.NEXT_PUBLIC_LIXI_URL + `post/${postId}`;

  const postQuery = usePostQuery({ id: postId });

  const document = new DOMParser().parseFromString(post.content, 'text/html');
  const paragraphElement = document.querySelector('.EditorLexical_paragraph');
  const paragraphText = paragraphElement?.textContent;

  useEffect(() => {
    // analytic event
    const payload: AnalyticEvent = {
      eventType: 'view',
      eventData: {
        id: postId,
        type: 'post'
      }
    };
    dispatch(analyticEvent(payload));
  }, [postId]);

  return (
    <React.Fragment>
      <NextSeo
        title={`${post.postAccount.name} ${intl.get('post.on')} Lixi: "${paragraphText}"`}
        description="A place where you have complete control on what you want to see and what you want others to see collectively. No platform influence. No platform ads."
        canonical={canonicalUrl}
        openGraph={{
          url: canonicalUrl,
          title: 'Lixi',
          description: post.content
            ? `${post.postAccount.name} at Lixi: "${stripHtml(post.content).result}"`
            : 'Your Attention Your Money!',
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
