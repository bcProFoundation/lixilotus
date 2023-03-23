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
      <h1 style={{ textAlign: 'left' }} ref={specialDayRef}>
        Ngày đặc biệt đã đến
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
