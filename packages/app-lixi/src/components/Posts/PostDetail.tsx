import {
  DashOutlined,
  DislikeFilled,
  DislikeOutlined,
  LeftOutlined,
  LikeFilled,
  LikeOutlined,
  LinkOutlined,
  ShareAltOutlined,
  UpOutlined
} from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getSelectedAccount } from '@store/account/selectors';
import { burnForUpDownVote } from '@store/burn/actions';
import { api as commentsApi, useCreateCommentMutation } from '@store/comment/comments.api';
import { useInfiniteCommentsToPostIdQuery } from '@store/comment/useInfiniteCommentsToPostIdQuery';
import { PostsQuery } from '@store/post/posts.generated';
import { sendXPIFailure } from '@store/send/actions';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance, fromXpiToSatoshis, getUtxoWif } from '@utils/cashMethods';
import { Avatar, Button, Image, Input, message, Popover, Skeleton, Space, Tooltip } from 'antd';
import { Header } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import { ChronikClient } from 'chronik-client';
import _, { isNil } from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import InfiniteScroll from 'react-infinite-scroll-component';
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
import { useForm, Controller } from 'react-hook-form';
import { openModal } from '@store/modal/actions';
import { EditPostModalProps } from './EditPostModalPopup';
import { ShareSocialButton } from '@components/Common/ShareSocialButton';
import Gallery from 'react-photo-gallery';

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
  <Space onClick={onClickIcon} style={{ alignItems: 'end', marginRight: '1rem', gap: '4px !important' }}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl, width: '28px', height: '28px' }, null)}
    <Counter num={burnValue ?? 0} />
  </Space>
);

type PostDetailProps = {
  post: PostItem;
  isMobile: boolean;
};

