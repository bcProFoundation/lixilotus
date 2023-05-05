import {
  DashOutlined,
  DislikeFilled,
  DislikeOutlined,
  FireTwoTone,
  LeftOutlined,
  LikeFilled,
  LikeOutlined,
  LinkOutlined,
  ShareAltOutlined,
  UpOutlined
} from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnCommand, BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getSelectedAccount } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, burnForUpDownVote, createTxHex, clearFailQueue } from '@store/burn/actions';
import { api as commentsApi, useCreateCommentMutation } from '@store/comment/comments.api';
import { useInfiniteCommentsToPostIdQuery } from '@store/comment/useInfiniteCommentsToPostIdQuery';
import { PostsQuery } from '@store/post/posts.generated';
import { sendXPIFailure } from '@store/send/actions';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { formatBalance, fromSmallestDenomination, fromXpiToSatoshis, getUtxoWif } from '@utils/cashMethods';
import {
  Avatar,
  Button,
  Image,
  Input,
  message,
  notification,
  Popover,
  Skeleton,
  Space,
  Tooltip,
  AutoComplete
} from 'antd';
import { Header } from 'antd/lib/layout/layout';
import BigNumber from 'bignumber.js';
import { ChronikClient } from 'chronik-client';
import _, { debounce, isNil } from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@store/hooks';
import styled, { keyframes } from 'styled-components';
import CommentListItem, { CommentItem } from './CommentListItem';
import { useForm, Controller } from 'react-hook-form';
import { openModal } from '@store/modal/actions';
import { EditPostModalProps } from './EditPostModalPopup';
import { ShareSocialButton } from '@components/Common/ShareSocialButton';
import Gallery from 'react-photo-gallery';
import { setTransactionNotReady, setTransactionReady } from '@store/account/actions';
import { getTransactionStatus } from '@store/account/selectors';
import useDidMountEffect from '@hooks/useDidMountEffect ';
import { getBurnQueue, getFailQueue } from '@store/burn';
import { TokenItem } from '@components/Token/TokensFeed';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { getFilterPostsHome } from '@store/settings/selectors';

export type PostItem = PostsQuery['allPosts']['edges'][0]['node'];
export type BurnData = {
  data: PostItem | CommentItem | TokenItem;
  burnForType: BurnForType;
};

const { Search } = Input;

const StyledBurnIcon = styled.img`
  transition: all 0.2s ease-in-out;
  width: 28px;
  height: 28px;
  cursor: pointer;

  &:hover {
    transform: scale(1.2);
  }

  &:active {
    animation: jump 0.4s ease-in-out;
  }

  @keyframes jump {
    0% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
    70% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export const IconBurn = ({
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
  onClickIcon: (e: any) => void;
}) => (
  <Space onClick={onClickIcon} size={4} style={{ alignItems: 'end', marginRight: '1rem' }}>
    {icon && React.createElement(icon)}
    <Counter num={burnValue ?? 0} />
  </Space>
);

export const IconComment = ({
  icon,
  totalComments,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  totalComments?: number;
  dataItem: any;
  imgUrl?: string;
  onClickIcon: (e: any) => void;
  isComment?: boolean;
}) => (
  <Space onClick={onClickIcon} size={4} style={{ alignItems: 'end', marginRight: '1rem' }}>
    {icon && React.createElement(icon)}
    <picture>
      <StyledBurnIcon alt="burnIcon" src={imgUrl} />
    </picture>
    <Counter num={totalComments ?? 0} />
  </Space>
);

type PostDetailProps = {
  post: PostItem;
  isMobile: boolean;
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
    font-size: 16px;
    line-height: 24px;
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
      max-height: 100vh;
      object-fit: cover;
      @media (min-height: 920px) {
        max-height: 45vh;
      }
    }
  }
`;

const StyledContainerPostDetail = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
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

