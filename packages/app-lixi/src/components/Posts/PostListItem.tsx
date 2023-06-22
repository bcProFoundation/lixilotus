import ReactDomServer from 'react-dom/server';
import CommentComponent, { CommentItem } from '@components/Common/Comment';
import InfoCardUser from '@components/Common/InfoCardUser';
import { ShareSocialButton } from '@components/Common/ShareSocialButton';
import { openModal } from '@store/modal/actions';
import { PostsQuery } from '@store/post/posts.generated';
import { formatBalance } from '@utils/cashMethods';
import { List, Button, Space } from 'antd';
import { PlusCircleOutlined, RetweetOutlined } from '@ant-design/icons';
import _, { truncate } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import intl from 'react-intl-universal';
import { useAppDispatch } from '@store/hooks';
import styled from 'styled-components';
import { EditPostModalProps } from './EditPostModalPopup';
import Gallery from 'react-photo-gallery';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { formatRelativeTime } from '@utils/formatting';
import { Counter } from '@components/Common/Counter';
import Reaction from '@components/Common/Reaction';
import parse from 'html-react-parser';
import { ReadMoreMore } from 'read-more-more';
import PostContent from './PostContent';
import ActionPostBar from '@components/Common/ActionPostBar';
import { setSelectedPost } from '@store/post/actions';

export const CommentList = ({ comments }: { comments: CommentItem[] }) => (
  <List
    style={{ width: '100%' }}
    dataSource={comments}
    itemLayout="horizontal"
    renderItem={postComment => <CommentComponent data={postComment} />}
  />
);