const PostDetail = ({ post, isMobile }: PostDetailProps) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue, setFocus } = useForm();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const refCommentsListing = useRef<HTMLDivElement | null>(null);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { burnXpi, sendXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);

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

  const imagesList = post.uploads.map(img => {
    const imgUrl = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT}/${img.upload.bucket}/${img.upload.sha}`;
    let width = parseInt(img?.upload?.width) || 4;
    let height = parseInt(img?.upload?.height) || 3;
    let objImg = {
      src: imgUrl,
      width: width,
      height: height
    };
    return objImg;
  });

  const [
    createCommentTrigger,
    { isLoading: isLoadingCreateComment, isSuccess: isSuccessCreateComment, isError: isErrorCreateComment }
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
      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: post.page ? post.pageAccount.address : post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        }
      ];

      if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
        tipToAddresses.push({
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        });
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);

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
        tipToAddresses
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
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
    .comment-item {
      text-align: left;
      border: 0 !important;
      .ant-comment-inner {
        padding: 16px 0 8px 0;
        .ant-comment-avatar {
          .ant-avatar {
            width: 37px !important;
            height: 37px !important;
          }
        }
      }
      .ant-comment-actions {
        margin-top: 4px;
      }
      .ant-comment-content-author-name {
        text-transform: capitalize;
      }
    }
  `;

  const CommentInputContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
    margin-top: 1rem;
    gap: 1rem;
    .ava-ico-cmt {
      .ant-avatar {
        width: 40px !important;
        height: 40px !important;
      }
    }
    .ant-input-affix-wrapper {
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
      input {
        font-size: 13px;
      }
    }
    .ant-input-group-addon {
      button {
        border-top-right-radius: 6px !important;
        border-bottom-right-radius: 6px !important;
      }
    }
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
    text-align: left;
    .description-post {
      margin: 1rem 0;
      text-align: left;
      word-break: break-word;
      a {
        cursor: pointer;
      }
    }
    .images-post {
      cursor: pointer;
      width: 100%;
      padding: 1rem;
      margin: 1rem 0;
      box-sizing: border-box;
      box-shadow: 0 3px 12px rgb(0 0 0 / 4%);
      background: var(--bg-color-light-theme);
      transition: 0.5s ease;
      img {
        max-width: 100%;
      }
    }
  `;

  const StyledContainerPostDetail = styled.div`
    width: 100%;
    border-radius: 5px;
    background: white;
    padding: 0rem 1rem 1rem 1rem;
    margin-top: 1rem;
    height: max-content;
    border-radius: 1rem;
    @media (max-width: 960px) {
      padding-bottom: 9rem;
    }
    header {
      padding: 0 !important;
      margin-bottom: 1rem;
      border-color: #c5c5c5;
    }
    .reaction-container {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border: 1px solid #c5c5c5;
      border-left: 0;
      border-right: 0;
      .ant-space {
        gap: 4px !important;
      }
      .reaction-func {
        color: rgba(30, 26, 29, 0.6);
        cursor: pointer;
        display: flex;
        gap: 1rem;
        img {
          width: 28px;
          height: 28px;
          margin-right: 4px;
        }
      }
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
  `;

  const ShareButton = styled.span`
    margin-left: 10px;
  `;

  const loadMoreComments = () => {
    if (hasNext && !isFetching) {
      fetchNext().finally(() => {
        setFocus('comment', { shouldSelect: true });
      });
    } else if (hasNext) {
      fetchNext().finally(() => {
        setFocus('comment', { shouldSelect: true });
      });
    }
  };

  const isNumeric = (num: string) => {
    num = num.replace(',', '.');
    return !isNaN(num as unknown as number) && Number(num) > 0;
  };

  const handleCreateNewComment = async (text: string) => {
    if (_.isNil(text) || _.isEmpty(text)) {
      return;
    }

    if (text !== '' || !_.isNil(text)) {
      let tipHex;
      if (text.trim().toLowerCase().split(' ')[0] === '/give') {
        try {
          if (!isNumeric(text.trim().split(' ')[1])) {
            const error = new Error(intl.get('send.syntaxError') as string);
            throw error;
          }

          const fundingWif = getUtxoWif(slpBalancesAndUtxos.nonSlpUtxos[0], walletPaths);
          tipHex = await sendXpi(
            XPI,
            chronik,
            walletPaths,
            slpBalancesAndUtxos.nonSlpUtxos,
            currency.defaultFee,
            text,
            false, // indicate send mode is one to one
            null,
            post.postAccount.address,
            text.trim().split(' ')[1],
            isEncryptedOptionalOpReturnMsg,
            fundingWif,
            true
          );
        } catch (e) {
          const message = e.message || e.error || JSON.stringify(e);
          dispatch(sendXPIFailure(message));
        }
      }

      const createCommentInput: CreateCommentInput = {
        commentText: text,
        commentToId: post.id,
        tipHex: tipHex
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

      setFocus('comment', { shouldSelect: true });
      setValue('comment', '');
    }
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
    <>
      <StyledContainerPostDetail>
        <NavBarHeader onClick={() => router.back()}>
          <LeftOutlined />
          <PathDirection>
            <h2>Post</h2>
          </PathDirection>
        </NavBarHeader>
        <InfoCardUser
          imgUrl={post.page ? post.page.avatar : ''}
          name={post.postAccount.name}
          title={moment(post.createdAt).fromNow().toString()}
          postAccountAddress={post.postAccount ? post.postAccount.address : undefined}
          page={post.page ? post.page : undefined}
          token={post.token ? post.token : undefined}
          activatePostLocation={true}
          onEditPostClick={editPost}
          postEdited={post.createdAt !== post.updatedAt}
        ></InfoCardUser>
        <PostContentDetail>
          <p className="description-post">{ReactHtmlParser(post.content)}</p>
          {post.uploads.length != 0 && (
            <div className="images-post">
              <Gallery photos={imagesList} />
            </div>
          )}
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
              <div>
                <img
                  src="/images/ico-comments.svg"
                  alt=""
                  onClick={() => setFocus('comment', { shouldSelect: true })}
                />
                <span>{totalCount}</span>&nbsp;
              </div>
              <div>
                <ShareSocialButton slug={post.id} />
              </div>
            </div>
          </div>
        </PostContentDetail>

        <CommentContainer>
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreComments}
            hasMore={hasNext}
            loader={<Skeleton avatar active />}
            scrollableTarget="scrollableDiv"
          >
            {data.map((item, index) => {
              return <CommentListItem index={index} item={item} post={post} key={item.id} />;
            })}
          </InfiniteScroll>
        </CommentContainer>
        <CommentInputContainer>
          <div className="ava-ico-cmt" onClick={() => router.push(`/profile/${selectedAccount.address}`)}>
            <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
          </div>
          <Controller
            name="comment"
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Search
                ref={ref}
                className="input-comment"
                placeholder={intl.get('comment.writeComment')}
                enterButton="Comment"
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                size="large"
                suffix={<DashOutlined />}
                onSearch={handleCreateNewComment}
                loading={isLoadingCreateComment}
              />
            )}
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