const PostDetail = ({ post, isMobile }: PostDetailProps) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue, setFocus } = useForm();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_LIXI_URL;
  const refCommentsListing = useRef<HTMLDivElement | null>(null);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction, sendXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const transactionStatus = useAppSelector(getTransactionStatus);
  const burnQueue = useAppSelector(getBurnQueue);
  const failQueue = useAppSelector(getFailQueue);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [imagesList, setImagesList] = useState([]);
  const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);
  const walletStatus = useAppSelector(getWalletStatus);
  const [open, setOpen] = useState(false);
  const filterValue = useAppSelector(getFilterPostsHome);

  const dataSource = ['/give'];

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

  useEffect(() => {
    const mapImages = post.uploads.map(img => {
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
    setImagesList(mapImages);
  }, []);

  const [
    createCommentTrigger,
    { isLoading: isLoadingCreateComment, isSuccess: isSuccessCreateComment, isError: isErrorCreateComment }
  ] = useCreateCommentMutation();

  const upVotePost = (dataItem: PostItem) => {
    handleBurn(true, { data: dataItem, burnForType: BurnForType.Post });
  };

  const downVotePost = (dataItem: PostItem) => {
    handleBurn(false, { data: dataItem, burnForType: BurnForType.Post });
  };

  const openBurnModal = (dataItem: PostItem) => {
    dispatch(openModal('BurnModal', { burnForType: BurnForType.Post, id: dataItem.id }));
  };

  const handleBurn = async (isUpVote: boolean, burnData: BurnData) => {
    try {
      const burnValue = '1';
      const { data, burnForType } = burnData;
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue)
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = data.id;
      let queryParams;

      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: post.page ? post.pageAccount.address : post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
        }
      ];

      switch (burnForType) {
        case BurnForType.Post:
          const post = data as PostItem;
          if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
            tipToAddresses.push({
              address: post.postAccount.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
            });
          }
          break;
        case BurnForType.Comment:
          const comment = data as CommentItem;
          if (burnType === BurnType.Up && selectedAccount.address != comment?.commentAccount?.address) {
            tipToAddresses.push({
              address: comment?.commentAccount?.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
            });
          }
          queryParams = {
            id: comment.commentToId,
            orderBy: {
              direction: OrderDirection.Asc,
              field: CommentOrderField.UpdatedAt
            }
          };
          break;
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: burnForType,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
        postQueryTag: PostsQueryTag.Post,
        queryParams: queryParams,
        minBurnFilter: filterValue
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = e.message || intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: errorMessage,
          duration: 3
        })
      );
    }
  };

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
    if (_.isNil(text) || _.isEmpty(text) || text === '/') {
      return;
    }

    if (open) return;

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

  const imageRenderer = useCallback(
    ({ photo }) => <Image src={photo?.src} width={photo?.width} height={photo?.height} />,
    []
  );

  useDidMountEffectNotification();

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
              <Gallery photos={imagesList} renderImage={imageRenderer} />
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
                onClickIcon={() => openBurnModal(post)}
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
              return <CommentListItem index={index} item={item} post={post} key={item.id} handleBurn={handleBurn} />;
            })}
          </InfiniteScroll>
        </CommentContainer>
        <CommentInputContainer>
          <div className="ava-ico-cmt" onClick={() => router.push(`/profile/${selectedAccount.address}`)}>
            <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
          </div>
          <Controller
            name="comment"
            key="comment"
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <AutoComplete
                onSelect={() => {
                  setOpen(false);
                }}
                dataSource={dataSource}
                open={open}
                onSearch={value => {
                  //TODO: This is not the best way to implement. Will come back later
                  if (/\d+$/.test(value) || value === '') {
                    setOpen(false);
                  } else if (value.startsWith('/')) {
                    setOpen(true);
                  }
                }}
                defaultActiveFirstOption
                getPopupContainer={trigger => trigger.parentElement}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                style={{ width: '-webkit-fill-available', textAlign: 'left' }}
              >
                <Search
                  ref={ref}
                  className="input-comment"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  placeholder={intl.get('comment.writeComment')}
                  enterButton="Comment"
                  size="large"
                  suffix={<DashOutlined />}
                  onSearch={handleCreateNewComment}
                  loading={isLoadingCreateComment}
                />
              </AutoComplete>
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
