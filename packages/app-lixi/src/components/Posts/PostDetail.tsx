import {
  DashOutlined,
  DislikeFilled,
  DislikeOutlined,
  LikeFilled,
  LikeOutlined,
  LinkOutlined,
  ShareAltOutlined,
  UpOutlined
} from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getSelectedAccount } from '@store/account/selectors';
import { burnForUpDownVote } from '@store/burn/actions';
import { api as commentsApi, useCreateCommentMutation } from '@store/comment/comments.api';
import { useInfiniteCommentsToPostIdQuery } from '@store/comment/useInfiniteCommentsToPostIdQuery';
import { PostsQuery } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance } from '@utils/cashMethods';
import { Button, Image, Input, message, Popover, Space, Avatar } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';
import ReactHtmlParser from 'react-html-parser';
import intl from 'react-intl-universal';
import {
  FacebookIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton
} from 'react-share';
import { Virtuoso } from 'react-virtuoso';
import { RWebShare } from 'react-web-share';
import { CommentOrderField, CreateCommentInput, OrderDirection } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import CommentListItem from './CommentListItem';

const URL_SERVER_IMAGE = 'https://s3.us-west-001.backblazeb2.com';

type PostItem = PostsQuery['allPosts']['edges'][0]['node'];

const { Search } = Input;

const IconBurn = ({
  icon,
  burnValue,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  burnValue?: number;
  dataItem: any;
  imgUrl?: string;
  onClickIcon: () => void;
}) => (
  <Space onClick={onClickIcon} style={{ alignItems: 'end', marginRight: '1rem' }}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl }, null)}
    <Counter num={burnValue ?? 0} />
  </Space>
);

type SocialSharePanelProps = {
  className?: string;
  shareUrl: string;
};

const SocialSharePanel = ({ className, shareUrl }: SocialSharePanelProps): JSX.Element => {
  const title = intl.get('post.titleShared');
  return (
    <div className={className}>
      <div className="socialshare-network">
        <FacebookShareButton url={shareUrl} quote={title} className="socialshare-button">
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>

      <div className="socialshare-network">
        <FacebookMessengerShareButton url={shareUrl} appId="521270401588372" className="socialshare-button">
          <FacebookMessengerIcon size={32} round />
        </FacebookMessengerShareButton>
      </div>

      <div className="socialshare-network">
        <TwitterShareButton url={shareUrl} title={title} className="socialshare">
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      </div>

      <div className="socialshare-network">
        <TelegramShareButton url={shareUrl} title={title} className="socialshare-button">
          <TelegramIcon size={32} round />
        </TelegramShareButton>
      </div>

      <div className="socialshare-network">
        <WhatsappShareButton url={shareUrl} title={title} separator=":: " className="socialshare-button">
          <WhatsappIcon size={32} round />
        </WhatsappShareButton>
      </div>

      <div className="socialshare-network">
        <Button
          type="primary"
          shape="circle"
          icon={<LinkOutlined style={{ color: 'white', fontSize: '20px' }} />}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            message.success(intl.get('post.copyToClipboard'));
          }}
        />
      </div>
    </div>
  );
};

const StyledSocialSharePanel = styled(SocialSharePanel)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .socialshare-network {
    padding: 10px 4px;
  }
