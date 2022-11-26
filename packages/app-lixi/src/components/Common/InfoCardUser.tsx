import React from 'react';
import styled from 'styled-components';

type InfoCardProps = {
  imgUrl: string;
  name: string;
  title: string;
  type?: string;
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
      .name,
      .title {
        margin: 0;
      }
      .title {
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
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card {
    padding: 20px;
    margin-bottom: 8px;
    border-radius: 20px;
    box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
    align-items: initial;
    .avatar-ico {
      width: 30px;
      height: 30px;
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
  const { imgUrl, name, title, type, onClick } = props;

  return (
    <>
      <InfoCardUserContainer className={type === 'card' ? 'card' : ''}>
        <CardUser>
          <div className="card-container">
            <picture>
              <img className="avatar-ico" src={imgUrl ? imgUrl : '/images/xpi.svg'} alt="" />
            </picture>
            <div className="card-info">
              <h4 className="name">{name}</h4>
              <p className="title">{title}</p>
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
