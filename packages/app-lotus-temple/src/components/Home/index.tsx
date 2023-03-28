import React, { useRef, useState } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import style from 'styled-components';
import WorshipedPersonCard from '@components/Common/WorshipedPersonCard';

const items: MenuProps['items'] = [
  {
    label: 'Ngày đặc biệt',
    key: 'specialDay'
  },
  {
    label: 'Quan tâm nhiều',
    key: 'trending'
  }
];

const StyledMenu = style(Menu)`
   background: #FAF0FA;
   position: sticky;
   top: 0;
   margin-bottom: 10px;
   z-index: 1;

   .ant-menu-item {
      color: rgb(180,180,180);
   }
   .ant-menu-item-selected {
      font-weight: bold;
   }
`;

const StyledCardContainer = style.div`
   width: 640px;
   display: grid;
   grid-template-columns: auto auto
`;

const StyledHeaderContainer = style.div`
  display: flex;
  width: 640px;
  margin-top: 25px;
`;

const StyledHeader = style.div`
  display: flex;
  flex-direction: column;
  width: 50%;
`;

const StyledTextHeader = style.p`
  margin: 0px 0px 6px 0px;
  font-weight: 700;
  font-size: 24px;
  text-align: left;
`;

const StyledTextDesc = style.p`
  margin: 0px;
  font-size: 16px;
  text-align: left;
`;

const Home = () => {
  const [current, setCurrent] = useState('specialDay');
  const specialDayRef = useRef(null);
  const trendingRef = useRef(null);

  const onClick: MenuProps['onClick'] = e => {
    setCurrent(e.key);

    switch (e.key) {
      case 'trending':
        trendingRef.current.scrollIntoView();
        break;
      case 'specialDay':
        specialDayRef.current.scrollIntoView();
        break;
    }
  };

  return (
    <React.Fragment>
      <StyledMenu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      <StyledHeaderContainer>
        <StyledHeader>
          <StyledTextHeader ref={specialDayRef}>Ngày đặc biệt đã đến</StyledTextHeader>
          <StyledTextDesc>
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat{' '}
          </StyledTextDesc>
        </StyledHeader>
        <picture>
          <img alt="lotus-calendar" src="/images/lotus-calendar.svg" width="300px" />
        </picture>
      </StyledHeaderContainer>
      <StyledCardContainer>
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
      </StyledCardContainer>
      <h1 style={{ textAlign: 'left' }} ref={trendingRef}>
        Quan tâm nhiều trong ngày
      </h1>
      <StyledCardContainer>
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
        <WorshipedPersonCard />
      </StyledCardContainer>
    </React.Fragment>
  );
};

export default Home;
