import React, { useEffect, useRef, useState } from 'react';
import { Menu, Skeleton, Tabs } from 'antd';
import type { MenuProps, TabsProps } from 'antd';
import style from 'styled-components';
import WorshipedPersonCard from '@components/Common/WorshipedPersonCard';
import { startChannel, stopChannel } from '@store/worship/actions';
import { useAppDispatch } from '@store/hooks';
import { useAllWorshipQuery, useWorshipedPeopleSpecialDateQuery } from '@store/worship/worshipedPerson.generated';
import { OrderDirection, WorshipOrderField, WorshipedPersonOrderField } from 'src/generated/types.generated';
import { useInfiniteWorship } from '@store/worship/useInfiniteWorship';
import InfiniteScroll from 'react-infinite-scroll-component';
import WorshipPersonCard from '@components/WorshipedPerson/WorshipCard';
import SearchBox from '@components/Common/SearchBox';
import { useInfiniteWorshipedPerson } from '@store/worship/useInfiniteWorshipedPerson';
import { useInfiniteWorshipedPersonBySearch } from '@store/worship/useInfiniteWorshipedPersonBySearch';

const items: MenuProps['items'] = [
  {
    label: 'Ngày đặc biệt',
    key: 'specialDay'
  },
  {
    label: 'Quan tâm nhiều',
    key: 'trending'
  },
  {
    label: 'Đốt trực tiếp',
    key: 'liveBurn'
  }
];

const StyledMenu = style(Menu)`
  width: 620px;
  background: #FAF0FA;
  display: flex;
  position: sticky;
  justify-content: center;
  top: 0;
  margin-bottom: 10px;
  z-index: 1;

  .ant-menu-item {
    color: rgb(180,180,180);
    margin-left: 20px;
    margin-right: 20px;
  }
  .ant-menu-item-selected {
    font-weight: bold;
    font-size: 16px;
  }
`;

const StyledLiveBurnContainer = style.div`
  width: 640px;
  margin-top: 25px;
`;

const StyledCardContainer = style.div`
   width: 640px;
   display: grid;
   align-items: center;
   gap: 10px;
   grid-template-columns: auto auto
`;

const StyledContainer = style.div`
   width: 640px;
   display: flex;
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

const StyledTab = style(Tabs)`
  margin-top: 10px;
`;

const Home = () => {
  const [current, setCurrent] = useState('specialDay');
  const specialDayRef = useRef(null);
  const trendingRef = useRef(null);
  const liveBurnRef = useRef(null);
  const dispatch = useAppDispatch();
  const worshipedPersonSpecialDate = useWorshipedPeopleSpecialDateQuery().currentData;
  const [searchValue, setSearchValue] = useState<string | null>(null);

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
      case 'liveBurn':
        liveBurnRef.current.scrollIntoView();
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

  const {
    data: personData,
    totalCount: personTotalCount,
    fetchNext: personFetchNext,
    hasNext: personHasNext,
    isFetching: personIsFetching,
    isFetchingNext: personIsFetchingNext,
    refetch: personRefetch
  } = useInfiniteWorshipedPerson(
    {
      first: 20,
      orderBy: {
        direction: OrderDirection.Desc,
        field: WorshipedPersonOrderField.UpdatedAt
      }
    },
    false
  );

  const {
    data: queryData,
    fetchNext: queryFetchNext,
    hasNext: queryHasNext,
    isFetching: queryIsFetching,
    isFetchingNext: queryIsFetchingNext,
    refetch: queryRefetch
  } = useInfiniteWorshipedPersonBySearch(
    {
      first: 20,
      query: searchValue,
      orderBy: {
        direction: OrderDirection.Desc,
        field: WorshipedPersonOrderField.UpdatedAt
      }
    },
    false
  );

  const loadMoreSearchPeople = () => {
    if (queryHasNext && !queryIsFetching) {
      queryFetchNext();
    } else if (queryHasNext) {
      queryFetchNext();
    }
  };

  const loadMorePeople = () => {
    if (personHasNext && !personIsFetching) {
      personFetchNext();
    } else if (personHasNext) {
      personFetchNext();
    }
  };

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const onChange = (key: string) => {
    console.log(key);
  };

  const searchPerson = value => {
    setSearchValue(value);
  };

  const tabItems: TabsProps['items'] = [
    {
      label: 'Trang chủ',
      key: 'home',
      children: (
        <React.Fragment>
          <StyledMenu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
          {/* Ngày đặc biệt đã đến */}
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
            {worshipedPersonSpecialDate &&
              worshipedPersonSpecialDate.allWorshipedPersonSpecialDate.edges.map((person, index) => {
                return <WorshipedPersonCard key={index} person={person.node} />;
              })}
          </StyledCardContainer>
          {/* Quan tâm nhiều trong ngày */}
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
            {worshipedPersonSpecialDate &&
              worshipedPersonSpecialDate.allWorshipedPersonSpecialDate.edges.map((person, index) => {
                return <WorshipedPersonCard key={index} person={person.node} />;
              })}
          </StyledCardContainer>
          {/* Đốt trực típ */}
          <StyledHeaderContainer>
            <StyledHeader>
              <StyledTextHeader ref={liveBurnRef}>Đốt trực típ</StyledTextHeader>
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
      )
    },
    {
      label: 'Tìm kiếm',
      key: 'info',
      children: (
        <React.Fragment>
          <StyledContainer>
            <SearchBox search={searchPerson} value={searchValue} />
          </StyledContainer>
          <React.Fragment>
            {!searchValue ? (
              <InfiniteScroll
                dataLength={personData.length}
                next={loadMorePeople}
                hasMore={personHasNext}
                loader={<Skeleton avatar active />}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <b>{"It's so empty here..."}</b>
                  </p>
                }
                scrollableTarget="scrollableDiv"
              >
                {personData.map((person, index) => {
                  return <WorshipedPersonCard key={index} person={person} />;
                })}
              </InfiniteScroll>
            ) : (
              <InfiniteScroll
                dataLength={queryData.length}
                next={loadMoreSearchPeople}
                hasMore={queryHasNext}
                loader={<Skeleton avatar active />}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <b>{"It's so empty here..."}</b>
                  </p>
                }
                scrollableTarget="scrollableDiv"
              >
                {queryData.map((person, index) => {
                  return <WorshipedPersonCard key={index} person={person} />;
                })}
              </InfiniteScroll>
            )}
          </React.Fragment>
        </React.Fragment>
      )
    }
  ];

  return (
    <React.Fragment>
      <StyledTab defaultActiveKey="1" items={tabItems} onChange={onChange} />
    </React.Fragment>
  );
};

export default Home;
