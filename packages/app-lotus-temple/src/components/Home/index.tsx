import React, { useEffect, useRef, useState } from 'react';
import { Menu, Skeleton, Tabs, Segmented } from 'antd';
import type { MenuProps, TabsProps, SegmentedProps } from 'antd';
import style from 'styled-components';
import WorshipedPersonCard from '@components/Common/WorshipedPersonCard';
import { startChannel, stopChannel } from '@store/worship/actions';
import { useAppDispatch } from '@store/hooks';
import { useAllWorshipQuery, useWorshipedPeopleSpecialDateQuery } from '@store/worship/worshipedPerson.generated';
import { OrderDirection, WorshipOrderField, WorshipedPersonOrderField } from 'src/generated/types.generated';
import { useInfiniteWorship } from '@store/worship/useInfiniteWorship';
import InfiniteScroll from 'react-infinite-scroll-component';
import WorshipCard from '@components/WorshipedPerson/WorshipCard';
import SearchBox from '@components/Common/SearchBox';
import { useInfiniteWorshipedPerson } from '@store/worship/useInfiniteWorshipedPerson';
import { useInfiniteWorshipedPersonBySearch } from '@store/worship/useInfiniteWorshipedPersonBySearch';
import { FloatButton } from 'antd';

const StyledIcon = style.img`
  width: 15px;
  padding-bottom: 4px;
`;

const segmentedOptions: SegmentedProps['options'] = [
  {
    label: 'Ngày đặc biệt',
    value: 'specialDay',
    icon: (
      <picture>
        <StyledIcon alt="calendar-icon" src="/images/calendar-icon.svg" />
      </picture>
    )
  },
  {
    label: 'Quan tâm nhiều',
    value: 'trending',
    icon: (
      <picture>
        <StyledIcon alt="fire-icon" src="/images/fire-icon.svg" />
      </picture>
    )
  },
  {
    label: 'Đốt trực tiếp',
    value: 'liveBurn',
    icon: (
      <picture>
        <StyledIcon alt="fire-icon" src="/images/fire-icon.svg" />
      </picture>
    )
  }
];

const StyledSegmented = style(Segmented)`
  background: #E6E5E5;
  position: sticky;
  top: 0px;
  margin-bottom: 10px;
  z-index: 1;
  height: 48px;
  border-radius: 24px;

  .ant-segmented-group {
    font-weight: bold;
    align-items: center;
    font-size: 16px;
    .ant-segmented-item {
      border-radius: 24px;
      ::after {
        background-color: transparent;
      }

      .ant-segmented-item-label {
        line-height: 48px;
      }
    }

    .ant-segmented-item-selected {
      background-color: #EDE0DD;
      ::after {
        background-color: transparent;
      }
    }

    .ant-segmented-thumb {
      background-color: #EDE0DD;
      border-radius: 24px !important;
    }
  }

  @media (max-width: 480px) {
    display: none !important;
  }
`;

const StyledFloatButtonGroup = style(FloatButton.Group)`
  @media (min-width: 480px) {
    display: none;
  }
  bottom: 100px;
`;

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
  margin-top: 25px;
`;

const StyledCardContainer = style.div`
  display: grid;
  align-items: center;
  gap: 10px;
  grid-template-columns: auto auto;

  @media (max-width: 600px) {
    grid-template-columns: auto;
    gap: 0px;
  }
`;

const StyledContainer = style.div`
   display: flex;
`;

const StyledHeaderContainer = style.div`
  display: flex;
  margin-top: 25px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const StyledHeader = style.div`
  display: flex;
  flex-direction: column;
  width: 50%;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const StyledImage = style.img`
  width: 300px;

  @media (max-width: 600px) {
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
  }
