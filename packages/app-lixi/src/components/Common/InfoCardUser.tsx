import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Icon, { GlobalOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import { AvatarUser } from './AvatarUser';
import intl from 'react-intl-universal';
import { useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import type { MenuProps } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import FollowSvg from '@assets/icons/follow.svg';
import { currency } from '@components/Common/Ticker';

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
  lotusBurnScore?: number;
  followPostOwner?: boolean;
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
        font-size: 11px;
        letter-spacing: 0.25px;
        margin: 0;
        color: rgba(30, 26, 29, 0.38);

        .account-name {
          cursor: pointer;
          color: var(--text-color-on-background);
        }
        svg {
          width: 12px;
          height: 12px;
          letter-spacing: 0.25px;
          margin: 0;
          filter: invert(73%) sepia(12%) saturate(19%) hue-rotate(251deg) brightness(92%) contrast(85%);
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
    }
    .image-page {
      object-fit: cover;
      border-radius: 8px;
      width: 45px;
      height: 45px;
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
    lotusBurnScore,
    followPostOwner
  } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const history = useRouter();

  const items: MenuProps['items'] = [
    {
      key: 'editPost',
      label: <a onClick={onEditPostClick}>{intl.get('post.editPost')}</a>,
      disabled: lotusBurnScore !== 0
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

  //if not token or page, nothing will be displayed. If it is a page, it will display the page name and have an Arrow. If it is a token, it will show the token name and have an Arrow
  return (
    <>
      <InfoCardUserContainer className={`info-card-user ${type === 'card' ? 'card' : ''}`}>
        <CardUser>
          {!page && !token && (
            <div className="card-container">
              <div onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                {imgUrl ? <Avatar src={imgUrl} /> : <AvatarUser name={name} isMarginRight={true} />}
              </div>
              <div className="card-info">
                <span className="name" onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                  {name}
                </span>
                <p className="title">
                  {title}
                  <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                    · {activatePostLocation && postLocation()}
                  </span>
                  <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
                    {postEdited && intl.get('post.edited')}
                  </span>
                </p>
              </div>
            </div>
          )}
          {page && page?.name && (
            <div className="card-container">
              <div className="page-bar" onClick={() => history.push(`/page/${page.id}}`)}>
                <img className="image-page" src={page?.avatar ? page?.avatar : '/images/default-avatar.jpg'} />
                <AvatarUser name={name} isMarginRight={true} />
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
                  <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                    {activatePostLocation && postLocation()}{' '}
                    {followPostOwner && <Icon component={() => <FollowSvg />} />}
                  </span>
                  <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
                    {postEdited && intl.get('post.edited')}
                  </span>
                </p>
              </div>
            </div>
          )}
          {token && token?.name && (
            <div className="card-container">
              <div className="page-bar" onClick={() => history.push(`/token/${token?.tokenId}}`)}>
                <img className="image-page" src={`${currency.tokenIconsUrl}/64/${token.tokenId}.png`} />
                <AvatarUser name={name} isMarginRight={true} />
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
                  <span style={{ marginLeft: '4px', fontSize: '10px' }}>{activatePostLocation && postLocation()}</span>
                  <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
                    {postEdited && intl.get('post.edited')}
                  </span>
                </p>
              </div>
            </div>
          )}
        </CardUser>
        {isDropdown && (
          <>
            <Dropdown
              menu={{ items }}
              trigger={[selectedAccount && selectedAccount.address === postAccountAddress ? 'click' : 'contextMenu']}
              arrow={{ pointAtCenter: true }}
              placement="bottomRight"
            >
              <Action>
                <img className="action-post" src="/images/ico-more-vertical.svg" alt="" />
              </Action>
            </Dropdown>
          </>
        )}
      </InfoCardUserContainer>
    </>
  );
};

export default InfoCardUser;
