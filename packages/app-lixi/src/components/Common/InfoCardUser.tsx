import React from 'react';
import styled from 'styled-components';

const InfoCardUser = ({ imgUrl, name, title }) => {
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

  return (
    <>
      <CardUser>
        <div className="card-container">
          <img src={imgUrl ? imgUrl : '/images/xpi.svg'} alt="" />
          <div className="card-info">
            <h4 className="name">{name}</h4>
            <p className="title">{title}</p>
          </div>
        </div>
      </CardUser>
    </>
  );
};

export default InfoCardUser;