export const SpaceIconNoneHover = styled(Space)`
  min-height: 38px;
  padding: 8px;
  img {
    transition: all 0.2s ease-in-out;
    width: 28px;
    height: 28px;
  }

  &:hover {
    background: #faf1fa;
  }
`;

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
    @media (max-width: 960px) {
      div {
        &[data-lexical-decorator='true'] > div > div {
          width: 100% !important;
        }
      }
    }
    iframe {
      width: 100% !important;
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
  }
  .image-cover {
    width: 100%;
    max-height: 300px;
  }
  .images-post {
    cursor: pointer;
    width: 100%;
    padding: 1rem;
    margin: 1rem 0;
    background: var(--bg-color-light-theme);
    transition: 0.5s ease;
    img {
      max-width: 100%;
      max-height: 45vh;
      object-fit: cover;
    }
    &:hover {
      opacity: 0.9;
    }
    .show-more-image {
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
    border-radius: 20px;
  }
`;

export const GroupIconText = styled.div`
  align-items: center;
  display: flex;
  .ant-space {
    cursor: pointer;
    margin-right: 1rem;
    align-items: end;
    border-radius: 12px;
    cursor: pointer;
    @media (max-width: 960px) {
      margin-right: 1rem;
    }

    &.repost {
      svg {
        color: var(--color-primary);
        width: 28px;
        height: 28px;
      }
    }
  }
  img {
    width: 28px;
    height: 28px;
  }
  .count {
    color: rgba(30, 26, 29, 0.6);
    font-size: 12px;
  }
`;

const PostListItemContainer = styled(List.Item)`
  display: flex;
  flex-direction: column;
  height: fit-content !important;
  margin: 2px 2px 1rem 2px;
  border-radius: 24px;
  background: white;
  padding: 0;
  border: none;
  border: 1px solid var(--boder-item-light);
  &:hover {
    background: rgb(252, 252, 252);
  }
  transition: 0.5s;
`;

export const IconNoneHover = ({
  value,
  imgUrl,
  classStyle,
  onClickIcon
}: {
  value?: number;
  imgUrl?: string;
  classStyle?: string;
  onClickIcon: (e: any) => void;
}) => (
  <SpaceIconNoneHover onClick={onClickIcon} size={5}>
    {imgUrl && (
      <picture>
        <img className={classStyle} alt="burnIcon" src={imgUrl} />
      </picture>
    )}
    {value && <Counter num={value ?? 0} />}
  </SpaceIconNoneHover>
);

type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type PostListItemProps = {
  index: number;
  item: PostItem;
  searchValue?: string;
  handleBurnForPost?: (isUpVote: boolean, post: any, optionBurn?: string) => Promise<void>;
  addHashtag?: (hashtag: string) => any;
};

const PostListItem = ({ index, item, searchValue, handleBurnForPost, addHashtag }: PostListItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const post: PostItem = item;
  const [showMoreImage, setShowMoreImage] = useState(true);
  const [imagesList, setImagesList] = useState([]);
  const ref = useRef<HTMLDivElement | null>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const mapImages = item.uploads.map(img => {
      //Resize img with Sha
      let imgSha = img.upload.sha;
      // TODO: check root cause image rotate not correct
      // let imgSha;
      // if (!img.upload.sha800 || !img.upload.sha320 || !img.upload.sha40) {
      //   imgSha = img.upload.sha;
      // } else if (width <= 1200) {
      //   imgSha = img.upload.sha320;
      // } else if (width > 1200) {
      //   imgSha = img.upload.sha800;
      // }
      const imgUrl = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT}/${img.upload.bucket}/${imgSha}`;
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

  const handlePostClick = e => {
    if (e.target.className === 'hashtag-link') {
      e.stopPropagation();
      addHashtag(e.target.id);
      return;
    }
    if (e.target.className === 'read-more-more-module_btn__33IaH') {
      e.stopPropagation();
    } else {
      dispatch(setSelectedPost(post.id));
      router.push(`/post/${post.id}`);
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
      if (post.reposts.length - 1 == 0) {
        return (
          <p className="retweet">
            <RetweetOutlined />{' '}
            {intl.get('post.singleReposted', { repostName: post.reposts[post.reposts.length - 1].account.name })}
          </p>
        );
      } else {
        return (
          <p className="retweet">
            <RetweetOutlined />{' '}
            {intl.get('post.multiReposted', {
              repostName: `${post.reposts[post.reposts.length - 1].account.name} + ${post.reposts.length - 1}`
            })}
          </p>
        );
      }
    }
    return '';
  };

  return (
    <PostListItemContainer key={post.id} ref={ref}>
      <CardContainer>
        {reposted()}
        <CardHeader>
          <InfoCardUser
            imgUrl={post.page ? post.page.avatar : ''}
            name={showUsername()}
            title={formatRelativeTime(post.createdAt)}
            postAccountAddress={post.postAccount ? post.postAccount.address : undefined}
            page={post.page ? post.page : undefined}
            token={post.token ? post.token : undefined}
            activatePostLocation={true}
            onEditPostClick={editPost}
            postEdited={post.createdAt !== post.updatedAt}
            isDropdown={true}
            lotusBurnScore={post.lotusBurnScore}
            followPostOwner={post.followPostOwner}
          />
        </CardHeader>
        <Content onClick={e => handlePostClick(e)}>
          <div className="description-post">
            <PostContent postContent={post.content} />
          </div>
          {item.uploads.length != 0 && !showMoreImage && (
            <div className="images-post">
              <Gallery photos={imagesList} />
            </div>
          )}
          {item.uploads.length != 0 && showMoreImage && (
            <>
              <div className="images-post">
                <Gallery photos={imagesList.slice(0, 1)} />
                {item.uploads.length > 1 && (
                  <Button type="link" className="show-more-image no-border-btn">
                    {'More ' + (item.uploads.length - 1) + ' images'}
                    <PlusCircleOutlined />
                  </Button>
                )}
              </div>
            </>
          )}
        </Content>
      </CardContainer>
      <ActionPostBar post={post} handleBurnForPost={handleBurnForPost} onClickIconComment={e => handlePostClick(e)} />
    </PostListItemContainer>
  );
};

export default React.memo(PostListItem);
