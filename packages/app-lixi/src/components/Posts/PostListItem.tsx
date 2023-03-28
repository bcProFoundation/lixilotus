import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import CommentComponent, { CommentItem } from '@components/Common/Comment';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { ShareSocialButton } from '@components/Common/ShareSocialButton';
import { currency } from '@components/Common/Ticker';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { getSelectedAccount } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, burnForUpDownVote } from '@store/burn/actions';
import { openModal } from '@store/modal/actions';
import { PostsQuery } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance, fromXpiToSatoshis } from '@utils/cashMethods';
import { List, Space, Button, Image, notification } from 'antd';
import { FireTwoTone, PlusCircleOutlined } from '@ant-design/icons';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import { EditPostModalProps } from './EditPostModalPopup';
import Gallery from 'react-photo-gallery';
import useWindowDimensions from '@hooks/useWindowDimensions';
import { ReadMoreMore } from 'read-more-more';
import { IconBurn } from './PostDetail';

// export const IconBurn = ({
//   icon,
//   burnValue,
//   dataItem,
//   imgUrl,
//   onClickIcon
// }: {
//   icon?: React.FC;
//   burnValue?: number;
//   dataItem: any;
//   imgUrl?: string;
//   onClickIcon: (e) => void;
// }) => (
//   <Space onClick={onClickIcon}>
//     {icon && React.createElement(icon)}
//     {imgUrl && React.createElement('img', { src: imgUrl, width: '28' }, null)}
//     <Counter num={burnValue ?? 0} />
//   </Space>
// );

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
  padding: 1rem 0;
  width: 96%;
  border-top: 1px solid #efeeef;
  button {
    margin-right: 1rem;
    border-radius: 20px;
  }
`;

export const GroupIconText = styled.div`
  &.num-react {
    padding: 1rem 0;
    border: none;
    text-align: left;
  }
  .ant-space {
    margin-right: 2rem;
    align-items: end;
    gap: 0 !important;
    cursor: pointer;
    @media (max-width: 960px) {
      margin-right: 1rem;
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

type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

type PostListItemProps = {
  index: number;
  item: PostItem;
  searchValue?: string;
  handleBurnForPost?: (isUpVote: boolean, post: any) => Promise<void>;
};

const PostListItem = ({ index, item, searchValue, handleBurnForPost }: PostListItemProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const post: PostItem = item;
  const [isCollapseComment, setIsCollapseComment] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showMoreImage, setShowMoreImage] = useState(true);
  const [imagesList, setImagesList] = useState([]);
  const ref = useRef<HTMLDivElement | null>(null);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const mapImages = item.uploads.map(img => {
      //Resize img with Sha
      let imgSha;
      if (!img.upload.sha800 || !img.upload.sha320 || !img.upload.sha40) {
        imgSha = img.upload.sha;
      } else if (width <= 1200) {
        imgSha = img.upload.sha320;
      } else if (width > 1200) {
        imgSha = img.upload.sha800;
      }
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
    if (e.target.className === 'read-more-more-module_btn__33IaH') {
      e.stopPropagation();
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  const upVotePost = (e: React.MouseEvent<HTMLElement>, dataItem: PostItem) => {
    e.preventDefault();
    e.stopPropagation();
    handleBurnForPost(true, dataItem);
  };

  const downVotePost = (e: React.MouseEvent<HTMLElement>, dataItem: PostItem) => {
    e.preventDefault();
    e.stopPropagation();
    handleBurnForPost(false, dataItem);
  };

  const showUsername = () => {
    if (_.isNil(post.postAccount)) {
      return 'Anonymous';
    }

    if (post.page) {
      if (post?.postAccount?.id == post.pageAccount?.id) {
        return post?.page?.name;
      } else {
        return post?.postAccount?.name;
      }
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

  return (
    <PostListItemContainer key={post.id} ref={ref}>
      <CardContainer>
        <CardHeader>
          <InfoCardUser
            imgUrl={post.page ? post.page.avatar : ''}
            name={showUsername()}
            title={moment(post.createdAt).fromNow().toString()}
            postAccountAddress={post.postAccount ? post.postAccount.address : undefined}
            page={post.page ? post.page : undefined}
            token={post.token ? post.token : undefined}
            activatePostLocation={true}
            onEditPostClick={editPost}
            postEdited={post.createdAt !== post.updatedAt}
          />
        </CardHeader>
        <Content onClick={e => handlePostClick(e)}>
          <div className="description-post">
            <div className="read-more">
              <ReadMoreMore
                id="readMore"
                linesToShow={5}
                parseHtml
                text={post?.content}
                checkFor={500}
                transDuration={0}
                readMoreText={intl.get('general.showMore')}
                readLessText={intl.get('general.showLess')}
                btnStyles={{ color: 'var(--color-primary)' }}
              />
            </div>
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
      <ActionBar>
        <GroupIconText>
          <IconBurn
            burnValue={formatBalance(post?.lotusBurnUp ?? 0)}
            imgUrl="/images/ico-burn-up.svg"
            key={`list-vertical-upvote-o-${item.id}`}
            dataItem={item}
            onClickIcon={e => upVotePost(e, item)}
          />
          <IconBurn
            burnValue={formatBalance(post?.lotusBurnDown ?? 0)}
            imgUrl="/images/ico-burn-down.svg"
            key={`list-vertical-downvote-o-${item.id}`}
            dataItem={item}
            onClickIcon={e => downVotePost(e, item)}
          />
          {/* TODO: complete next Release */}
          {/* <IconBurn
            burnValue={formatBalance(post?.lotusBurnDown ?? 0)}
            imgUrl="/images/ico-comments.svg"
            key={`list-vertical-comments-o-${item.id}`}
            dataItem={item}
            onClickIcon={e => downVotePost(e, item)}
          />
          <IconBurn
            burnValue={formatBalance(post?.lotusBurnDown ?? 0)}
            imgUrl="/images/ico-share.svg"
            key={`list-vertical-share-o-${item.id}`}
            dataItem={item}
            onClickIcon={e => downVotePost(e, item)}
          /> */}
        </GroupIconText>
        <div>
          <ShareSocialButton slug={post.id} />
        </div>
      </ActionBar>
      {isCollapseComment && (
        <div
        // style={{ width: '100%', textAlign: 'left' }}
        // avatar={<Avatar src="https://joeschmoe.io/api/v1/random" alt="Han Solo" />}
        // content={<Editor submitting={submitting} />}
        />
      )}

      {isCollapseComment && comments.length > 0 && <CommentList comments={comments} />}
    </PostListItemContainer>
  );
};

export default React.memo(PostListItem);
