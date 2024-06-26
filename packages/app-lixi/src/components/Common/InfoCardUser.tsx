import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Icon, { GlobalOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import AvatarUser from './AvatarUser';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import type { MenuProps } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import FollowSvg from '@assets/icons/follow.svg';
import { currency } from '@components/Common/Ticker';
import { openActionSheet } from '@store/action-sheet/actions';
import { PostListType } from '@bcpros/lixi-models/constants';
import useAuthorization from './Authorization/use-authorization.hooks';
import { AuthorizationContext } from '@context/index';
import {
  useCheckIfFollowAccountQuery,
  useCheckIfFollowPageQuery,
  useCheckIfFollowTokenQuery
} from '@store/follow/follows.api';

type InfoCardProps = {
  imgUrl: any;
  name: string;
  title: string;
  type?: string;
  page?: any;
  token?: any;
  activatePostLocation?: boolean;
  postAccountAddress?: string;
  onEditPostClick?: () => void;
  postEdited?: boolean;
  isDropdown?: boolean;
  danaBurnScore?: number;
  followPostOwner?: boolean;
  followedPage?: boolean;
  followedToken?: boolean;
  post?: any;
  postListType?: PostListType;
};

const CardUser = styled.div`
  display: flex;
  justify-content: space-between;
  .card-container {
    display: flex;
    align-items: center;
    .card-info {
      text-align: left;
      .name {
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.15px;
        margin: 0;
        text-transform: capitalize;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      .title {
        display: flex;
        align-items: center;
        font-size: 11px;
        letter-spacing: 0.25px;
        margin: 0;
        color: rgba(30, 26, 29, 0.38);

        .account-name {
          cursor: pointer;
          color: var(--text-color-on-background);
          margin-right: 2px;
        }

        .follow-icon {
          svg {
            width: 12px;
            height: 12px;
            letter-spacing: 0.25px;
            margin: 0;
            filter: invert(73%) sepia(12%) saturate(19%) hue-rotate(251deg) brightness(92%) contrast(85%);
          }
        }
      }
    }
    .ant-avatar-image {
      width: 43px;
      height: 43px;
      margin-right: 10px;
      border: 0;
    }
    .page-bar {
      position: relative;
      margin-right: 10px;
      .ant-avatar {
        position: absolute;
        width: 25px;
        height: 25px;
        right: -4px;
        top: 25px;
        margin-right: 0 !important;
        background: #bfbfbf;
        font-size: 12px;
      }
      .ant-avatar {
        img {
          border: 1px solid var(--border-color-dark-base);
          border-radius: 50%;
        }
      }
    }
    .image-page {
      object-fit: cover;
      border-radius: 8px;
      width: 45px;
      height: 45px;
      cursor: pointer;
    }
  }
`;
const InfoCardUserContainer = styled.div`
  font-size: 16px;
  line-height: 20px;
  width: 100%;
  padding: 0;
  box-shadow: none;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card {
    margin-bottom: 1rem;
    align-items: initial;
    .avatar-ico {
      width: 43px;
      height: 43px;
    }
  }
`;

const Action = styled.div`
  cursor: pointer;
  img {
    width: 27px;
    transform: rotate(90deg);
  }
`;

const InfoCardUser: React.FC<InfoCardProps> = props => {
  const {
    imgUrl,
    name,
    title,
    type,
    onEditPostClick,
    token,
    page,
    activatePostLocation,
    postAccountAddress,
    postEdited,
    isDropdown,
    danaBurnScore,
    followPostOwner,
    followedPage,
    followedToken,
    post,
    postListType
  } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const history = useRouter();
  const dispatch = useAppDispatch();
  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();

  const items: MenuProps['items'] = [
    {
      key: 'editPost',
      label: <a onClick={onEditPostClick}>{intl.get('post.editPost')}</a>,
      disabled: danaBurnScore !== 0
    }
  ];
  const postLocation = () => {
    if (!token && !page) {
      return <GlobalOutlined />;
    }
    if (token) {
      return <DollarOutlined />;
    } else {
      return <ShopOutlined />;
    }
  };

  const postActionSheet = (postContent, page?, token?) => {
    // let isEditPost = selectedAccount && selectedAccount.address === postAccountAddress;
    // if (isEditPost) {
    authorization.authorized
      ? dispatch(
          openActionSheet('PostActionSheet', {
            isEditPost: selectedAccount.address === postAccountAddress && post.danaBurnScore === 0,
            post: postContent,
            page: page,
            token: token,
            followPostOwner,
            followedPage,
            followedToken
          })
        )
      : askAuthorization();
    // }
  };

  const normalInfor = (
    displayIconFollow //just display icon follow in Home timeline
  ) => (
    <div className="card-container">
      <div onClick={() => history.push(`/profile/${postAccountAddress}`)}>
        {imgUrl ? <Avatar src={imgUrl} /> : <AvatarUser name={name} isMarginRight={true} />}
      </div>
      <div className="card-info">
        <span className="name" onClick={() => history.push(`/profile/${postAccountAddress}`)}>
          {name}
        </span>
        <p className="title">
          {title} ·
          <span
            style={{ marginLeft: '4px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '1px' }}
          >
            {activatePostLocation && postLocation()}&nbsp;
            {authorization.authorized && followPostOwner && displayIconFollow && (
              <Icon className="follow-icon" component={() => <FollowSvg />} />
            )}
          </span>
          <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
            {postEdited && intl.get('post.edited')}
          </span>
        </p>
      </div>
    </div>
  );

  //if not token or page, nothing will be displayed. If it is a page, it will display the page name and have an Arrow. If it is a token, it will show the token name and have an Arrow
  return (
    <>
      <InfoCardUserContainer className={`info-card-user ${type === 'card' ? 'card' : ''}`}>
        <CardUser>
          {!page && !token && normalInfor(postListType === PostListType.Profile ? false : true)}
          {page &&
            page?.name &&
            (postListType === PostListType.Page ? (
              normalInfor(false)
            ) : (
              <div className="card-container">
                <div className="page-bar">
                  <img
                    className="image-page"
                    src={page?.avatar ? page?.avatar : '/images/default-avatar.jpg'}
                    onClick={() => history.push(`/page/${page.id}`)}
                  />
                  <div onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                    <AvatarUser icon={imgUrl} name={name} isMarginRight={true} />
                  </div>
                </div>
                <div className="card-info">
                  <span className="name" onClick={() => history.push(`/page/${page.id}`)}>
                    {page?.name}
                  </span>
                  <p className="title">
                    <span className="account-name" onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                      {name}
                    </span>{' '}
                    · {title} ·
                    <span
                      style={{
                        marginLeft: '4px',
                        fontSize: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1px'
                      }}
                    >
                      {activatePostLocation && postLocation()}&nbsp;
                      {authorization.authorized && (followPostOwner || followedPage) && (
                        <Icon className="follow-icon" component={() => <FollowSvg />} />
                      )}
                    </span>
                    <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
                      {postEdited && intl.get('post.edited')}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          {token &&
            token?.name &&
            (postListType === PostListType.Token ? (
              normalInfor(false)
            ) : (
              <div className="card-container">
                <div className="page-bar">
                  <img
                    className="image-page"
                    src={`${currency.tokenIconsUrl}/64/${token.tokenId}.png`}
                    onClick={() => history.push(`/token/${token?.tokenId}`)}
                  />
                  <div onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                    <AvatarUser name={name} isMarginRight={true} icon={null} />
                  </div>
                </div>
                <div className="card-info">
                  <span className="name" onClick={() => history.push(`/token/${token?.tokenId}`)}>
                    {token?.name}
                  </span>
                  <p className="title">
                    <span className="account-name" onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                      {name}
                    </span>{' '}
                    · {title} ·
                    <span
                      style={{
                        marginLeft: '4px',
                        fontSize: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1px'
                      }}
                    >
                      {activatePostLocation && postLocation()}&nbsp;
                      {authorization.authorized && (followPostOwner || followedToken) && (
                        <Icon className="follow-icon" component={() => <FollowSvg />} />
                      )}
                    </span>
                    <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
                      {postEdited && intl.get('post.edited')}
                    </span>
                  </p>
                </div>
              </div>
            ))}
        </CardUser>
        {isDropdown && (
          <>
            <Action>
              <picture>
                <img
                  onClick={() => postActionSheet(post, page, token)}
                  className="action-post"
                  src="/images/ico-more-vertical.svg"
                  alt=""
                />
              </picture>
            </Action>
          </>
        )}
      </InfoCardUserContainer>
    </>
  );
};

export default InfoCardUser;
