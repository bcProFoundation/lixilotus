import { Button, Drawer } from 'antd';
import type { DrawerProps, RadioChangeEvent } from 'antd';
import React, { useState, useEffect } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { closeActionSheet } from '@store/action-sheet/actions';
import { EditPostModalProps } from '@components/Posts/EditPostModalPopup';
import { openModal } from '@store/modal/actions';
import {
  CreateFollowPageInput,
  CreateFollowTokenInput,
  DeleteFollowPageInput,
  DeleteFollowTokenInput,
  ExtraArgumentsPostFollow,
  ParamPostFollowCommand
} from '@bcpros/lixi-models';
import { getSelectedAccount, getSelectedAccountId } from '@store/account';
import { usePageQuery } from '@store/page/pages.generated';
import {
  useCreateFollowAccountMutation,
  useCreateFollowPageMutation,
  useCreateFollowTokenMutation,
  useDeleteFollowAccountMutation,
  useDeleteFollowPageMutation,
  useDeleteFollowTokenMutation
} from '@store/follow/follows.api';
import { CreateFollowAccountInput, DeleteFollowAccountInput } from '@generated/types.generated';
import { getWalletStatus } from '@store/wallet';
import { useSwipeable } from 'react-swipeable';
import { useUserHadMessageToPageQuery } from '@store/message/pageMessageSession.generated';
import CreatePostCard from './CreatePostCard';
import {
  getFilterPostsHome,
  getFilterPostsPage,
  getFilterPostsProfile,
  getFilterPostsToken,
  getLevelFilter
} from '@store/settings';
import { changeFollowActionSheetPost } from '@store/post/actions';
import { FollowForType } from '@bcpros/lixi-models/lib/follow/follow.model';
import { useRouter } from 'next/router';

interface PostActionSheetProps {
  id?: string;
  classStyle?: string;
  isEditPost?: boolean;
  post?: any;
  page?: any;
  token?: any;
  followPostOwner?: boolean;
  followedPage?: boolean;
  followedToken?: boolean;
}

export const ItemActionSheetBottom = ({
  icon,
  type,
  text,
  className,
  onClickItem
}: {
  icon?: string;
  type?: string;
  text?: string;
  className?: string;
  onClickItem?: () => void;
}) => {
  return (
    <ItemActionSheet className="item-action-sheet" onClick={onClickItem}>
      <span style={{ color: type === 'danger' ? 'var(--color-danger)' : '' }} className="text-action-sheet">
        {text}
      </span>
      {icon && <img className={`img-action-sheet-item ${className}`} src={icon} />}
    </ItemActionSheet>
  );
};

export const ContainerActionSheet = styled.div`
  padding: 0.5rem 1rem 2rem 1rem;
  .bar-close {
    padding: 2px;
    width: 50px;
    height: 1px;
    border-radius: 8px;
    margin: auto;
    margin-bottom: 1rem;
    cursor: pointer;
  }
`;

export const ItemActionSheet = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-color-light-theme);
  cursor: pointer;
  border-radius: var(--border-radius-item);
  margin-bottom: 1rem;
  @media (max-height: 960px) {
    padding: 1rem;
  }
  .text-action-sheet {
    font-weight: 600;
  }
  .img-action-sheet-item {
    width: 17px;
    height: 17px;
    filter: var(--filter-svg-gray-color);

    &.isFollowed {
      filter: var(--filter-color-primary) !important;
    }
  }
