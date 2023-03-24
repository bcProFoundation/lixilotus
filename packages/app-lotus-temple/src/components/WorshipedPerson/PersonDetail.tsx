import React, { useState, useRef, ReactNode } from 'react';
import style from 'styled-components';
import WorshipCard from './WorshipCard';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import PersonInfo from './PersonInfo';

type PersonDetail = {
  person: any;
  isMobile: boolean;
};

const StyledTab = style(Tabs)`
   margin-top: 10px;
`;

const StyledPersonCard = style.div`
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
   flex-direction: column
`;

const StyledPersonCover = style.div`
  background-image: url(/images/placeholder.svg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 615px;
  display:flex;
  width: 100%;
  height: 220px;
  justify-content: center;
  align-items: center;
  margin-top:30px;
`;

const StyledPersonAvatar: any = style.div`
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

const StyledPersonName = style.p`
   font-family: 'Open Sans';
   font-style: normal;
   font-weight: 800;
   font-size: 24px;
   line-height: 36px;
   margin-bottom: 0px;
`;

const StyledPersonDate = style.p`
   font-family: 'Open Sans';
   font-style: normal;
   font-weight: 600;
   font-size: 22px;
   line-height: 28px;
`;

const PersonDetail = ({ person, isMobile }: PersonDetail) => {
  const [current, setCurrent] = useState('worship');
  const specialDayRef = useRef(null);
  const trendingRef = useRef(null);

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
      children: <PersonInfo />
    }
  ];

  return (
    <React.Fragment>
      <StyledPersonCard>
        <StyledTopCard>
          <StyledPersonCover>
            <StyledPersonAvatar avatar="/images/placeholderAvatar.svg" />
          </StyledPersonCover>
          <StyledPersonName>Nguyễn Huệ</StyledPersonName>
          <StyledPersonDate>1752 - 16 tháng 9,1972</StyledPersonDate>
        </StyledTopCard>
        <StyledBottomCard>Hello</StyledBottomCard>
        <StyledTab defaultActiveKey="1" items={items} onChange={onChange} />
      </StyledPersonCard>
    </React.Fragment>
  );
};

export default PersonDetail;
