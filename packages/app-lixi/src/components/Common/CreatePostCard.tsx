import { PlusCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getPostCoverUploads, getSelectedAccount } from '@store/account/selectors';
import { api as postApi, useCreatePostMutation } from '@store/post/posts.api';
import { CreatePostMutation } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { Button, Input, Modal } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { CreatePostInput, OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import styled from 'styled-components';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { Embed, SocialsEnum } from './Embed';
import EditorLexical from './Lexical/EditorLexical';
import { removeAllUpload } from '@store/account/actions';
import { AvatarUser } from './AvatarUser';
import { getEditorCache } from '@store/account/selectors';
import { deleteEditorTextFromCache } from '@store/account/actions';
import { getFilterPostsHome } from '@store/settings/selectors';

type ErrorType = 'unsupported' | 'invalid';

const regex = {
  [SocialsEnum.TWITTER]: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/,
  [SocialsEnum.FACEBOOK]:
    /^(?:https?:\/\/)?(?:www\.|m\.|mobile\.|touch\.|mbasic\.)?(?:facebook\.com|fb(?:\.me|\.com))\/(?!$)(?:(?:\w)*#!\/)?(?:pages\/)?(?:photo\.php\?fbid=)?(?:[\w\-]*\/)*?(?:\/)?(?:profile\.php\?id=)?([^\/?&\s]*)(?:\/|&|\?)?.*$/s,
  [SocialsEnum.REDDIT]: /(?:^.+?)(?:reddit.com)(\/r|\/user)(?:\/[\w\d]+){2}(?:\/)([\w\d]*)/
};

const MobileCreatePost = styled.div`
  display: none;
  @media (max-width: 968px) {
    z-index: 9;
    display: block;
    position: fixed;
    right: 15px;
    bottom: 90px;
    .fab-btn {
      padding: 16px;
      background: #ffdbd1;
      border-radius: 16px;
    }
  }
`;

const WrapEditor = styled.div`
  position: relative;
  z-index: -2;
`;

const DesktopCreatePost = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  background: #fff;
  border-radius: 20px;
  align-items: center;
  margin: 1rem 0;
  border: 1px solid var(--boder-item-light);
  .avatar {
    flex: 2 auto;
    display: flex;
    align-items: center;
    .ant-avatar {
      min-width: 50px;
    }
  }
  .btn-create {
    .anticon {
      font-size: 22px;
      color: #7342cc;
    }
  }
  input {
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0.5px;
  }
  @media (max-width: 968px) {
    display: none;
  }
`;

const UserCreate = styled.div`
  .user-create-post {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 24px;
    img {
      width: 48px;
      height: 48px;
    }
    .user-info {
      .title-user {
        margin: 0;
        font-weight: 500;
        text-transform: capitalize;
        line-height: 24px;
        letter-spacing: 0.15px;
        color: var(--text-color-on-background);
      }
      .btn-select {
        background: var(--boder-item-light);
        border-radius: 8px;
        padding: 0 8px;
        border: none;
        margin-top: 4px;
        span {
          font-weight: 400;
          font-size: 12px;
          line-height: 20px;
          letter-spacing: 0.25px;
          color: #4e444b;
          &.anticon {
            font-size: 10px;
          }
        }
      }
    }
  }
`;

type CreatePostCardProp = {
  pageId?: string;
  tokenPrimaryId?: string;
  userId?: string;
  refetch?: () => void;
};

const CreatePostCard = (props: CreatePostCardProp) => {
  const dispatch = useAppDispatch();
  const [enableEditor, setEnableEditor] = useState(false);
  const postCoverUploads = useAppSelector(getPostCoverUploads);
  const { pageId, tokenPrimaryId } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const editorCache = useAppSelector(getEditorCache);
  const filterValue = useAppSelector(getFilterPostsHome);

  const [
    createPostTrigger,
    { isLoading: isLoadingCreatePost, isSuccess: isSuccessCreatePost, isError: isErrorCreatePost }
  ] = useCreatePostMutation();

  const updatePost = (tag: string, params, result: CreatePostMutation, pageId?: string, tokenPrimaryId?: string) => {
    dispatch(
      postApi.util.updateQueryData('Posts', { ...params, minBurnFilter: filterValue }, draft => {
        draft.allPosts.edges.unshift({
          cursor: result.createPost.id,
          node: {
            ...result.createPost
          }
        });
        draft.allPosts.totalCount = draft.allPosts.totalCount + 1;
      })
    );
    switch (tag) {
      case 'PostsByPageId':
        return dispatch(
          postApi.util.updateQueryData('PostsByPageId', { ...params, id: pageId }, draft => {
            draft.allPostsByPageId.edges.unshift({
              cursor: result.createPost.id,
              node: {
                ...result.createPost
              }
            });
            draft.allPostsByPageId.totalCount = draft.allPostsByPageId.totalCount + 1;
          })
        );
      case 'PostsByTokenId':
        return dispatch(
          postApi.util.updateQueryData('PostsByTokenId', { ...params, id: tokenPrimaryId }, draft => {
            draft.allPostsByTokenId.edges.unshift({
              cursor: result.createPost.id,
              node: {
                ...result.createPost
              }
            });
            draft.allPostsByTokenId.totalCount = draft.allPostsByTokenId.totalCount + 1;
          })
        );
    }
  };

  const handleCreateNewPost = async ({ htmlContent, pureContent }) => {
    if (pureContent === '' || _.isNil(pureContent)) {
      return;
    }

    const createPostInput: CreatePostInput = {
      uploadCovers: postCoverUploads.map(upload => upload.id),
      htmlContent: htmlContent,
      pureContent: pureContent,
      pageId: pageId || undefined,
      tokenPrimaryId: tokenPrimaryId || undefined
    };

    const params = {
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    };
    let patches: PatchCollection;
    try {
      const result = await createPostTrigger({ input: createPostInput }).unwrap();
      let tag: string;

      if (_.isNil(pageId) && _.isNil(tokenPrimaryId)) {
        tag = PostsQueryTag.Posts;
      } else if (pageId) {
        tag = PostsQueryTag.PostsByPageId;
      } else if (tokenPrimaryId) {
        tag = PostsQueryTag.PostsByTokenId;
      }

      patches = updatePost(tag, params, result, pageId, tokenPrimaryId);
      dispatch(
        showToast('success', {
          message: 'Success',
          description: intl.get('post.createPostSuccessful'),
          duration: 5
        })
      );

      setEnableEditor(false);
      dispatch(removeAllUpload());
      dispatch(deleteEditorTextFromCache());
    } catch (error) {
      const message = intl.get('post.unableCreatePostServer');
      if (patches) {
        dispatch(postApi.util.patchQueryData('Posts', params, patches.inversePatches));
      }
      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }
  };

  return (
    <>
      <DesktopCreatePost onClick={() => setEnableEditor(!enableEditor)}>
        <div className="avatar">
          <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
          <Input bordered={false} placeholder="What's on your mind?" value="" />
        </div>
        <div className="btn-create">
          <PlusCircleOutlined />
        </div>
      </DesktopCreatePost>

      <MobileCreatePost onClick={() => setEnableEditor(!enableEditor)}>
        <div className="fab-btn">
          <img src="/images/ico-create-post.svg" alt="" />
        </div>
      </MobileCreatePost>

      <WrapEditor>
        <Modal
          className="custom-modal-editor"
          title="Create Post"
          open={enableEditor}
          footer={null}
          onCancel={() => setEnableEditor(false)}
        >
          <>
            <UserCreate>
              <div className="user-create-post">
                <img src="/images/xpi.svg" alt="" />
                <div className="user-info">
                  <p className="title-user">{selectedAccount?.name}</p>
                  <Button className="btn-select">
                    Public <GlobalOutlined />
                  </Button>
                </div>
              </div>
              <EditorLexical onSubmit={value => handleCreateNewPost(value)} loading={isLoadingCreatePost} />
            </UserCreate>
          </>
        </Modal>
      </WrapEditor>
    </>
  );
};

export default CreatePostCard;
