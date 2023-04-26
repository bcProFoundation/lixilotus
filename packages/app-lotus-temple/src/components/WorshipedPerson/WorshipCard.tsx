import React, { useEffect, useState } from 'react';
import style from 'styled-components';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import { WorshipQuery } from '@store/worship/worshipedPerson.generated';
import moment from 'moment';
import intl from 'react-intl-universal';
import { useRouter } from 'next/router';

export type WorshipItem = WorshipQuery['worship'];

type WorshipCardProps = {
  index: number;
  item: WorshipItem;
  isPublic?: boolean;
  worshipedPersonName?: string;
  worshipedPersonId?: string;
};

const StyledAnimation = style.div`
  padding-right: 5px;
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

const WorshipCard = ({ index, item, isPublic, worshipedPersonName, worshipedPersonId }: WorshipCardProps) => {
  const history = useRouter();
  const getWorshipImage = () => {
    if (item.worshipedAmount >= 1 && item.worshipedAmount < 10) {
      return '/images/flower-card.svg';
    } else if (item.worshipedAmount >= 10 && item.worshipedAmount < 100) {
      return '/images/incense-card.svg';
    } else {
      return '/images/candle-card.svg';
    }
  };

  const getWorshipText = () => {
    if (item.worshipedAmount >= 1 && item.worshipedAmount < 10) {
      return intl.get('worship.offerFlower');
    } else if (item.worshipedAmount >= 10 && item.worshipedAmount < 100) {
      return intl.get('worship.offerIncense');
    } else {
      return intl.get('worship.offerCandle');
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
            <span style={{ marginBottom: '0', textAlign: 'left' }}>
              {worshipTextType}{' '}
              {isPublic && (
                <span>
                  -
                  <span
                    style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => history.push(`/person/${worshipedPersonId}`)}
                  >
                    {worshipedPersonName}
                  </span>
                  -
                </span>
              )}
              <StyledSubInfo>
                {' '}
                <FireOutlined /> {item.worshipedAmount} XPI
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

export default WorshipCard;
