import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { GlobalOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import { AvatarUser } from './AvatarUser';

type InfoCardProps = {
  imgUrl: string;
  name: string;
  title: string;
  type?: string;
  address?: string;
  page?: any;
  token?: any;
  activatePostLocation?: boolean;
  onClick?: () => void;
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
  const { imgUrl, name, title, type, onClick, address, token, page, activatePostLocation } = props;
  const history = useRouter();

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
            <div onClick={() => history.push(`/profile/${address}`)}>
              <AvatarUser name={name} isMarginRight={true} />
            </div>
            <div className="card-info">
              <h4 className="name" onClick={() => history.push(`/profile/${address}`)}>
                {name}
              </h4>
              <p className="title">
                {title}
                <span style={{ marginLeft: '4px', fontSize: '10px' }}>{activatePostLocation && postLocation()}</span>
              </p>
            </div>
          </div>
        </CardUser>
        <Action onClick={onClick}>
          <img src="/images/ico-more-vertical.svg" alt="" />
        </Action>
      </InfoCardUserContainer>
    </>
  );
};

export default InfoCardUser;
