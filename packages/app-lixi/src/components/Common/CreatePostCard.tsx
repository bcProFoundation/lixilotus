import useXPI from '@hooks/useXPI';
import { WalletContext } from '@context/walletProvider';
import { PlusCircleOutlined, GlobalOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getPostCoverUploads, getSelectedAccount } from '@store/account/selectors';
import { api as postApi, useCreatePostMutation } from '@store/post/posts.api';
import { CreatePostMutation } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { Button, Input, Modal, Space } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { CreatePostInput, OrderDirection, PostOrderField } from '@generated/types.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import styled from 'styled-components';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { Embed, SocialsEnum } from './Embed';
import EditorLexical from './Lexical/EditorLexical';
import { removeAllUpload } from '@store/account/actions';
import { AvatarUser } from './AvatarUser';
import { getEditorCache } from '@store/account/selectors';
import { deleteEditorTextFromCache } from '@store/account/actions';
import { getFilterPostsHome, getFilterPostsPage, getFilterPostsToken } from '@store/settings/selectors';
import router from 'next/router';
import { Page } from '@bcpros/lixi-models';
import { currency } from './Ticker';
import { getUtxoWif } from '@utils/cashMethods';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { PageItem } from '@components/Pages/PageDetail';

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
      border-radius: var(--border-radius-primary);
    }
  }
`;

const WrapEditor = styled.div`
  position: relative;
  z-index: -2;
`;

const DesktopCreatePost = styled.div`
  padding: 1.5rem 1rem;
  background: #fff;
  border-radius: var(--border-radius-primary);
  margin: 1rem 0;
  border: 1px solid var(--border-item-light);
  box-shadow: 1rem 1rem 2.5rem 0 rgb(0 0 0 / 5%);
  cursor: pointer;
  .box-create-post {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .avatar {
      flex: 2 auto;
      display: flex;
      align-items: center;
      input {
        font-size: 11px;
        line-height: 24px;
        letter-spacing: 0.3px;
      }
      .ant-avatar {
        min-width: 46px;
      }
    }
    .btn-create {
      .anticon {
        font-size: 18px;
        color: var(--color-primary);
      }
    }
  }
  .functional-images-bar {
    display: flex;
    margin-top: 1rem;
    border-top: 1px solid var(--border-color-base);
    padding-top: 1rem;
    gap: 8px;
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
      .location-fee {
        display: flex;
        align-items: baseline;
      }
      .btn-select {
        background: var(--border-color-base);
        border-radius: var(--border-radius-primary);
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
      .post-fee {
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: #4e444b;
        padding-left: 5px;
        &.anticon {
          font-size: 10px;
        }
      }
    }
  }
`;

const SpaceIconNoneHover = styled(Space)`
  gap: 8px;
  padding: 6px;
  background: #faf0fa;
  color: var(--color-primary);
  border-radius: var(--border-radius-primary);
  img {
    width: 25px;
  }
  span {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.3px;
  }
