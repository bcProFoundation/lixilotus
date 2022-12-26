import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { GlobalOutlined, DollarOutlined, ShopOutlined } from '@ant-design/icons';

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
    img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      margin-right: 1rem;
    }
    .card-info {
      text-align: left;
      .name {
        margin: 0;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      .title {
        margin: 0;
        color: #898888;
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
    width: 24px;
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
            <picture>
              <img className="avatar-ico" src={imgUrl ? imgUrl : '/images/xpi.svg'} alt="" />
            </picture>
            <div className="card-info">
              <h4 className="name" onClick={() => history.push(`/profile/${address}`)}>
                {name}
              </h4>
              <p className="title">
                {title}
                <span style={{ marginLeft: '5px', fontSize: '13px' }}>{activatePostLocation && postLocation()}</span>
              </p>
            </div>
          </div>
        </CardUser>
        <Action onClick={onClick}>
          <img src="/images/three-dot-ico.svg" alt="" />
        </Action>
      </InfoCardUserContainer>
    </>
  );
};

export default InfoCardUser;
