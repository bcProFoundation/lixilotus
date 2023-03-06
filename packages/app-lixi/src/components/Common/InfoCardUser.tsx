import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { GlobalOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Menu } from 'antd';
import { AvatarUser } from './AvatarUser';
import intl from 'react-intl-universal';
import { useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import type { MenuProps } from 'antd';

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
        font-weight: 500;
        letter-spacing: 0.15px;
        margin: 0;
        text-transform: capitalize;
        color: 
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      .title {
        font-size: 12px;
        letter-spacing: 0.25px;
        margin: 0;
        color: rgba(30, 26, 29, 0.38);
      }
    }
    .ant-avatar-image {
      width: 48px;
      height: 48px;
      margin-right: 1rem;
      border: 0;
    }
  }
`;

const InfoCardUserContainer = styled.div`
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
      width: 48px;
      height: 48px;
    }
  }
`;

const Action = styled.div`
  cursor: pointer;
  img {
    width: 27px;
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
    isDropdown
  } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const history = useRouter();

  useEffect(() => {
    isDropdown ? isDropdown : false;
  }, []);

  const items: MenuProps['items'] = [
    {
      key: 'editPost',
      label: <a onClick={onEditPostClick}>{intl.get('post.editPost')}</a>
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

  return (
    <>
      <InfoCardUserContainer className={type === 'card' ? 'card' : ''}>
        <CardUser>
          <div className="card-container">
            <div onClick={() => history.push(`/profile/${postAccountAddress}`)}>
              {imgUrl ? <Avatar src={imgUrl} /> : <AvatarUser name={name} isMarginRight={true} />}
            </div>
            <div className="card-info">
              <h4 className="name" onClick={() => history.push(`/profile/${postAccountAddress}`)}>
                {name}
              </h4>
              <p className="title">
                {title}
                <span style={{ marginLeft: '4px', fontSize: '10px' }}>{activatePostLocation && postLocation()}</span>
                <span style={{ marginLeft: '4px', fontSize: '12px', fontStyle: 'italic' }}>
                  {postEdited && intl.get('post.edited')}
                </span>
              </p>
            </div>
          </div>
        </CardUser>
        {isDropdown === true && (
          <>
            <Dropdown
              menu={{ items }}
              trigger={[selectedAccount && selectedAccount.address === postAccountAddress ? 'click' : 'contextMenu']}
              arrow={{ pointAtCenter: true }}
              placement="bottomRight"
            >
              <Action>
                <img src="/images/ico-more-vertical.svg" alt="" />
              </Action>
            </Dropdown>
          </>
        )}
      </InfoCardUserContainer>
    </>
  );
};

export default InfoCardUser;
