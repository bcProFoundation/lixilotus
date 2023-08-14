import { DollarOutlined, GlobalOutlined, PlusCircleOutlined, ShopOutlined } from '@ant-design/icons';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { PageItem } from '@components/Pages/PageDetail';
import { AuthorizationContext } from '@context/index';
import { WalletContext } from '@context/walletProvider';
import { CreatePostInput, OrderDirection, PostOrderField } from '@generated/types.generated';
import useXPI from '@hooks/useXPI';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { deleteEditorTextFromCache, removeAllUpload } from '@store/account/actions';
import { getAccountInfoTemp, getEditorCache, getPostCoverUploads, getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { api as postApi, useCreatePostMutation } from '@store/post/posts.api';
import { CreatePostMutation } from '@store/post/posts.generated';
import {
  getCurrentThemes,
  getFilterPostsHome,
  getFilterPostsPage,
  getFilterPostsToken,
  getIsTopPosts
} from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { getUtxoWif } from '@utils/cashMethods';
import { Button, Input, Modal, Space } from 'antd';
import _ from 'lodash';
import router from 'next/router';
import React, { useContext, useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { AvatarUser } from './AvatarUser';
import { SocialsEnum } from './Embed';
import EditorLexical from './Lexical/EditorLexical';
import { currency } from './Ticker';
import useAuthorization from './Authorization/use-authorization.hooks';
import { getShowCreatePost } from '@store/post/selectors';

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
    bottom: 5rem;
    background: transparent !important;
    .fab-btn {
      padding: 16px;
      background: #ffdbd1;
      border-radius: 50%;
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
  const currentTheme = useAppSelector(getCurrentThemes);
  const { XPI, chronik } = Wallet;
  const { sendXpi } = useXPI();
  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();
  const showCreatePostMobile = useAppSelector(getShowCreatePost);
  const accountInfoTemp = useAppSelector(getAccountInfoTemp);
  const isTop = useAppSelector(getIsTopPosts);

  const [
    createPostTrigger,
    { isLoading: isLoadingCreatePost, isSuccess: isSuccessCreatePost, isError: isErrorCreatePost }
  ] = useCreatePostMutation();

  const handleNewPostClick = () => {
    if (authorization.authorized) {
      setEnableEditor(!enableEditor);
    } else {
      askAuthorization();
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
          throw new Error(intl.get('account.insufficientFunds'));
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
        createFeeHex: createFeeHex,
        extraArguments: {
          hashtagId: hashtagId,
          hashtags: hashtags,
          query: query,
          isTop: String(isTop),
          minBurnFilter: filterValue,
          orderBy: {
            direction: OrderDirection.Desc,
            field: PostOrderField.UpdatedAt
          }
        }
      };

      await createPostTrigger({ input: createPostInput }).unwrap();

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
      if (error.message === intl.get('account.insufficientFunds')) {
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
      <DesktopCreatePost className="create-post-card-container" onClick={handleNewPostClick}>
        <div className="box-create-post">
          <div className="avatar">
            <AvatarUser icon={accountInfoTemp?.avatar} name={selectedAccount?.name} isMarginRight={false} />
            <Input
              bordered={false}
              placeholder={
                hashtags && hashtags.length > 0
                  ? `Write about ${hashtags
                      .map(hashtag => {
                        return `${hashtag}`;
                      })
                      .join(' ')}`
                  : `What's on your mind?`
              }
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
          <IconWImage imgUrl={'/images/ico-embed.png'} value={'Embed'} onClickIcon={() => console.log('Null')} />
        </div>
      </DesktopCreatePost>

      <MobileCreatePost
        hidden={!showCreatePostMobile}
        className={`animate__animated ${
          showCreatePostMobile ? 'animate__fadeIn' : 'animate__fadeOut'
        } create-post-card-container`}
        onClick={handleNewPostClick}
      >
        <div className="fab-btn">
          <img src="/images/ico-create-post.svg" alt="" />
        </div>
      </MobileCreatePost>

      <WrapEditor>
        <Modal
          className={`${currentTheme === 'dark' ? 'ant-modal-dark' : ''} custom-modal-editor`}
          transitionName=""
          title="Create Post"
          open={enableEditor}
          footer={null}
          onCancel={() => setEnableEditor(false)}
        >
          <UserCreate>
            <div className="user-create-post">
              <AvatarUser icon={accountInfoTemp?.avatar} name={selectedAccount?.name} isMarginRight={false} />
              <div className="user-info">
                <p className="title-user">{selectedAccount?.name}</p>
                <div className="location-fee">
                  <Button className="btn-select">{getCreatePostLocation()}</Button>
                  {page && page.createPostFee && selectedAccount?.id != page.pageAccountId && (
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
