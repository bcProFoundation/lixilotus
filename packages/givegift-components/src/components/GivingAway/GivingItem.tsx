import React from 'react';
import styled, { DefaultTheme } from 'styled-components';
import { GiftOutlined } from '@ant-design/icons';

const GiftIcon = styled(GiftOutlined)`
  color: ${props => props.theme.secondary}
`;

const GivingItemIcon = styled.div`
  svg {
    width: 32px;
    height: 32px;
  }
  height: 32px;
  width: 32px;
  @media screen and (max-width: 500px) {
    svg {
      width: 24px;
      height: 24px;
    }
    height: 24px;
    width: 24px;
  }
`;

const GivingAwayDescription = styled.div`
  text-align: left;
  padding: 12px;
  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const GivingAwayDescriptionLabel = styled.span`
  font-weight: bold;
  color: ${props => props.theme.primary} !important;
`;

const GivingAwayInfo = styled.div`
  padding: 12px;
  font-size: 1rem;
  text-align: right;
  color: ${props => props.theme.primary};
  @media screen and (max-width: 500px) {
    font-size: 0.8rem;
  }
`;

const GiftNumber = styled.div`
  padding-left: 12px;
  font-size: 0.8rem;
  @media screen and (max-width: 500px) {
    font-size: 0.6rem;
  }
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const GivingItemWrapper = styled.div`
  display: grid;
  grid-template-columns: 36px 30% 50%;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  border-radius: 3px;
  background: ${props => props.theme.listItem.background};
  box-shadow: ${props => props.theme.listItem.boxShadow};
  border: 1px solid ${props => props.theme.listItem.border};
  :hover {
    border-color: ${props => props.theme.primary};
  }
  @media screen and (max-width: 500px) {
    grid-template-columns: 24px 30% 50%;
    padding: 12px 12px;
  }
`;

type IGivingItemProps = {
  description: string;
  givingDate: Date;
  givingAmount: string;
  ticker: string;
  giftNumber: number;
  theme?: DefaultTheme;
}

const GivingItem: React.FC<IGivingItemProps> = (
  {
    description, givingDate, givingAmount, ticker, giftNumber
  }) => {
  const givingDateLocalTime = givingDate.toLocaleDateString();
  return (
    <>
      <GivingItemWrapper>
        <GivingItemIcon>
          <GiftIcon />
        </GivingItemIcon>
        <GivingAwayDescription>
          <GivingAwayDescriptionLabel>{description}</GivingAwayDescriptionLabel>
          <br />
          {givingDateLocalTime}
        </GivingAwayDescription>
        <GivingAwayInfo>
          {givingAmount}
          &nbsp;
          {ticker}
          <GiftNumber>
            {giftNumber} gift
          </GiftNumber>
        </GivingAwayInfo>
      </GivingItemWrapper>
    </>
  );
}

export default GivingItem;