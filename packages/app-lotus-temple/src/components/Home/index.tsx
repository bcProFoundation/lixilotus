import React, { useEffect, useRef, useState } from 'react';
import { Menu, Skeleton } from 'antd';
import type { MenuProps } from 'antd';
import style from 'styled-components';
import WorshipedPersonCard from '@components/Common/WorshipedPersonCard';
import { startChannel, stopChannel } from '@store/worship/actions';
import { useAppDispatch } from '@store/hooks';
import { useAllWorshipQuery } from '@store/worship/worshipedPerson.generated';
import { OrderDirection, WorshipOrderField } from 'src/generated/types.generated';
import { useInfiniteWorship } from '@store/worship/useInfiniteWorship';
import InfiniteScroll from 'react-infinite-scroll-component';
import WorshipPersonCard from '@components/WorshipedPerson/WorshipPersonCard';

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

const StyledLiveBurnContainer = style.div`
  width: 640px;
  margin-top: 25px;
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(startChannel());
    return () => {
      stopChannel();
    };
  }, []);

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

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfiniteWorship(
    {
      first: 20,
      orderBy: {
        direction: OrderDirection.Desc,
        field: WorshipOrderField.UpdatedAt
      }
    },
    false
  );

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
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
      <StyledHeaderContainer>
        <StyledHeader>
          <StyledTextHeader ref={trendingRef}>Quan tâm nhiều trong ngày</StyledTextHeader>
          <StyledTextDesc>
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat{' '}
          </StyledTextDesc>
        </StyledHeader>
        <picture>
          <img alt="recent-trending" src="/images/recent-trending.svg" width="300px" />
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
      <StyledHeaderContainer>
        <StyledHeader>
          <StyledTextHeader ref={trendingRef}>Đốt trực típ</StyledTextHeader>
          <StyledTextDesc>
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat{' '}
          </StyledTextDesc>
        </StyledHeader>
        <picture>
          <img alt="recent-trending" src="/images/recent-trending.svg" width="300px" />
        </picture>
      </StyledHeaderContainer>
      <StyledLiveBurnContainer>
        <React.Fragment>
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreItems}
            hasMore={hasNext}
            loader={<Skeleton avatar active />}
            height={400}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>{"It's so empty here..."}</b>
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {data.map((item, index) => {
              return (
                <WorshipPersonCard
                  index={index}
                  item={item}
                  key={item.id}
                  isPublic={true}
                  worshipedPersonName={item.worshipedPerson.name}
                />
              );
            })}
          </InfiniteScroll>
        </React.Fragment>
      </StyledLiveBurnContainer>
    </React.Fragment>
  );
};

export default Home;
