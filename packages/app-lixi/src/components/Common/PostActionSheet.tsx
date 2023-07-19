import { Button, Drawer } from 'antd';
import type { DrawerProps, RadioChangeEvent } from 'antd';
import React, { useState, useEffect } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { closeActionSheet } from '@store/action-sheet/actions';
import { EditPostModalProps } from '@components/Posts/EditPostModalPopup';
import { openModal } from '@store/modal/actions';
import { CreateFollowPageInput, DeleteFollowPageInput } from '@bcpros/lixi-models';
import {
  useCheckIfFollowPageQuery,
  useCreateFollowPageMutation,
  useDeleteFollowPageMutation
} from '@store/follow/follows.generated';
import { getSelectedAccountId } from '@store/account';
import { usePageQuery } from '@store/page/pages.generated';
import { useCreateFollowAccountMutation, useDeleteFollowAccountMutation } from '@store/follow/follows.api';
import { CreateFollowAccountInput, DeleteFollowAccountInput } from '@generated/types.generated';

interface PostActionSheetProps {
  id?: string;
  classStyle?: string;
  isEditPost?: boolean;
  post?: any;
  page?: any;
  followPostOwner?: boolean;
  followedPage?: boolean;
}

export const ItemActionSheetBottom = ({
  icon,
  type,
  text,
  onClickItem
}: {
  icon?: string;
  type?: string;
  text?: string;
  onClickItem?: () => void;
}) => {
  return (
    <ItemActionSheet className="item-action-sheet" onClick={onClickItem}>
      <span style={{ color: type === 'danger' ? 'var(--color-danger)' : '' }} className="text-action-sheet">
        {text}
      </span>
      {icon && <img className="img-action-sheet-item" src={icon} />}
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
  }
`;

export const PostActionSheet: React.FC<PostActionSheetProps> = ({
  classStyle,
  isEditPost,
  post,
  page,
  followPostOwner,
  followedPage
}: PostActionSheetProps) => {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(true);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [isFollowed, setIsFollowed] = useState<boolean>(false);

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

  useEffect(() => {
    if (isSuccessCreateFollowPage) setIsFollowed(true);
  }, [isSuccessCreateFollowPage]);

  useEffect(() => {
    if (isSuccessDeleteFollowPage) setIsFollowed(false);
  }, [isSuccessDeleteFollowPage]);

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

    await createFollowPageTrigger({ input: createFollowPageInput });
  };

  const handleUnfollowPage = async () => {
    const deleteFollowPageInput: DeleteFollowPageInput = {
      accountId: selectedAccountId,
      pageId: page?.id
    };

    await deleteFollowPageTrigger({ input: deleteFollowPageInput });
  };

  const handleFollowAccount = async () => {
    const createFollowAccountInput: CreateFollowAccountInput = {
      followingAccountId: parseInt(post.postAccount.id),
      followerAccountId: selectedAccountId
    };

    await createFollowAccountTrigger({ input: createFollowAccountInput });
  };

  const handleUnfollowAccount = async () => {
    const deleteFollowAccountInput: DeleteFollowAccountInput = {
      followingAccountId: parseInt(post.postAccount.id),
      followerAccountId: selectedAccountId
    };

    await deleteFollowAccountTrigger({ input: deleteFollowAccountInput });
  };

  return (
    <>
      <Drawer
        className={`${classStyle} action-sheet-bottom`}
        placement={'bottom'}
        closable={false}
        onClose={onClose}
        open={open}
        height={'fit-content'}
      >
        <ContainerActionSheet>
          <div className="bar-close" onClick={onClose}></div>
          {isEditPost && <ItemActionSheetBottom text="Edit post" icon="/images/ico-edit.svg" onClickItem={editPost} />}
          {/* <ItemActionSheetBottom type="danger" text="Remove" /> */}
          {post.page && followedPage && (
            <ItemActionSheetBottom
              text={`${intl.get('general.follow')} ${page?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleFollowPage}
            />
          )}
          {post.page && !followedPage && (
            <ItemActionSheetBottom
              text={`${intl.get('general.unfollow')} ${page?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleUnfollowPage}
            />
          )}
          {post.postAccount.id != selectedAccountId && followPostOwner && (
            <ItemActionSheetBottom
              text={`${intl.get('general.follow')} ${post.postAccount?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleFollowAccount}
            />
          )}
          {post.postAccount.id != selectedAccountId && !followPostOwner && (
            <ItemActionSheetBottom
              text={`${intl.get('general.unfollow')} ${post.postAccount?.name}`}
              icon="/images/follow.svg"
              onClickItem={handleUnfollowAccount}
            />
          )}
        </ContainerActionSheet>
      </Drawer>
    </>
  );
};