`;

type CreatePostCardProp = {
  page?: PageItem;
  tokenPrimaryId?: string;
  userId?: string;
  refetch?: () => void;
  hashtags?: string[]; //Multiple hashtag for search function
  hashtagId?: string; // hashtagId here for the url /hashtag/{hashtag}
  query?: string;
};

const IconWImage = ({
  value,
  imgUrl,
  onClickIcon
}: {
  value?: string;
  imgUrl?: string;
  onClickIcon: (e: any) => void;
}) => (
  <SpaceIconNoneHover onClick={onClickIcon} size={5}>
    {imgUrl && (
      <picture>
        <img alt="icon" src={imgUrl} />
      </picture>
    )}
    <span>{value}</span>
  </SpaceIconNoneHover>
);

const CreatePostCard = (props: CreatePostCardProp) => {
  const dispatch = useAppDispatch();
  const pathname = router.pathname ?? '';
  const [enableEditor, setEnableEditor] = useState(false);
  const postCoverUploads = useAppSelector(getPostCoverUploads);
  const { page, tokenPrimaryId, hashtagId, hashtags, query } = props;
  const pageId = page ? page.id : undefined;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const editorCache = useAppSelector(getEditorCache);
  const filterHome = useAppSelector(getFilterPostsHome);
  const filterPage = useAppSelector(getFilterPostsPage);
  const filterToken = useAppSelector(getFilterPostsToken);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { sendXpi } = useXPI();

  const [
    createPostTrigger,
    { isLoading: isLoadingCreatePost, isSuccess: isSuccessCreatePost, isError: isErrorCreatePost }
  ] = useCreatePostMutation();

  const updatePost = (
    tag: string,
    params,
    filterValue: number,
    result: CreatePostMutation,
    pageId?: string,
    tokenPrimaryId?: string,
    hashtagId?: string
  ) => {
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
    dispatch(
      postApi.util.updateQueryData(
        'PostsByHashtagId',
        { ...params, minBurnFilter: filterValue, id: hashtagId },
        draft => {
          draft.allPostsByHashtagId.edges.unshift({
            cursor: result.createPost.id,
            node: {
              ...result.createPost
            }
          });
          draft.allPostsByHashtagId.totalCount = draft.allPostsByHashtagId.totalCount + 1;
        }
      )
    );
    dispatch(
      postApi.util.updateQueryData(
        'PostsBySearchWithHashtag',
        { ...params, minBurnFilter: filterValue, query: query, hashtags: hashtags },
        draft => {
          draft.allPostsBySearchWithHashtag.edges.unshift({
            cursor: result.createPost.id,
            node: {
              ...result.createPost
            }
          });
        }
      )
    );
    switch (tag) {
      case 'PostsByPageId':
        dispatch(
          postApi.util.updateQueryData(
            'PostsBySearchWithHashtagAtPage',
            { ...params, minBurnFilter: filterValue, query: query, hashtags: hashtags, pageId: pageId },
            draft => {
              draft.allPostsBySearchWithHashtagAtPage.edges.unshift({
                cursor: result.createPost.id,
                node: {
                  ...result.createPost
                }
              });
            }
          )
        );
        return dispatch(
          postApi.util.updateQueryData(
            'PostsByPageId',
            { ...params, id: pageId, minBurnFilter: filterValue },
            draft => {
              draft.allPostsByPageId.edges.unshift({
                cursor: result.createPost.id,
                node: {
                  ...result.createPost
                }
              });
              draft.allPostsByPageId.totalCount = draft.allPostsByPageId.totalCount + 1;
            }
          )
        );
      case 'PostsByTokenId':
        dispatch(
          postApi.util.updateQueryData(
            'PostsBySearchWithHashtagAtToken',
            { ...params, minBurnFilter: filterValue, query: query, hashtags: hashtags, tokenId: tokenPrimaryId },
            draft => {
              draft.allPostsBySearchWithHashtagAtToken.edges.unshift({
                cursor: result.createPost.id,
                node: {
                  ...result.createPost
                }
              });
            }
          )
        );
        return dispatch(
          postApi.util.updateQueryData(
            'PostsByTokenId',
            { ...params, id: tokenPrimaryId, minBurnFilter: filterValue },
            draft => {
              draft.allPostsByTokenId.edges.unshift({
                cursor: result.createPost.id,
                node: {
                  ...result.createPost
                }
              });
              draft.allPostsByTokenId.totalCount = draft.allPostsByTokenId.totalCount + 1;
            }
          )
        );
    }
  };

  const handleCreateNewPost = async ({ htmlContent, pureContent }) => {
    let patches: PatchCollection;
    const params = {
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    };

    try {
      let filterValue: number;
      if (pureContent === '' || _.isNil(pureContent)) {
        return;
      }

      let createFeeHex;
      if (pathname.includes('/token')) {
        filterValue = filterToken;
      } else if (pathname.includes('/page')) {
        filterValue = filterPage;

        try {
          if (selectedAccount.id != page.pageAccountId && parseFloat(page.createPostFee) != 0) {
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
              page.pageAccount.address,
              page.createPostFee,
              true,
              fundingWif,
              true
            );
          }
        } catch (error) {
          throw new Error(intl.get('post.insufficientFeeCreatePost'));
        }
      } else {
        filterValue = filterHome;
      }

      const createPostInput: CreatePostInput = {
        uploadCovers: postCoverUploads.map(upload => upload.id),
        htmlContent: htmlContent,
        pureContent: pureContent,
        pageId: pageId || undefined,
        tokenPrimaryId: tokenPrimaryId || undefined,
        createFeeHex: createFeeHex
      };

      const result = await createPostTrigger({ input: createPostInput }).unwrap();
      let tag: string;

      if (_.isNil(pageId) && _.isNil(tokenPrimaryId)) {
        tag = PostsQueryTag.Posts;
      } else if (pageId) {
        tag = PostsQueryTag.PostsByPageId;
      } else if (tokenPrimaryId) {
        tag = PostsQueryTag.PostsByTokenId;
      }

      patches = updatePost(tag, params, filterValue, result, pageId, tokenPrimaryId, hashtagId);
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
      let message;
      if (error.message === intl.get('post.insufficientFeeCreatePost')) {
        message = error.message;
      } else {
        message = intl.get('post.unableCreatePostServer');
      }
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

  const getCreatePostLocation = () => {
    if (pathname.includes('/token')) {
      return (
        <React.Fragment>
          {intl.get('post.token')} <DollarOutlined />
        </React.Fragment>
      );
    } else if (pathname.includes('/page')) {
      return (
        <React.Fragment>
          {intl.get('post.page')} <ShopOutlined />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {intl.get('post.public')} <GlobalOutlined />
        </React.Fragment>
      );
    }
  };

  return (
    <React.Fragment>
      <DesktopCreatePost onClick={() => setEnableEditor(!enableEditor)}>
        <div className="box-create-post">
          <div className="avatar">
            <AvatarUser name={selectedAccount?.name} isMarginRight={false} />
            <Input
              bordered={false}
              placeholder={hashtags && hashtags.length > 0 ? hashtags.join(' ') : `Write about #hashtag...`}
              value=""
            />
          </div>
          <div className="btn-create">
            <PlusCircleOutlined />
          </div>
        </div>
        <div className="functional-images-bar">
          <IconWImage imgUrl={'/images/ico-images-color.png'} value={'Photo'} onClickIcon={() => console.log('Null')} />
          <IconWImage
            imgUrl={'/images/ico-link-url-color.png'}
            value={'Link Url'}
            onClickIcon={() => console.log('Null')}
          />
          <IconWImage
            imgUrl={'/images/ico-twitter-color.png'}
            value={'Embed Twitter'}
            onClickIcon={() => console.log('Null')}
          />
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
          <UserCreate>
            <div className="user-create-post">
              <img src="/images/xpi.svg" alt="" />
              <div className="user-info">
                <p className="title-user">{selectedAccount?.name}</p>
                <div className="location-fee">
                  <Button className="btn-select">{getCreatePostLocation()}</Button>
                  {page && page.createPostFee && selectedAccount.id != page.pageAccountId && (
                    <p className="post-fee">{`${intl.get('general.fee')} ${page.createPostFee} ${currency.ticker}`}</p>
                  )}
                </div>
              </div>
            </div>
            <EditorLexical
              onSubmit={value => handleCreateNewPost(value)}
              loading={isLoadingCreatePost}
              hashtags={hashtags}
            />
          </UserCreate>
        </Modal>
      </WrapEditor>
    </React.Fragment>
  );
};

export default CreatePostCard;
