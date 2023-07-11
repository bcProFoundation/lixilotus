import { DashOutlined, LeftOutlined, SendOutlined } from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import ActionPostBar from '@components/Common/ActionPostBar';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { TokenItem } from '@components/Token/TokensFeed';
import { WalletContext } from '@context/walletProvider';
import { CommentOrderField, CreateCommentInput, OrderDirection, RepostInput } from '@generated/types.generated';
import useXPI from '@hooks/useXPI';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getSelectedAccount } from '@store/account/selectors';
import { getBurnQueue, getFailQueue } from '@store/burn';
import { addBurnQueue, addBurnTransaction, clearFailQueue } from '@store/burn/actions';
import { api as commentsApi, useCreateCommentMutation } from '@store/comment/comments.api';
import { useInfiniteCommentsToPostIdQuery } from '@store/comment/useInfiniteCommentsToPostIdQuery';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { PostsQuery, useRepostMutation } from '@store/post/posts.generated';
import { sendXPIFailure } from '@store/send/actions';
import { getFilterPostsHome } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis, getUtxoWif } from '@utils/cashMethods';
import { AutoComplete, Image, Input, Skeleton, Space } from 'antd';
import BigNumber from 'bignumber.js';
import parse from 'html-react-parser';
import _ from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDomServer from 'react-dom/server';
import { Controller, useForm } from 'react-hook-form';
import ReactHtmlParser from 'react-html-parser';
import InfiniteScroll from 'react-infinite-scroll-component';
import intl from 'react-intl-universal';
import Gallery from 'react-photo-gallery';
import styled from 'styled-components';
import CommentListItem, { CommentItem } from './CommentListItem';
import { EditPostModalProps } from './EditPostModalPopup';
import { OPTION_BURN_VALUE } from '@bcpros/lixi-models/constants';
import PostTranslate from './PostTranslate';

export type PostItem = PostsQuery['allPosts']['edges'][0]['node'];
export type BurnData = {
  data: PostItem | CommentItem | TokenItem;
  burnForType: BurnForType;
};

const { Search, TextArea } = Input;

const StyledBurnIcon = styled.img`
  transition: all 0.2s ease-in-out;
  width: 28px;
  height: 28px;
  cursor: pointer;

  &.custom-burn {
    width: 24px;
    height: 24px;
  }

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
    &nbsp;
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
  border-radius: var(--border-radius-primary);
  background: white;
  padding: 0rem 1rem 1rem 1rem;
  margin-top: 1rem;
  height: max-content;
  border-radius: 1rem;
  header {
    padding: 0 !important;
    margin-bottom: 1rem;
    border-color: var(--border-color-base);
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
  border: 1px solid black;
  border-radius: var(--border-radius-primary);
  width: 100%;
  padding: 0px 0px 10px 0px;
`;

const StyledIconContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-right: 5px;
`;

export const IconBurn = ({
  icon,
  burnValue,
  dataItem,
  imgUrl,
  classStyle,
  onClickIcon
}: {
  icon?: React.FC;
  burnValue?: number;
  dataItem: any;
  imgUrl?: string;
  classStyle?: string;
  onClickIcon: (e: any) => void;
}) => (
  <Space onClick={onClickIcon} size={5} style={{ alignItems: 'end', marginRight: '1rem' }}>
    {icon && React.createElement(icon)}
    {imgUrl && (
      <picture>
        <StyledBurnIcon className={classStyle} alt="burnIcon" src={imgUrl} />
      </picture>
    )}
    {burnValue && <Counter num={burnValue ?? 0} />}
  </Space>
);

const PostDetail = ({ post, isMobile }: PostDetailProps) => {
  const dispatch = useAppDispatch();
  const { control, getValues, setValue, setFocus } = useForm();
  const router = useRouter();
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction, sendXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const burnQueue = useAppSelector(getBurnQueue);
  const failQueue = useAppSelector(getFailQueue);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [imagesList, setImagesList] = useState([]);
  const [isEncryptedOptionalOpReturnMsg, setIsEncryptedOptionalOpReturnMsg] = useState(true);
  const walletStatus = useAppSelector(getWalletStatus);
  const [open, setOpen] = useState(false);
  const filterValue = useAppSelector(getFilterPostsHome);
  const [showTranslation, setShowTranslation] = useState(false);

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

  useEffect(() => {
    const mapImages = post.uploads.map(img => {
      const imgUrl = `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${img.upload.cfImageId}/public`;
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
      let createFeeHex;
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

      if (post.page) {
        if (selectedAccount.id != parseInt(post.page.pageAccount.id) && post.page.createCommentFee != '0') {
          try {
            const fundingWif = getUtxoWif(slpBalancesAndUtxos.nonSlpUtxos[0], walletPaths);
            createFeeHex = await sendXpi(
              XPI,
              chronik,
              walletPaths,
              slpBalancesAndUtxos.nonSlpUtxos,
              currency.defaultFee,
              '',
              false, // indicate send mode is one to one
              null,
              post.page.pageAccount.address,
              post.page.createCommentFee,
              isEncryptedOptionalOpReturnMsg,
              fundingWif,
              true
            );
          } catch (e) {
            const message = e.message || e.error || JSON.stringify(e);
            dispatch(sendXPIFailure(message));
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

  const showTextComment = () => {
    if (post.page) {
      return post.page.createCommentFee != '0'
        ? intl.get('comment.writeCommentXpi', { commentFee: `${post.page.createCommentFee} ${currency.ticker}` })
        : intl.get('comment.writeCommentFree');
    } else {
      return intl.get('comment.writeComment');
    }
  };

  useDidMountEffectNotification();

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

  const content: any = parse(post.content, {
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.attribs.class === 'EditorLexical_hashtag') {
        const hashtag: string = domNode.children[0].data;
        return (
          <span
            rel="noopener noreferrer"
            className="hashtag-link"
            id={`${hashtag}`}
            style={{ color: 'var(--color-primary)', cursor: 'pointer' }}
          >
            {domNode.children.map(child => child.data)}
          </span>
        );
      }
    }
  });

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

  const translatePost = () => {
    setShowTranslation(!showTranslation);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default behavior of adding a new line
      await handleCreateNewComment(e.currentTarget.value); // Call your function to post the comment
    }
  };

  return (
    <>
      <StyledContainerPostDetail className="post-detail">
        <NavBarHeader onClick={() => router.back()}>
          <LeftOutlined />
          <PathDirection>
            <h2>{intl.get('post.postTitle')}</h2>
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
          <div className="description-post" onClick={e => handleHashtagClick(e)}>
            {ReactHtmlParser(ReactDomServer.renderToStaticMarkup(content))}
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
          {post.uploads.length != 0 && (
            <div className="images-post">
              <Image.PreviewGroup>
                <Gallery photos={imagesList} renderImage={imageRenderer} />
              </Image.PreviewGroup>
            </div>
          )}
          <ActionPostBar
            post={post}
            handleBurnForPost={handleBurnForPost}
            onClickIconComment={e => setFocus('comment', { shouldSelect: true })}
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
        <CommentInputContainer>
          <div className="ava-ico-cmt" onClick={() => router.push(`/profile/${selectedAccount.address}`)}>
            <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
          </div>
          <StyledCommentContainer>
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
                  disabled={isLoadingCreateComment}
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
              <SendOutlined style={{ fontSize: '20px' }} onClick={() => handleCreateNewComment(getValues('comment'))} />
            </StyledIconContainer>
          </StyledCommentContainer>
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
