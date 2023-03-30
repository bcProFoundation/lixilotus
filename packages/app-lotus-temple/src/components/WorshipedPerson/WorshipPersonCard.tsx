import React, { useEffect, useState } from 'react';
import style from 'styled-components';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { WorshipQuery } from '@store/worship/worshipedPerson.generated';
import moment from 'moment';
import intl from 'react-intl-universal';

export type WorshipItem = WorshipQuery['worship'];

type WorshipCardProps = {
  index: number;
  item: WorshipItem;
};

const StyledAnimation = style.div`
  .new-item {
    opacity: 0;
    transform: scale(0);
    animation: scale-up 0.75s forwards;
  }

  @keyframes scale-up {
    from {
      opacity: 0;
      transform: scale(0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  `;

const StyledItem = style.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 5px;
  background: #FFFFFF;
  width: 100%;
  padding: 6px 32px 0px 32px;
  border-radius: 24px;
  justify-content: space-between;
`;

const StyledInfoContainer = style.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledName = style.span`
  margin-bottom: 0px;
  text-align: left;
  font-weight: bold;
`;

const StyledSubInfo = style.span`
  font-weight: normal;
  color: #4F4F4F;
  font-size: 11.5px;
`;

const WorshipPersonCard = ({ index, item }: WorshipCardProps) => {
  const getWorshipImage = () => {
    if (item.worshipedAmount >= 1 && item.worshipedAmount < 10) {
      return '/images/incense-card.svg';
    } else if (item.worshipedAmount >= 10 && item.worshipedAmount < 100) {
      return '/images/candle-card.svg';
    } else {
      return '/images/flower-card.svg';
    }
  };

  const getWorshipText = () => {
    if (item.worshipedAmount >= 1 && item.worshipedAmount < 10) {
      return intl.get('worship.offerIncense');
    } else if (item.worshipedAmount >= 10 && item.worshipedAmount < 100) {
      return intl.get('worship.offerCandle');
    } else {
      return intl.get('worship.offerFlower');
    }
  };

  const [worshipImageType, setWorshipImageType] = useState(getWorshipImage);
  const [worshipTextType, setWorshipTextType] = useState(getWorshipText);

  return (
    <StyledAnimation>
      <StyledItem className={`${index === 0 ? 'new-item' : ''}`}>
        <Space>
          <AvatarUser name={item.account.name} />
          <StyledInfoContainer>
            <StyledName>
              {item.account.name} <StyledSubInfo> - {moment(item.createdAt).fromNow().toString()}</StyledSubInfo>
            </StyledName>
            <span style={{ marginBottom: '0' }}>
              {worshipTextType}
              <StyledSubInfo>
                - <FireOutlined /> {item.worshipedAmount} XPI
              </StyledSubInfo>
            </span>
          </StyledInfoContainer>
        </Space>
        <picture>
          <img alt="incense-card" src={worshipImageType} />
        </picture>
      </StyledItem>
    </StyledAnimation>
  );
};

export default WorshipPersonCard;
