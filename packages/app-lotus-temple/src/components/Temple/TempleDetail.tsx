import React, { useState, useRef, ReactNode } from 'react';
import style from 'styled-components';
import WorshipCard from './WorshipCard';
import { Space, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import TempleInfo from './TempleInfo';
import { FireOutlined } from '@ant-design/icons';

type TempleDetail = {
  person: any;
  isMobile: boolean;
};

const StyledTab = style(Tabs)`
  margin-top: 10px;
`;

const StyledTempleCard = style.div`
  width: 700px;
  display: flex;
  flex-direction: column
`;

const StyledTopCard = style.div`
  width: 100%;
  display: flex;
  margin-top: 10px;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0px;
  flex-direction: column
`;

const StyledBottomCard = style.div`
  width: 100%;
  display: flex;
  background: #FFFFFF;
  border-top: 1px solid #CDCCCA;
  border-radius: 0 0 24px 24px ;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 16px 32px;
`;

const StyledTempleCover = style.div`
  background-image: url(/images/placeholder.svg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 500px;
  display:flex;
  width: 100%;
  height: 220px;
  justify-content: center;
  align-items: center;
  margin-top:30px;
`;

const StyledTempleAvatar: any = style.div`
  width: 150px;
  height: 200px;
  background: #D9D9D9;
  border-radius: 40px;
  background-image: url(${(props: any) => props.avatar});
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  box-shadow: inset 0px 0px 4px #000000;
`;

const StyledTempleName = style.p`
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 36px;
  margin-bottom: 0px;
`;

const StyledTempleDate = style.p`
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
`;

const StyledActionContainer = style.div`
  display: flex;
  width: 50%;
  justify-content: space-evenly
`;

const StyledWorshipInfo = style.div`
  display: flex;
  width: 50%;
  flex-direction: column;
`;

const StyledText = style.span`
  font-size: 16px;
  line-height: 24px;
  font-weight: bold;
`;

const StyledActionIcon = style.img`
  cursor: pointer;
`;

const TempleDetail = ({ person, isMobile }: TempleDetail) => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      label: 'Tưởng niệm',
      key: 'worship',
      children: (
        <React.Fragment>
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
        </React.Fragment>
      )
    },
    {
      label: 'Thông tin',
      key: 'info',
      children: <TempleInfo />
    }
  ];

  return (
    <React.Fragment>
      <StyledTempleCard>
        <StyledTopCard>
          <StyledTempleCover>
            <StyledTempleAvatar avatar="/images/placeholderAvatar.svg" />
          </StyledTempleCover>
          <StyledTempleName>Nguyễn Huệ</StyledTempleName>
          <StyledTempleDate>1752 - 16 tháng 9,1972</StyledTempleDate>
        </StyledTopCard>
        <StyledBottomCard>
          <StyledWorshipInfo>
            <Space style={{ marginBottom: '3px' }}>
              <picture>
                <img alt="lotus-logo" src="/images/lotus_logo.png" width="32px" />
              </picture>
              <StyledText>Lotus Temple Official</StyledText>
            </Space>
            <Space>
              <picture>
                <img alt="burn-icon" src="/images/burn-icon.svg" width="32px" />
              </picture>
              <StyledText>10.5K XPI</StyledText>
            </Space>
          </StyledWorshipInfo>
          <StyledActionContainer>
            <picture>
              <StyledActionIcon alt="candle" src="/images/candle.svg" />
            </picture>
            <picture>
              <StyledActionIcon alt="incense-box" src="/images/incense-box.svg" />
            </picture>
            <picture>
              <StyledActionIcon alt="lotus-burn" src="/images/lotus-burn.svg" />
            </picture>
          </StyledActionContainer>
        </StyledBottomCard>
        <StyledTab defaultActiveKey="1" items={items} onChange={onChange} />
      </StyledTempleCard>
    </React.Fragment>
  );
};

export default TempleDetail;