`;

const StyledTextHeader = style.p`
  margin: 0px 0px 6px 0px;
  font-weight: 700;
  font-size: 24px;
  text-align: left;
  scroll-margin-top: 70px;

  @media (max-width: 480px) {
    scroll-margin-top: 0px;
  }
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
  const [disableFetch, setDisableFetch] = useState<boolean>(true);

  useEffect(() => {
    dispatch(startChannel());
    return () => {
      stopChannel();
    };
  }, []);

  const onSegmentedChange = value => {
    setCurrent(value);

    switch (value) {
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
      },
      disableFetch: disableFetch
    },
    false
  );

  const {
    data: queryData,
    fetchNext: queryFetchNext,
    hasNext: queryHasNext,
    isFetching: queryIsFetching,
    isFetchingNext: queryIsFetchingNext,
    refetch: queryRefetch,
    isLoading: queryIsLoading
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
    if (key === 'search') {
      setDisableFetch(false);
    } else {
      setDisableFetch(true);
    }
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
          <StyledSegmented
            block
            options={segmentedOptions}
            onResize={undefined}
            onResizeCapture={undefined}
            defaultValue={'specialDay'}
            onChange={onSegmentedChange}
          />
          {/* Ngày đặc biệt đã đến */}
          <StyledHeaderContainer>
            <StyledHeader>
              <StyledTextHeader ref={specialDayRef}>Ngày đặc biệt đã đến</StyledTextHeader>
              <StyledTextDesc>
                Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat{' '}
              </StyledTextDesc>
            </StyledHeader>
            <picture>
              <StyledImage alt="lotus-calendar" src="/images/lotus-calendar.svg" />
            </picture>
          </StyledHeaderContainer>
          <StyledCardContainer>
            {worshipedPersonSpecialDate &&
              worshipedPersonSpecialDate.allWorshipedPersonSpecialDate.edges.map((person, index) => {
                return <WorshipedPersonCard key={index} person={person.node} isSpecialDate={true} />;
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
              <StyledImage alt="recent-trending" src="/images/recent-trending.svg" />
            </picture>
          </StyledHeaderContainer>
          <StyledCardContainer>
            {worshipedPersonSpecialDate &&
              worshipedPersonSpecialDate.allWorshipedPersonSpecialDate.edges.map((person, index) => {
                return <WorshipedPersonCard key={index} person={person.node} />;
              })}
          </StyledCardContainer>
          {/* Đốt trực tiếp */}
          <StyledHeaderContainer>
            <StyledHeader>
              <StyledTextHeader ref={liveBurnRef}>Đốt trực tiếp</StyledTextHeader>
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
                height={500}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <b>{"It's so empty here..."}</b>
                  </p>
                }
                scrollableTarget="scrollableDiv"
              >
                {data.map((item, index) => {
                  return (
                    <WorshipCard
                      index={index}
                      item={item}
                      key={item.id}
                      isPublic={true}
                      worshipedPersonName={item.worshipedPerson.name}
                      worshipedPersonId={item.worshipedPerson.id}
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
      key: 'search',
      children: (
        <React.Fragment>
          <StyledContainer>
            <SearchBox search={searchPerson} value={searchValue} loading={queryIsLoading} />
          </StyledContainer>
          <React.Fragment>
            {!searchValue ? (
              <InfiniteScroll
                dataLength={personData.length}
                next={loadMorePeople}
                hasMore={personHasNext}
                loader={<Skeleton avatar active style={{ marginTop: 20 }} />}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <b>{"It's so empty here..."}</b>
                  </p>
                }
                scrollableTarget="scrollableDiv"
                scrollThreshold={0.7}
              >
                {personData.map((person, index) => {
                  return <WorshipedPersonCard key={index} person={person} />;
                })}
              </InfiniteScroll>
            ) : queryIsLoading ? (
              <Skeleton avatar active style={{ marginTop: 20 }} />
            ) : (
              <InfiniteScroll
                dataLength={queryData.length}
                next={loadMoreSearchPeople}
                hasMore={queryHasNext}
                loader={<Skeleton avatar active style={{ marginTop: 20 }} />}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <b>{"It's so empty here..."}</b>
                  </p>
                }
                scrollableTarget="scrollableDiv"
                scrollThreshold={0.7}
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
      {disableFetch && (
        <StyledFloatButtonGroup shape="circle">
          <FloatButton
            onClick={() => specialDayRef.current.scrollIntoView()}
            icon={<StyledIcon alt="calendar-icon" src="/images/calendar-icon.svg" />}
          />
          <FloatButton
            onClick={() => trendingRef.current.scrollIntoView()}
            icon={<StyledIcon alt="fire-icon" src="/images/fire-icon.svg" />}
          />
          <FloatButton
            onClick={() => liveBurnRef.current.scrollIntoView()}
            icon={<StyledIcon alt="fire-icon" src="/images/fire-icon.svg" />}
          />
        </StyledFloatButtonGroup>
      )}
    </React.Fragment>
  );
};

export default Home;