`;

const popOverContent = shareUrl => {
  return <StyledSocialSharePanel shareUrl={shareUrl} />;
};

type PostDetailProps = {
  post: PostItem;
  isMobile: boolean;
};

const PostDetail = ({ post, isMobile }: PostDetailProps) => {
  const dispatch = useAppDispatch();
  const history = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const refCommentsListing = useRef<HTMLDivElement | null>(null);
  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;
  const { burnXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);

  const { data, totalCount, fetchNext, hasNext, isFetching } = useInfiniteCommentsToPostIdQuery(
    {
      first: 20,
      orderBy: {
        direction: OrderDirection.Asc,
        field: CommentOrderField.UpdatedAt
      },
      id: post.id
    },
    false
  );

  const [
    createCommentTrigger,
    { isLoading: isLoadingCreatePost, isSuccess: isSuccessCreatePost, isError: isErrorCreatePost }
  ] = useCreateCommentMutation();

  const upVotePost = (dataItem: PostItem) => {
    handleBurnForPost(true, dataItem);
  };

  const downVotePost = (dataItem: PostItem) => {
    handleBurnForPost(false, dataItem);
  };

  const handleBurnForPost = async (isUpVote: boolean, post: PostItem) => {
    try {
      if (slpBalancesAndUtxos.nonSlpUtxos.length == 0) {
        throw new Error('Insufficient funds');
      }
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      const burnValue = '1';
      const tipToAddress = post?.postAccount?.address ?? undefined;

      const txHex = await burnXpi(
        XPI,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        burnType,
        BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddress
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddress: xAddress,
        postQueryTag: PostsQueryTag.Post
      };

      dispatch(burnForUpDownVote(burnCommand));
    } catch (e) {
      dispatch(
        showToast('error', {
          message: intl.get('post.unableToBurn'),
          duration: 3
        })
      );
    }
  };

  const CommentContainer = styled.div`
    padding: 0 1rem;
    .comment-item {
      text-align: left;
      border: 0 !important;
    }
  `;

  const CommentInputContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
  `;

  const PostCardDetail = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
    .info-post {
      display: flex;
      img {
        width: 35px;
        height: 35px;
        border-radius: 50%;
      }
    }
  `;

  const PostContentDetail = styled.div`
    .images-post {
      width: 100%;
      padding: 1rem;
      margin: 1rem 0;
      box-sizing: border-box;
      box-shadow: 0 3px 12px rgb(0 0 0 / 4%);
      background: var(--bg-color-light-theme);
      display: grid;
      grid-template-columns: auto auto;
      grid-template-rows: auto auto;
      grid-column-gap: 1rem;
      justify-items: center;
      transition: 0.5s ease;
      img {
        margin-bottom: 1rem;
        width: 80%;
      }
    }
  `;

  const StyledContainerPostDetail = styled.div`
    border-radius: 5px;
    background: white;
    padding: 1rem;
    margin-top: 1rem;
    border-radius: 1rem;
    .reaction-container {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      margin: 0 1rem;
      border: 1px solid #c5c5c5;
      border-left: 0;
      border-right: 0;
    }

    .comment-item-meta {
      margin-bottom: 0.5rem;
      .ant-list-item-meta-avatar {
        margin-top: 3%;
      }
      .ant-list-item-meta-title {
        margin-bottom: 0.5rem;
      }
    }

    .input-comment {
      padding: 1rem 1rem 0 1rem;
    }
  `;

  const ShareButton = styled.span`
    margin-left: 10px;
  `;

  const loadMoreComments = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const handleCreateNewComment = async (text: string) => {
    if (_.isNil(text) || _.isEmpty(text)) {
      return;
    }
    if (text !== '' || !_.isNil(text)) {
      const createCommentInput: CreateCommentInput = {
        commentText: text,
        commentToId: post.id
      };

      const params = {
        orderBy: {
          direction: OrderDirection.Asc,
          field: CommentOrderField.UpdatedAt
        }
      };

      let patches: PatchCollection;
      try {
        const result = await createCommentTrigger({ input: createCommentInput }).unwrap();
        patches = dispatch(
          commentsApi.util.updateQueryData(
            'CommentsToPostId',
            { id: createCommentInput.commentToId, ...params },
            draft => {
              draft.allCommentsToPostId.edges.unshift({
                cursor: result.createComment.id,
                node: {
                  ...result.createComment
                }
              });
              draft.allCommentsToPostId.totalCount = draft.allCommentsToPostId.totalCount + 1;
            }
          )
        );
      } catch (error) {
        const message = intl.get('comment.unableCreateComment');
        if (patches) {
          dispatch(commentsApi.util.patchQueryData('CommentsToPostId', params, patches.inversePatches));
        }
        dispatch(
          showToast('error', {
            message: 'Error',
            description: message,
            duration: 3
          })
        );
      }
    }
  };

  const slug = post.id;

  const shareUrl = `${baseUrl}post/${slug}`;

  const ShareSocialDropdown = (
    <Popover content={() => popOverContent(shareUrl)}>
      <ShareButton>
        <ShareAltOutlined /> Share
      </ShareButton>
    </Popover>
  );

  const ShareSocialButton = (
    <RWebShare
      data={{
        text: intl.get('post.titleShared'),
        url: shareUrl,
        title: 'LixiLotus'
      }}
      onClick={() => {}}
    >
      <ShareButton>
        <ShareAltOutlined /> Share
      </ShareButton>
    </RWebShare>
  );

  return (
    <>
      <StyledContainerPostDetail>
        <InfoCardUser
          imgUrl={post.page ? post.page.avatar : ''}
          name={post.postAccount.name}
          title={moment(post.createdAt).fromNow().toString()}
          address={post.postAccount ? post.postAccount.address : undefined}
          page={post.page ? post.page : undefined}
          token={post.token ? post.token : undefined}
          activatePostLocation={true}
        ></InfoCardUser>
        <PostContentDetail>
          <p style={{ padding: '0 1rem', margin: '1rem 0' }}>{ReactHtmlParser(post.content)}</p>
          <div style={{ display: post.uploads.length != 0 ? 'grid' : 'none' }} className="images-post">
            {post.uploads.length != 0 &&
              post.uploads.map((item, index) => {
                const imageUrl = URL_SERVER_IMAGE + '/' + item.upload.bucket + '/' + item.upload.sha;
                return (
                  <>
                    <Image.PreviewGroup>
                      <Image src={imageUrl} />
                    </Image.PreviewGroup>
                  </>
                );
              })}
          </div>
          <div className="reaction-container">
            <div className="reaction-ico">
              <IconBurn
                burnValue={formatBalance(post?.lotusBurnUp ?? 0)}
                imgUrl="/images/ico-burn-up.svg"
                key={`list-vertical-upvote-o-${post.id}`}
                dataItem={post}
                onClickIcon={() => upVotePost(post)}
              />
              <IconBurn
                burnValue={formatBalance(post?.lotusBurnDown ?? 0)}
                imgUrl="/images/ico-burn-down.svg"
                key={`list-vertical-downvote-o-${post.id}`}
                dataItem={post}
                onClickIcon={() => downVotePost(post)}
              />
            </div>
            <div className="reaction-func">
              <span>{totalCount}</span>&nbsp;
              <img src="/images/ico-comments.svg" alt="" />
            </div>
          </div>
        </PostContentDetail>

        <CommentContainer>
          <Virtuoso
            id="list-comment-virtuoso"
            data={data}
            style={{ height: '65vh', paddingBottom: '2rem' }}
            endReached={loadMoreComments}
            overscan={500}
            itemContent={(index, item) => {
              return <CommentListItem index={index} item={item} />;
            }}
          />
        </CommentContainer>
        <CommentInputContainer>
          <Avatar src="/images/xpi.svg" onClick={() => history.push(`/profile/${selectedAccount.address}`)} />
          <Search
            className="input-comment"
            placeholder="Input your comment..."
            enterButton="Comment"
            size="large"
            suffix={<DashOutlined />}
            onSearch={handleCreateNewComment}
          />
        </CommentInputContainer>
      </StyledContainerPostDetail>
    </>
  );
};

const Container = styled(PostDetail)`
  .ant-modal,
  .ant-modal-content {
    height: 100vh !important;
    top: 0 !important;
  }
  .ant-modal-body {
    height: calc(100vh - 110px) !important;
  }
`;

export default Container;
