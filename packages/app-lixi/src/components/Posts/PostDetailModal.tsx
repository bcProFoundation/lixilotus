import { DashOutlined, SendOutlined, DownloadOutlined, LeftOutlined, CloseOutlined } from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import AvatarUser from '@components/Common/AvatarUser';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { LoadingIcon, NavBarHeader } from '@components/Layout/MainLayout';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getAccountInfoTemp, getSelectedAccount } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue } from '@store/burn/actions';
import { api as commentsApi, useCreateCommentMutation } from '@store/comment/comments.api';
import { useInfiniteCommentsToPostIdQuery } from '@store/comment/useInfiniteCommentsToPostIdQuery';
import { PostQuery, useRepostMutation } from '@store/post/posts.generated';
import { sendXPIFailure } from '@store/send/actions';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis, getUtxoWif } from '@utils/cashMethods';
import { Image, Input, Skeleton, AutoComplete, Modal, Space, Button, Spin } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactHtmlParser from 'react-html-parser';
import InfiniteScroll from 'react-infinite-scroll-component';
import intl from 'react-intl-universal';
import { CommentOrderField, CreateCommentInput, OrderDirection, RepostInput } from '@generated/types.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import styled from 'styled-components';
import CommentListItem, { CommentItem } from './CommentListItem';
import { useForm, Controller } from 'react-hook-form';
import { closeModal, openModal } from '@store/modal/actions';
import { EditPostModalProps } from './EditPostModalPopup';
import Gallery from 'react-photo-gallery';
import { getBurnQueue, getFailQueue } from '@store/burn';
import { TokenItem } from '@components/Token/TokensFeed';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { getFilterPostsHome, getLevelFilter } from '@store/settings/selectors';
import { OPTION_BURN_VALUE } from '@bcpros/lixi-models/constants';
import parse from 'html-react-parser';
import ReactDomServer from 'react-dom/server';
import ActionPostBar from '@components/Common/ActionPostBar';
import PostTranslate from './PostTranslate';
import { useSwipeable } from 'react-swipeable';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import useDetectMobileView from '@local-hooks/useDetectMobileView';

export type PostItem = PostQuery['post'];
export type BurnData = {
  data: PostItem | CommentItem | TokenItem;
  burnForType: BurnForType;
};

type PostDetailProps = {
  post: PostItem;
  classStyle?: string;
};

const { Search, TextArea } = Input;

