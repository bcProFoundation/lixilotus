import { PlusCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import ActionPostBar from '@components/Common/ActionPostBar';
import CommentComponent, { CommentItem } from '@components/Common/Comment';
import InfoCardUser from '@components/Common/InfoCardUser';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { useAppDispatch } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { PostsQuery } from '@store/post/posts.generated';
import { formatRelativeTime } from '@utils/formatting';
import { Button, List } from 'antd';
import _ from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import intl from 'react-intl-universal';
import Gallery from 'react-photo-gallery';
import styled from 'styled-components';
import { EditPostModalProps } from './EditPostModalPopup';
import PostContent from './PostContent';
import PostTranslate from './PostTranslate';
import { PostListType } from '@bcpros/lixi-models/constants';

export const CommentList = ({ comments }: { comments: CommentItem[] }) => (
  <List
    style={{ width: '100%' }}
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={postComment => <CommentComponent data={postComment} />}
  />
);

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 0 1rem;
  width: 100%;

  .retweet {
    display: flex;
    margin: 0px 0px 5px 5px;
    color: gray;
  }

  @media (max-width: 520px) {
    padding: 12px 12px 0 12px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  .info-user {
    .name-title {
      margin-left: 0.5rem;
      font-size: 12px;
    }
  }
  .time-created {
    font-size: 12px;
  }
`;

const Content = styled.div`
  .description-post {
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    word-break: break-word;
    cursor: pointer;
    margin-bottom: 1rem;
    div > div > [data-lexical-decorator] {
      display: flex;
      justify-content: center;
      @media (max-width: 960px) {
        max-height: 500px;
      }
    }
    p {
      font-size: 14px;
      line-height: 22px;
    }
    .read-more-more-module_btn__33IaH {
      font-size: 14px;
    }
    @media (max-width: 960px) {
      div {
        &[data-lexical-decorator='true'] > div > div {
          width: 100% !important;
        }
      }
    }
    iframe {
      min-width: 560px !important;
      width: 750px !important;
      max-width: 100% !important;
      height: 50vh;
      @media (max-width: 960px) {
        min-width: auto !important;
        width: 560px !important;
        height: 30vh;
        max-height: 60vh;
      }
      // &#twitter-widget-0 {
      //   height: 750px !important;
      //   @media (min-width: 960px) {
      //     width: 550px !important;
      //     margin: auto !important;
      //   }
      //   @media (max-width: 960px) {
      //     height: 620px !important;
      //   }
      // }
      &#reddit-embed {
        height: 500px !important;
        @media (max-width: 960px) {
          height: 450px !important;
        }
      }
      &#facebook-embed {
        height: 700px !important;
        @media (max-width: 960px) {
          height: 580px !important;
        }
      }
    }
    p {
      margin: 0;
    }
    .read-more {
      & > div > div {
        // max-height: 130px !important;
      }
    }
  }
  .description-translate {
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    word-break: break-word;
    border-left: var(--color-primary) 1px solid;
    padding: 3px 3px 3px 6px;
    margin-bottom: 1rem;
    p {
      font-size: 14px;
      line-height: 22px;
    }
    .read-more-more-module_btn__33IaH {
      font-size: 14px;
    }
  }
  .image-cover {
    width: 100%;
    max-height: 300px;
  }
  .images-post {
    position: relative;
    cursor: pointer;
    width: 100%;
    margin: 1rem 0;
    transition: 0.5s ease;
    img {
      max-width: 100%;
      max-height: 50vh;
      object-fit: contain;
      border-radius: var(--border-radius-primary);
    }
    &:hover {
      opacity: 0.9;
    }
    .show-more-image {
    }
    .show-more-desktop {
      display: flex;
      align-items: center;
      color: #fff;
      position: absolute;
      top: 50%;
      left: 50%;
      -ms-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
      font-size: 26px;
      font-weight: 500;
    }
    &.images-post-mobile {
      display: flex;
      overflow-x: auto;
      gap: 5px;
      -ms-overflow-style: none; // Internet Explorer 10+
      scrollbar-width: none; // Firefox
      ::-webkit-scrollbar {
        display: none; // Safari and Chrome
      }
      img {
        // max-width: fit-content;
        // height: 100%;
        // max-height: 50vh;
        // object-fit: contain;
        // border-radius: 0;
        width: auto;
        max-width: 75vw;
        max-height: 50vh;
        object-fit: cover;
        border-radius: var(--border-radius-primary);
        border: 1px solid var(--lt-color-gray-100);
      }
      &.only-one-image {
        justify-content: center;
        img {
          width: 100%;
          max-width: 100%;
        }
      }
    }
    &.images-post-desktop {
      img {
        object-fit: cover;
      }
    }
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: center;
  padding: 8px 0;
  width: 96%;
  border-top: 1px solid #efeeef;
  button {
    margin-right: 1rem;
    border-radius: var(--border-radius-primary);
  }
`;

const StyledTranslate = styled.div`
  cursor: pointer;
  color: var(--color-primary);
  text-align: left;
  margin-bottom: 5px;
  font-size: 12px;
  pointer-events: none;
`;

const PostListItemContainer = styled(List.Item)`
  display: flex;
  flex-direction: column;
  height: fit-content !important;
  margin-bottom: 1rem;
  box-shadow: 1rem 1rem 2.5rem 0 rgb(0 0 0 / 5%);
  border-radius: var(--border-radius-primary);
  background: white;
  padding: 0;
  border: none;
  border: 1px solid var(--border-item-light);
  &:hover {
    background: rgb(252, 252, 252);
  }
  transition: 0.5s;
  @media (max-width: 520px) {
    margin-bottom: 8px;
  }
`;

type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type PostListItemProps = {
  index: number;
  item: PostItem;
  searchValue?: string;
  postListType?: PostListType;
  handleBurnForPost?: (isUpVote: boolean, post: any, optionBurn?: string) => Promise<void>;
  addToRecentHashtags?: (hashtag: string) => any;
};

const PostListItem = ({
  index,
  item,
  searchValue,
  postListType,
  handleBurnForPost,
  addToRecentHashtags
}: PostListItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const post: PostItem = item;
  const [showMoreImage, setShowMoreImage] = useState(true);
  const [imagesList, setImagesList] = useState([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const mapImages = item.uploads.map(img => {
      let imgSha = img.upload.sha;

      const imgUrl = `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${img.upload.cfImageId}/public`;
      let imgWidth = parseInt(img?.upload?.width) || 4;
      let height = parseInt(img?.upload?.height) || 3;
      let objImg = {
        src: imgUrl,
        width: imgWidth,
        height: height
      };
      return objImg;
    });
    setImagesList(mapImages);
  }, [width]);

  useEffect(() => {
    const isMobileDetail = width < 768 ? true : false;
    setShowMoreImage(isMobileDetail);
  }, [width]);

  if (!post) return null;

  const openPostDetailModal = (postData: any) => {
    dispatch(openModal('PostDetailModal', { post: postData }));
  };

  const handlePostClick = e => {
    if (e.target.className === 'hashtag-link') {
      e.stopPropagation();
      const hashtag = e.target.id;
      if (router.query.hashtags) {
        //Check dup before adding to query
        const queryHashtags = (router.query.hashtags as string).split(' ');
        const hashtagExistedIndex = queryHashtags.findIndex(h => h.toLowerCase() === hashtag.toLowerCase());

        if (hashtagExistedIndex === -1) {
          router.replace({
            query: {
              ...router.query,
              hashtags: router.query.hashtags + ' ' + hashtag
            }
          });
        }
      } else {
        router.replace({
          query: {
            ...router.query,
            q: '',
            hashtags: hashtag
          }
        });
      }

      addToRecentHashtags(hashtag);

      return;
    }
    if (e.target.className === 'read-more-more-module_btn__33IaH' || e.target.className.includes('post-translation')) {
      openPostDetailModal(post);
      e.stopPropagation();
    } else {
      // dispatch(setSelectedPost(post.id));
      // router.push(`/post/${post.id}`);
      openPostDetailModal(post);
    }
  };

  const showUsername = () => {
    if (_.isNil(post.postAccount)) {
      return 'Anonymous';
    }

    return post?.postAccount?.name;
  };

  const editPost = () => {
    const editPostProps: EditPostModalProps = {
      postAccountAddress: post.postAccount.address,
      content: post.content,
      postId: post.id
    };
    dispatch(openModal('EditPostModalPopup', editPostProps));
  };

  const reposted = () => {
    if (!_.isNil(post.reposts) && post.reposts.length != 0) {
      return (
        <p className="retweet">
          <RetweetOutlined />{' '}
          {intl.get('post.singleReposted', { repostName: post.reposts[post.reposts.length - 1].account.name })}
        </p>
      );
    }
    return '';
  };

  const translatePost = () => {
    setShowTranslation(!showTranslation);
  };

  return (
    <PostListItemContainer className="post-list-item" key={post.id} ref={ref}>
      <CardContainer className="card-container-post">
        {reposted()}
        <CardHeader>
          <InfoCardUser
            imgUrl={post.postAccount.avatar ? post.postAccount.avatar : ''}
            name={showUsername()}
            title={formatRelativeTime(post.createdAt)}
            postAccountAddress={post.postAccount ? post.postAccount.address : undefined}
            page={post.page ? post.page : undefined}
            token={post.token ? post.token : undefined}
            activatePostLocation={true}
            onEditPostClick={editPost}
            postEdited={post.createdAt !== post.updatedAt}
            isDropdown={true}
            danaBurnScore={post.danaBurnScore}
            followPostOwner={post.followPostOwner}
            followedPage={post.followedPage}
            post={post}
            postListType={postListType}
          />
        </CardHeader>
        <Content onClick={e => handlePostClick(e)}>
          <div className="description-post">
            <PostContent post={post} />
          </div>

          {post.translations &&
            post.translations.length > 0 &&
            (showTranslation ? (
              <StyledTranslate onClick={translatePost} className="post-translation">
                {intl.get('post.hideTranslate')}
              </StyledTranslate>
            ) : (
              <StyledTranslate onClick={translatePost} className="post-translation">
                {intl.get('post.showTranslate')}
              </StyledTranslate>
            ))}
          {showTranslation && post.translations && post.translations.length > 0 && (
            <div className="description-translate">
              <PostTranslate postTranslate={post.translations[0].translateContent} />
            </div>
          )}
          {item.uploads.length != 0 && !showMoreImage && (
            <div className={`images-post ${imagesList.length > 1 ? 'images-post-desktop' : ''}`}>
              <Gallery photos={imagesList.length > 3 ? imagesList.slice(0, 4) : imagesList} />
              {item.uploads.length > 3 && (
                <Button type="link" className="show-more-desktop show-more-image no-border-btn">
                  {item.uploads.length - 1 + ' +'}
                </Button>
              )}
            </div>
          )}
          {item.uploads.length != 0 && showMoreImage && (
            <>
              {item.uploads.length > 1 && (
                <div className="images-post images-post-mobile">
                  {imagesList.map((img, index) => {
                    return <img key={index} src={img.src} />;
                  })}
                </div>
              )}
              {item.uploads.length === 1 && (
                <>
                  <div className="images-post images-post-mobile only-one-image">
                    {imagesList.map((img, index) => {
                      return <img key={index} src={img.src} />;
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </Content>
      </CardContainer>
      <ActionPostBar post={post} handleBurnForPost={handleBurnForPost} onClickIconComment={e => handlePostClick(e)} />
    </PostListItemContainer>
  );
};

export default React.memo(PostListItem);