`;

export const PostActionSheet: React.FC<PostActionSheetProps> = ({
  classStyle,
  isEditPost,
  post,
  page,
  token,
  followedPage,
  followPostOwner,
  followedToken
}: PostActionSheetProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [isFollowedPage, setIsFollowedPage] = useState<boolean>(followedPage);
  const [isFollowedToken, setIsFollowedToken] = useState<boolean>(followedToken);
  const [isFollowedAccount, setIsFollowedAccount] = useState<boolean>(followPostOwner);
  const [openCreatePost, setOpenCreatePost] = useState<boolean>(false);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const walletStatus = useAppSelector(getWalletStatus);
  const level = useAppSelector(getLevelFilter);
  const filterValuePage = useAppSelector(getFilterPostsPage);
  const filterValueToken = useAppSelector(getFilterPostsToken);
  const filterValueProfile = useAppSelector(getFilterPostsProfile);
  const filterValueHome = useAppSelector(getFilterPostsHome);
  const [query, setQuery] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);

  useEffect(() => {
    if (router.query.hashtags) {
      setHashtags((router.query.hashtags as string).split(' '));
    } else {
      setHashtags([]);
    }
  }, [router.query.hashtags]);

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q as string);
    } else {
      setQuery(null);
    }
  }, [router.query.q]);

  const extraArgumentsPostFollow: ExtraArgumentsPostFollow = {
    minBurnFilterPage: filterValuePage,
    minBurnFilterToken: filterValueToken,
    minBurnFilterProfile: filterValueProfile,
    minBurnFilterHome: filterValueHome,
    level: level,
    pageId: post?.page?.id,
    tokenId: post?.token?.tokenId,
    postAccountId: post.postAccount.id,
    tokenPrimaryId: post?.token?.id,
    hashtags: hashtags,
    query: query
  };

  const payloadFollowPage: ParamPostFollowCommand = {
    changeFollow: isFollowedPage,
    followForType: FollowForType.Page,
    extraArgumentsPostFollow
  };

  const payloadFollowToken: ParamPostFollowCommand = {
    changeFollow: isFollowedToken,
    followForType: FollowForType.Token,
    extraArgumentsPostFollow
  };

  const payloadFollowAccount: ParamPostFollowCommand = {
    changeFollow: isFollowedAccount,
    followForType: FollowForType.Account,
    extraArgumentsPostFollow
  };

  const [
    createFollowPageTrigger,
    {
      isLoading: isLoadingCreateFollowPage,
      isSuccess: isSuccessCreateFollowPage,
      isError: isErrorCreateFollowPage,
      error: errorOnCreatePage
    }
  ] = useCreateFollowPageMutation();

  const [
    deleteFollowPageTrigger,
    {
      isLoading: isLoadingDeleteFollowPage,
      isSuccess: isSuccessDeleteFollowPage,
      isError: isErrorDeleteFollowPage,
      error: errorOnDeletePage
    }
  ] = useDeleteFollowPageMutation();

  const [
    createFollowAccountTrigger,
    {
      isLoading: isLoadingCreateFollowAccount,
      isSuccess: isSuccessCreateFollowAccount,
      isError: isErrorCreateFollowAccount,
      error: errorOnCreateAccount
    }
  ] = useCreateFollowAccountMutation();

  const [
    deleteFollowAccountTrigger,
    {
      isLoading: isLoadingDeleteFollowAccount,
      isSuccess: isSuccessDeleteFollowAccount,
      isError: isErrorDeleteFollowAccount,
      error: errorOnDeleteAccount
    }
  ] = useDeleteFollowAccountMutation();

  const [
    createFollowTokenTrigger,
    {
      isLoading: isLoadingCreateFollowToken,
      isSuccess: isSuccessCreateFollowToken,
      isError: isErrorCreateFollowToken,
      error: errorOnCreateToken
    }
  ] = useCreateFollowTokenMutation();

  const [
    deleteFollowTokenTrigger,
    {
      isLoading: isLoadingDeleteFollowToken,
      isSuccess: isSuccessDeleteFollowToken,
      isError: isErrorDeleteFollowToken,
      error: errorOnDeleteToken
    }
  ] = useDeleteFollowTokenMutation();

  const { data: pageMessageSessionData, refetch: pageMessageSessionRefetch } = useUserHadMessageToPageQuery(
    {
      accountId: selectedAccount?.id,
      pageId: page?.id
    },
    { skip: selectedAccount?.id === page?.pageAccountId || !selectedAccount?.id }
  );

  const { currentData: currentDataPageQuery, isSuccess: isSuccessPageQuery } = usePageQuery({ id: post?.page?.id });

  const onClose = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(closeActionSheet());
    }, 500);
  };

  const editPost = () => {
    const editPostProps: EditPostModalProps = {
      postAccountAddress: post.postAccount.address,
      content: post.content,
      postId: post.id
    };
    dispatch(openModal('EditPostModalPopup', editPostProps));
    dispatch(closeActionSheet());
  };

  const handleFollowPage = async () => {
    const createFollowPageInput: CreateFollowPageInput = {
      accountId: selectedAccountId,
      pageId: page?.id
    };
    setIsFollowedPage(!isFollowedPage);
    await createFollowPageTrigger({ input: createFollowPageInput });

    dispatch(changeFollowActionSheetPost(payloadFollowPage));
  };

  const handleUnfollowPage = async () => {
    const deleteFollowPageInput: DeleteFollowPageInput = {
      accountId: selectedAccountId,
      pageId: page?.id
    };
    setIsFollowedPage(!isFollowedPage);
    await deleteFollowPageTrigger({ input: deleteFollowPageInput });

    dispatch(changeFollowActionSheetPost(payloadFollowPage));
  };

  const handleFollowAccount = async () => {
    const createFollowAccountInput: CreateFollowAccountInput = {
      followingAccountId: parseInt(post.postAccount.id),
      followerAccountId: selectedAccountId
    };
    setIsFollowedAccount(!isFollowedAccount);
    await createFollowAccountTrigger({ input: createFollowAccountInput });

    dispatch(changeFollowActionSheetPost(payloadFollowAccount));
  };

  const handleUnfollowAccount = async () => {
    const deleteFollowAccountInput: DeleteFollowAccountInput = {
      followingAccountId: parseInt(post.postAccount.id),
      followerAccountId: selectedAccountId
    };
    setIsFollowedAccount(!isFollowedAccount);
    await deleteFollowAccountTrigger({ input: deleteFollowAccountInput });

    dispatch(changeFollowActionSheetPost(payloadFollowAccount));
  };

  const handleFollowToken = async () => {
    const createFollowTokenInput: CreateFollowTokenInput = {
      accountId: selectedAccountId,
      tokenId: token.tokenId
    };
    setIsFollowedToken(!isFollowedToken);
    await createFollowTokenTrigger({ input: createFollowTokenInput });

    dispatch(changeFollowActionSheetPost(payloadFollowToken));
  };

  const handleUnfollowToken = async () => {
    const deleteFollowTokenInput: DeleteFollowTokenInput = {
      accountId: selectedAccountId,
      tokenId: token.tokenId
    };
    setIsFollowedToken(!isFollowedToken);
    await deleteFollowTokenTrigger({ input: deleteFollowTokenInput });

    dispatch(changeFollowActionSheetPost(payloadFollowToken));
  };

  const openPageMessageLixiModal = () => {
    dispatch(openModal('PageMessageLixiModal', { account: selectedAccount, page: page, wallet: walletStatus }));
  };

  const handlersSwipe = useSwipeable({
    onSwipedDown: eventData => onClose()
  });

  const openCreatePostPage = () => {
    setOpenCreatePost(true);
  };

  return (
    <>
      <Drawer
        className={`${classStyle} action-sheet-bottom`}
        placement={'bottom'}
        closable={false}
        onClose={onClose}
        open={open}
        height={'auto'}
      >
        <ContainerActionSheet {...handlersSwipe}>
          <div hidden={true}>
            {openCreatePost && <CreatePostCard page={page} hashtags={[]} query={''} autoEnable={true} />}
          </div>
          <div className="bar-close" onClick={onClose}></div>
          {isEditPost && <ItemActionSheetBottom text="Edit post" icon="/images/ico-edit.svg" onClickItem={editPost} />}
          {/* <ItemActionSheetBottom type="danger" text="Remove" /> */}
          {post.page && isSuccessPageQuery && (
            <>
              <ItemActionSheetBottom
                text={`${intl.get('page.createPostFeeOn')} ${currentDataPageQuery?.page?.name}`}
                icon="/images/ico-create-post.svg"
                onClickItem={openCreatePostPage}
              />
            </>
          )}
          {post.page && post.postAccount.id != selectedAccountId && !pageMessageSessionData && (
            <ItemActionSheetBottom
              text={`${intl.get('messenger.chat')} ${page?.name}`}
              icon="/images/ico-message-heart-circle.svg"
              onClickItem={openPageMessageLixiModal}
            />
          )}
          {post.page && !isFollowedPage && (
            <ItemActionSheetBottom
              text={`${intl.get('general.follow')} ${page?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleFollowPage}
            />
          )}
          {post.page && isFollowedPage && (
            <ItemActionSheetBottom
              text={`${intl.get('general.unfollow')} ${page?.name}`}
              icon="/images/follow.svg"
              className={isFollowedPage ? 'isFollowed' : ''}
              onClickItem={handleUnfollowPage}
            />
          )}
          {post.postAccount.id != selectedAccountId && !isFollowedAccount && (
            <ItemActionSheetBottom
              text={`${intl.get('general.follow')} ${post.postAccount?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleFollowAccount}
            />
          )}
          {post.postAccount.id != selectedAccountId && isFollowedAccount && (
            <ItemActionSheetBottom
              text={`${intl.get('general.unfollow')} ${post.postAccount?.name}`}
              icon="/images/follow.svg"
              className={isFollowedAccount ? 'isFollowed' : ''}
              onClickItem={handleUnfollowAccount}
            />
          )}
          {post.token && !isFollowedToken && (
            <ItemActionSheetBottom
              text={`${intl.get('general.follow')} ${token?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleFollowToken}
            />
          )}
          {post.token && isFollowedToken && (
            <ItemActionSheetBottom
              text={`${intl.get('general.unfollow')} ${token?.name}`}
              icon="/images/follow.svg"
              className={isFollowedToken ? 'isFollowed' : ''}
              onClickItem={handleUnfollowToken}
            />
          )}
        </ContainerActionSheet>
      </Drawer>
    </>
  );
};