const CommentContainer = styled.div`
  padding: 0 1rem;
  .comment-item {
    text-align: left;
    border: 0 !important;
    .ant-comment-inner {
      padding: 16px 0 8px 0;
      .ant-comment-avatar {
        .ant-avatar {
          width: 37px !important;
          height: 37px !important;
          font-size: 14px;
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
  position: sticky;
  z-index: 999;
  bottom: -1px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 1rem;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  .ava-ico-cmt {
    padding-top: 1px;
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

const PostContentDetail = styled.div`
  padding: 0 1rem;
  text-align: left;
  .description-post {
    font-size: 17px;
    line-height: 24px;
    margin: 1rem 0;
    text-align: left;
    word-break: break-word;
    a {
      cursor: pointer;
    }
    div {
      max-width: 100%;
    }
    div[data-lexical-decorator] {
      display: flex;
      justify-content: center;
    }
    iframe {
      max-width: 100%;
      @media (max-width: 960px) {
        height: 35vh;
      }
    }
    .hashtag-link {
      color: var(--color-primary);
    }
  }
  .description-translate {
    line-height: 20px;
    text-align: left;
    word-break: break-word;
    border-left: var(--color-primary) 1px solid;
    padding: 3px 3px 3px 6px;
    margin-bottom: 1rem;
    p {
      font-size: 17px;
      line-height: 24px;
    }
    .read-more-more-module_btn__33IaH {
      font-size: 14px;
    }
  }
  .images-post {
    cursor: pointer;
    width: 100%;
    margin: 1rem 0;
    box-sizing: border-box;
    box-shadow: 0 3px 12px rgb(0 0 0 / 4%);
    background: var(--bg-color-light-theme);
    transition: 0.5s ease;
    img {
      max-width: 100%;
      max-height: 100vh;
      object-fit: contain;
      border-radius: var(--border-radius-primary);
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
      .ant-image {
        width: auto !important;
        height: auto !important;
      }
      img {
        width: auto;
        height: auto !important;
        max-width: 50vw;
        max-height: 60vh;
        object-fit: cover !important;
        border-radius: var(--border-radius-primary);
        border: 1px solid var(--lt-color-gray-100);
        @media (max-width: 468px) {
          max-width: 75vw;
          max-height: 50vh;
        }
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
    .react-photo-gallery--gallery > div {
      gap: 4px;
      background: #fff;
    }
  }
`;

const StyledContainerPostDetail = styled.div`
  margin: 0;
  width: 100%;
  border-radius: var(--border-radius-primary);
  background: white;
  height: fit-content;
  max-height: 92vh;
  overflow: auto;
  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.5);
    box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 968px) {
    max-height: 90vh;
  }

  @media (max-width: 520px) {
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
    -ms-overflow-style: none; // Internet Explorer 10+
    scrollbar-width: none; // Firefox
    ::-webkit-scrollbar {
      display: none; // Safari and Chrome
    }
  }

  header {
    position: sticky;
    height: fit-content;
    top: -1px;
    z-index: 999;
    padding: 0 !important;
    margin-bottom: 1rem;
    border-color: var(--border-color-base);
    background: #fff !important;
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
  .title-post-detail {
    width: 100%;
    text-align: center;
    padding: 1rem 8px;
    h2 {
      margin: 0;
      font-size: 26px;
      line-height: normal;
    }
  }
  .info-card-user {
    padding: 0 1rem !important;
    height: 72px;
    margin-left: 2rem;
    .anticon {
      font-size: 10px;
    }
  }
`;

const StyledTranslate = styled.div`
  cursor: pointer;
  color: var(--color-primary);
  text-align: left;
  margin-bottom: 5px;
  font-size: 12px;
`;

const StyledTextArea = styled(TextArea)`
  border: none;
`;

const StyledCommentContainer = styled.div`
  border: 1px solid var(--border-color-dark-base);
  border-radius: var(--border-radius-primary);
  width: 100%;
  padding: 5px 0px;
  display: flex;
  align-items: center;
`;

const StyledIconContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-right: 5px;
`;

export const PostDetailModal: React.FC<PostDetailProps> = ({ post, classStyle }: PostDetailProps) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue, setFocus, resetField } = useForm();
  const router = useRouter();
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction, sendXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const burnQueue = useAppSelector(getBurnQueue);
  const failQueue = useAppSelector(getFailQueue);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);
  const walletStatus = useAppSelector(getWalletStatus);
  const [open, setOpen] = useState(false);
  const filterValue = useAppSelector(getFilterPostsHome);
  const [showTranslation, setShowTranslation] = useState(false);
  const [openPost, setOpenPost] = useState(true);
  const isMobile = useDetectMobileView();
  const [borderColorHeader, setBorderColorHeader] = useState(false);
  const accountInfoTemp = useAppSelector(getAccountInfoTemp);
  const [isSendingXPI, setIsSendingXPI] = useState<boolean>(false);
  const level = useAppSelector(getLevelFilter);

  const [repostTrigger, { isLoading: isLoadingRepost, isSuccess: isSuccessRepost, isError: isErrorRepost }] =
    useRepostMutation();

  const dataSource = [
    {
      label: '/give',
      value: '/give'
    }
  ];

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

  const imagesList = useMemo(() => {
    let result = post?.uploads.map(img => {
      const imgUrl = `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${img.upload.cfImageId}/public`;
      let newImageObj = {
        src: imgUrl,
        width: img?.upload?.width || 4,
        height: img?.upload?.height || 3
      };
      return newImageObj;
    });
    return result || [];
  }, [post?.uploads]);

  const [
    createCommentTrigger,
    { isLoading: isLoadingCreateComment, isSuccess: isSuccessCreateComment, isError: isErrorCreateComment }
  ] = useCreateCommentMutation();

  const handleBurnForPost = async (isUpVote: boolean, post: any, optionBurn?: string) => {
    isUpVote
      ? handleBurn(true, { data: post, burnForType: BurnForType.Post }, optionBurn)
      : handleBurn(false, { data: post, burnForType: BurnForType.Post }, optionBurn);
  };

  const handleBurn = async (isUpVote: boolean, burnData: BurnData, optionBurn?: string) => {
    try {
      const burnValue = optionBurn ? OPTION_BURN_VALUE[optionBurn] : '1';
      const { data, burnForType } = burnData;
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = data.id;
      let queryParams;
      let postId: string;

      let tipToAddresses: { address: string; amount: string }[] = [];

      switch (burnForType) {
        case BurnForType.Post:
          const post = data as PostItem;
          tipToAddresses.push({
            address: post.page ? post.page.pageAccount.address : post.postAccount.address,
            amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
          });
          break;
        case BurnForType.Comment:
          const comment = data as CommentItem;
          const pageAddress = comment.commentTo.page ? comment.commentTo.page.pageAccount.address : undefined;
          const postAddress = comment.commentTo.postAccount.address;
          tipToAddresses.push({
            address: pageAddress ?? postAddress,
            amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
          });

          postId = comment.commentToId;
          queryParams = {
            direction: OrderDirection.Asc,
            field: CommentOrderField.UpdatedAt
          };
          break;
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);
      const totalTip = fromSmallestDenomination(
        tipToAddresses.reduce((total, item) => total + parseFloat(item.amount), 0)
      );
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue) + totalTip
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: burnForType,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
        extraArguments: {
          postQueryTag: PostsQueryTag.Post,
          postId: postId,
          orderBy: queryParams,
          minBurnFilter: filterValue,
          level: level
        }
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: intl.get('toast.error'),
          description: errorMessage,
          duration: 3
        })
      );
    }
  };

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    setIsSendingXPI(false);
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

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

    let tipHex;
    let createFeeHex;
    //Give XPI only to post account when there is no page and no fee
    if (
      text.trim().toLowerCase().split(' ')[0] === '/give' &&
      _.isNil(post.page) &&
      post.postAccount.createCommentFee === '0'
    ) {
      setIsSendingXPI(true);
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

    //Give XPI only to post account when there is no page and has fee
    if (_.isNil(post.page)) {
      if (selectedAccount.id != post.postAccount.id && post.postAccount.createCommentFee !== '0') {
        setIsSendingXPI(true);

        try {
          const fundingWif = getUtxoWif(slpBalancesAndUtxos.nonSlpUtxos[0], walletPaths);
          createFeeHex = await sendXpi(
            XPI,
            chronik,
            walletPaths,
            slpBalancesAndUtxos.nonSlpUtxos,
            currency.defaultFee,
            '',
            true, // indicate send mode is one to one
            [
              `${post.postAccount.address}, ${text.trim().split(' ')[1]}`,
              `${post.postAccount.address}, ${post.postAccount.createCommentFee}`
            ],
            undefined,
            undefined,
            isEncryptedOptionalOpReturnMsg,
            fundingWif,
            true
          );
        } catch (e) {
          const message = e.message || e.error || JSON.stringify(e);
          dispatch(sendXPIFailure(message));
        }
      }
    } else {
      //Give XPI only to post account when there is page and has fee
      if (selectedAccount.id != post.page.pageAccount.id && post.page.createCommentFee !== '0') {
        setIsSendingXPI(true);

        try {
          const fundingWif = getUtxoWif(slpBalancesAndUtxos.nonSlpUtxos[0], walletPaths);
          createFeeHex = await sendXpi(
            XPI,
            chronik,
            walletPaths,
            slpBalancesAndUtxos.nonSlpUtxos,
            currency.defaultFee,
            '',
            true, // indicate send mode is one to one
            [
              `${post.postAccount.address}, ${text.trim().split(' ')[1]}`,
              `${post.page.pageAccount.address}, ${post.page.createCommentFee}`
            ],
            undefined,
            undefined,
            isEncryptedOptionalOpReturnMsg,
            fundingWif,
            true
          );
        } catch (e) {
          const message = intl.get('account.insufficientFunds');
          dispatch(
            showToast('error', {
              message: intl.get('toast.error'),
              description: message,
              duration: 5
            })
          );
          return null;
        }
      }
    }

    const createCommentInput: CreateCommentInput = {
      commentText: text,
      commentToId: post.id,
      tipHex: tipHex,
      createFeeHex: createFeeHex
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
      setIsSendingXPI(false);
    }

    resetField('comment');
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

  const showTextComment = () => {
    if (post.page) {
      return post.page.createCommentFee != '0'
        ? intl.get('comment.writeCommentXpi', { commentFee: `${post.page.createCommentFee} ${currency.ticker}` })
        : intl.get('comment.writeCommentFree');
    } else if (post.postAccount.createCommentFee && _.isNil(post.page)) {
      return post.postAccount.createCommentFee != '0'
        ? intl.get('comment.writeCommentXpi', { commentFee: `${post.postAccount.createCommentFee} ${currency.ticker}` })
        : intl.get('comment.writeCommentFree');
    } else {
      return intl.get('comment.writeComment');
    }
  };

  const handleHashtagClick = e => {
    if (e.target.className === 'hashtag-link') {
      if (post.page) {
        router.push(`/page/${post.page.id}?q=&hashtags=%23${e.target.id.substring(1)}`);
      } else if (post.token) {
        router.push(`/token/${post.token.tokenId}?q=&hashtags=%23${e.target.id.substring(1)}`);
      } else {
        router.push(`/hashtag/${e.target.id.substring(1)}`);
      }
    }
  };

  const postContent: any = useMemo(() => {
    return parse(post?.content, {
      replace: (domNode: any) => {
        if (domNode?.attribs && domNode?.attribs?.class === 'EditorLexical_hashtag') {
          const hashtag: string = domNode?.children[0]?.data;
          return (
            <span
              rel="noopener noreferrer"
              className="hashtag-link"
              id={`${hashtag}`}
              style={{ color: 'var(--color-primary) !important', cursor: 'pointer' }}
            >
              {domNode.children.map(child => child.data)}
            </span>
          );
        }
      }
    });
  }, [post?.content]);

  const handleRepost = async (post: any) => {
    const repostInput: RepostInput = {
      accountId: selectedAccount.id,
      postId: post.id
    };

    try {
      await repostTrigger({ input: repostInput });
      isSuccessRepost &&
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('post.repostSuccessful'),
            duration: 5
          })
        );
    } catch (error) {
      dispatch(
        showToast('error', {
          message: 'Error',
          description: intl.get('post.repostFailure'),
          duration: 5
        })
      );
    }
  };

  const handleOnCancel = () => {
    setOpenPost(false);
    setTimeout(
      () => {
        dispatch(closeModal());
      },
      isMobile ? 400 : 200
    );
  };

  const translatePost = () => {
    setShowTranslation(!showTranslation);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default behavior of adding a new line
      await handleCreateNewComment(e.currentTarget.value); // Call your function to post the comment
    }
  };

  const handleSrcolling = e => {
    const currentScrollPos = e?.currentTarget?.scrollTop;
    if (currentScrollPos > 5) {
      setBorderColorHeader(true);
    } else {
      setBorderColorHeader(false);
    }
  };

  const handlersSwipe = useSwipeable({
    onSwipedRight: eventData => handleOnCancel()
  });

  return (
    <React.Fragment>
      <Modal
        transitionName={isMobile ? '' : 'none'}
        width={'50vw'}
        className={`${classStyle} post-detail-custom-modal ${
          isMobile
            ? openPost
              ? 'animate__animated animate__faster animate__slideInRight'
              : 'animate__animated animate__faster animate__slideOutRight'
            : openPost
            ? 'animate__animated animate__faster animate__zoomIn'
            : 'animate__animated animate__faster animate__zoomOut'
        }`}
        style={{ top: 30 }}
        open={true}
        onCancel={handleOnCancel}
        closeIcon={isMobile ? <LeftOutlined /> : <CloseOutlined />}
        footer={null}
      >
        <StyledContainerPostDetail
          {...handlersSwipe}
          className={`${!borderColorHeader ? 'no-border-color' : ''} post-detail-modal`}
          onScroll={e => handleSrcolling(e)}
        >
          <NavBarHeader onClick={handleOnCancel}>
            <InfoCardUser
              imgUrl={post.postAccount.avatar ? post.postAccount.avatar : ''}
              name={post.postAccount.name}
              title={moment(post.createdAt).fromNow().toString()}
              postAccountAddress={post.postAccount ? post.postAccount.address : undefined}
              page={post.page ? post.page : undefined}
              token={post.token ? post.token : undefined}
              activatePostLocation={true}
              onEditPostClick={editPost}
              postEdited={post.createdAt !== post.updatedAt}
            ></InfoCardUser>
          </NavBarHeader>
          <PostContentDetail>
            <div className="description-post" onClick={e => handleHashtagClick(e)}>
              {ReactHtmlParser(ReactDomServer.renderToStaticMarkup(postContent))}
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
            {post.uploads.length != 0 && isMobile && (
              <>
                {post.uploads.length > 1 && (
                  <div className="images-post images-post-mobile">
                    <PhotoProvider loop={true} loadingElement={<Spin indicator={LoadingIcon} />}>
                      {imagesList.map((img, index) => (
                        <PhotoView key={index} src={img.src}>
                          <img src={img.src} alt="" />
                        </PhotoView>
                      ))}
                    </PhotoProvider>
                  </div>
                )}
                {post.uploads.length === 1 && (
                  <>
                    <div className="images-post images-post-mobile only-one-image">
                      <PhotoProvider loop={true} loadingElement={<Spin indicator={LoadingIcon} />}>
                        {imagesList.map((img, index) => (
                          <PhotoView key={index} src={img.src}>
                            <img src={img.src} alt="" />
                          </PhotoView>
                        ))}
                      </PhotoProvider>
                    </div>
                  </>
                )}
              </>
            )}
            {post.uploads.length != 0 && !isMobile && (
              <div className={`images-post ${imagesList.length > 1 ? 'images-post-desktop' : ''}`}>
                <Image.PreviewGroup>
                  <Gallery margin={4} photos={imagesList} renderImage={imageRenderer} />
                </Image.PreviewGroup>
              </div>
            )}
            <ActionPostBar
              post={post}
              handleBurnForPost={handleBurnForPost}
              onClickIconComment={e => setFocus('comment', { shouldSelect: true })}
              isSetBorderBottom={true}
            />
          </PostContentDetail>

          <CommentContainer>
            <InfiniteScroll
              dataLength={data.length}
              next={loadMoreComments}
              hasMore={hasNext}
              loader={<Skeleton style={{ marginTop: '1rem' }} avatar active />}
              scrollableTarget="scrollableDiv"
            >
              {data.map((item, index) => {
                return <CommentListItem index={index} item={item} post={post} key={item.id} handleBurn={handleBurn} />;
              })}
            </InfiniteScroll>
          </CommentContainer>
          <CommentInputContainer className="comment-input-container">
            <div className="ava-ico-cmt" onClick={() => router.push(`/profile/${selectedAccount?.address}`)}>
              <AvatarUser icon={accountInfoTemp?.avatar} name={selectedAccount?.name} isMarginRight={false} />
            </div>
            <StyledCommentContainer className="comment-container">
              <Controller
                name="comment"
                key="comment"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <AutoComplete
                    onSelect={() => {
                      setOpen(false);
                    }}
                    options={dataSource}
                    open={open}
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
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
                    disabled={isLoadingCreateComment || isSendingXPI}
                    style={{ width: '-webkit-fill-available', textAlign: 'left' }}
                  >
                    <StyledTextArea
                      style={{ fontSize: '12px' }}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder={showTextComment()}
                      size="large"
                      autoSize
                      onKeyDown={handleKeyDown}
                    />
                  </AutoComplete>
                )}
              />
              <StyledIconContainer>
                <Button
                  type="text"
                  disabled={isLoadingCreateComment || isSendingXPI}
                  style={{ borderColor: 'transparent !important' }}
                  onClick={async () => {
                    await handleCreateNewComment(getValues('comment'));
                  }}
                  icon={<SendOutlined style={{ fontSize: '20px' }} />}
                />
              </StyledIconContainer>
            </StyledCommentContainer>
          </CommentInputContainer>
        </StyledContainerPostDetail>
      </Modal>
    </React.Fragment>
  );
};
