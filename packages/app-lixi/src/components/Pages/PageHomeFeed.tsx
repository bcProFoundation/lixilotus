import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import { useInfinitePagesByFollowerIdQuery } from '@store/page/useInfinitePagesByFollowerIdQuery';
import { useInfinitePagesByUserIdQuery } from '@store/page/useInfinitePagesByUserIdQuery';
import { Button, Skeleton } from 'antd';
import SearchBox from '@components/Common/SearchBox';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccountId } from '@store/account/selectors';
import Link from 'next/link';
import { push } from 'connected-next-router';
import { Virtuoso } from 'react-virtuoso';
import { openModal } from '@store/modal/actions';
import intl from 'react-intl-universal';
import { getAllCategories } from '@store/category/selectors';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getCategories } from '@store/category/actions';
import { OrderDirection, PageOrderField } from '@generated/types.generated';
import { usePagesByUserIdQuery } from '../../../../redux-store/src/store/page/pages.generated';
import { DEFAULT_CATEGORY } from '@bcpros/lixi-models/constants/category';

const StyledPageFeed = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
  h2 {
    text-align: left;
    margin-bottom: 1rem;
  }
  .ant-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &.show-scroll {
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
      box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
      border-radius: 100px;
    }
  }
  @media (max-width: 960px) {
    padding-bottom: 7rem;
  }
`;

const ToolboxBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  div:not(.btn-search) {
    padding: 8px;
    flex-grow: 1;
  }
  .anticon {
    font-size: 18px;
  }
  .ant-btn {
    margin-left: 1rem;
    height: 35px;
    padding: 0 8px;
  }
  @media (max-width: 768px) {
    grid-template-columns: auto;
    .ant-btn {
      width: 50%;
      margin: auto;
      margin-top: 1rem;
    }
  }
`;

const BlankPage = styled.div`
display: flex;
background: #FFFFFF;
border: 1px solid var(--boder-item-light);
border-radius: 24px;
padding: 2rem 3rem;

img {
    border-radius: 20%;
}
div {
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    .ant-btn {
        width: 50%;
    }
}
}
@media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PagesContainer = styled.div`
  margin-top: 1rem;
  h2 {
    font-size: 22px;
  }
`;

const YourPageContainer = styled.div`
  margin-top: 1rem;
  h2 {
    font-size: 22px;
  }
  .sub-page {
    font-weight: 400;
    font-size: 14px;
    letter-spacing: 0.5px;
    color: rgba(30, 26, 29, 0.6);
  }
  @media (max-width: 9608px) {
    .container-img {
      img {
        width: 100% !important;
        height: 100px !important;
      }
    }
  }
`;

const ListCard = styled.div`
  .infinite-scroll-component__outerdiv {
    padding-bottom: 2rem;
    .infinite-scroll-component {
      display: grid !important;
      grid-template-columns: auto auto auto !important;
      grid-gap: 10px !important;
      @media (max-width: 768px) {
        grid-template-columns: auto auto !important;
      }
    }
  }
`;

const StyledCardPage = styled.div`
  cursor: pointer;
  max-width: 264px;
  .cover-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;
    @media (max-width: 768px) {
      width: 185px;
      height: 75px;
      object-fit: cover;
    }
  }
  .info-profile {
    display: flex;
    position: relative;
    justify-content: space-between;
    padding: 1rem 2rem 1rem 0;
    background: #fff;
    flex-direction: column;
    align-items: center;
    padding-right: 0;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    border: 1px solid var(--boder-item-light);
    .wrapper-avatar {
      left: auto;
      top: -35px;
      position: absolute;
      padding: 1px;
      background: #fff;
      border-radius: 50%;
      .avatar-img {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
      }
    }
    .title-profile {
      margin-left: 0;
      margin-top: 1rem;
      text-align: center;
      .page-name {
        font-weight: 500;
        font-size: 14px;
        line-height: 24px;
        letter-spacing: 0.15px;
        color: #1e1a1d;
        margin: 0;
      }
      .page-category {
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: rgba(30, 26, 29, 0.6);
      }
      .sub-text {
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.4px;
        color: rgba(30, 26, 29, 0.6);
        margin: 0;
      }
    }
  }
`;

const ListContainer = styled.div`
  display: grid !important;
  grid-template-columns: auto auto auto !important;
  grid-gap: 10px !important;
  @media (max-width: 768px) {
    grid-template-columns: auto auto !important;
  }
`;

type CardPageItem = {
  index?: number;
  id?: any;
  name?: string;
  category?: string;
  cover?: string;
  avatar?: string;
  totalBurnForPage?: number;
};

const CardPageItem = ({ item, onClickItem }: { item?: CardPageItem; onClickItem?: (id) => void }) => (
  <StyledCardPage onClick={() => onClickItem(item.id)} key={item.id}>
    <div className="container-img">
      <picture>
        <img loading="eager" className="cover-img" src={item.cover || '/images/default-cover.jpg'} alt="cover-img" />
      </picture>
    </div>
    <div className="info-profile">
      <div className="wrapper-avatar">
        <picture>
          <img
            loading="eager"
            className="avatar-img"
            src={item.avatar || '/images/default-avatar.jpg'}
            alt="avatar-img"
          />
        </picture>
      </div>
      <div className="title-profile">
        <h3 className="page-name">
          {item.index ? '#' + item.index : ''} {item.name}
        </h3>
        <p className="page-category">{item.category}</p>
        {item.totalBurnForPage && (
          <p className="sub-text">
            {item.totalBurnForPage > 0
              ? `${item.totalBurnForPage} ${intl.get('page.xpiHasBurned')}`
              : intl.get('page.noXpiHasBurned')}
          </p>
        )}
      </div>
    </div>
  </StyledCardPage>
);

const PageHome = () => {
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const dispatch = useAppDispatch();
  const categories = useAppSelector(getAllCategories);
  const refPagesListing = useRef<HTMLDivElement | null>(null);
  const currentUserPages = usePagesByUserIdQuery({ id: selectedAccountId }).currentData;

  useEffect(() => {
    dispatch(getCategories());
  }, []);

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePagesQuery(
    {
      first: 10,
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PageOrderField.LotusBurnScore
        },
        {
          direction: OrderDirection.Desc,
          field: PageOrderField.TotalPostsBurnScore
        }
      ]
    },
    false
  );

  const {
    data: userPage,
    fetchNext: userPageFetchNext,
    hasNext: userPageHasNext,
    isFetching: usePageIsFetching
  } = useInfinitePagesByUserIdQuery(
    {
      first: 10,
      id: selectedAccountId
    },
    false
  );

  const {
    data: pageFollowings,
    fetchNext: pageFollowingsFetchNext,
    hasNext: pageFollowingsHasNext,
    isFetching: pageFollowingsIsFetching
  } = useInfinitePagesByFollowerIdQuery(
    {
      first: 10,
      id: selectedAccountId
    },
    false
  );

  const getCategoryName = (item: number) => {
    const categoryLang = (categories.length > 0 && categories.find(category => category.id == item).name) ?? 'art';
    return intl.get('category.' + categoryLang);
  };

  const mapPageItem = (pageItem, index?: number) => {
    let newItemObj: CardPageItem = {
      index: index + 1,
      id: pageItem?.id,
      name: pageItem?.name,
      avatar: pageItem?.avatar,
      cover: pageItem?.cover,
      totalBurnForPage: pageItem?.totalBurnForPage,
      category: pageItem.categoryId ? getCategoryName(pageItem.categoryId) : getCategoryName(DEFAULT_CATEGORY)
    };
    return newItemObj;
  };

  const routerPageDetail = id => {
    dispatch(push(`/page/${id}`));
  };

  const loadMoreUserPages = () => {
    if (userPageHasNext && !usePageIsFetching) {
      userPageFetchNext();
    } else if (userPageHasNext) {
      userPageFetchNext();
    }
  };

  const loadMorePageFollowings = () => {
    if (pageFollowingsHasNext && !pageFollowingsIsFetching) {
      pageFollowingsFetchNext();
    } else if (pageFollowingsHasNext) {
      pageFollowingsFetchNext();
    }
  };

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  const triggerSrollbar = e => {
    const virtuosoNode = refPagesListing.current || null;
    virtuosoNode.classList.add('show-scroll');
    setTimeout(() => {
      virtuosoNode.classList.remove('show-scroll');
    }, 700);
  };

  const onCreatePage = () => {
    dispatch(openModal('CreatePageModal', { account: selectedAccountId }));
  };

  return (
    <>
      <StyledPageFeed ref={refPagesListing} onScroll={e => triggerSrollbar(e)}>
        <YourPageContainer>
          <BlankPage>
            <picture>
              <img src="/images/page-blank.svg" alt="page-blank-placeholder" />
            </picture>
            <div>
              <p className="sub-page">{intl.get('text.createPage')} </p>
              <Button type="primary" className="outline-btn" onClick={onCreatePage}>
                {intl.get('page.createYourPage')}
              </Button>
            </div>
          </BlankPage>
          <h2>{currentUserPages && currentUserPages.allPagesByUserId.edges.length > 0 && intl.get('page.yourPage')}</h2>
          <ListCard>
            <InfiniteScroll
              dataLength={userPage.length}
              next={loadMoreUserPages}
              hasMore={userPageHasNext}
              loader={<Skeleton avatar active />}
              scrollableTarget="scrollableDiv"
            >
              {userPage.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <CardPageItem key={item.id} item={mapPageItem(item)} onClickItem={routerPageDetail} />
                  </React.Fragment>
                );
              })}
            </InfiniteScroll>
          </ListCard>
        </YourPageContainer>

        {/* Page Followings */}
        <PagesContainer>
          <h2>{pageFollowings.length > 0 && intl.get('general.youFollow')}</h2>
          <ListCard>
            <React.Fragment>
              <InfiniteScroll
                dataLength={pageFollowings.length}
                next={loadMorePageFollowings}
                hasMore={pageFollowingsHasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableDiv"
              >
                {pageFollowings.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <CardPageItem item={mapPageItem(item)} onClickItem={id => routerPageDetail(id)} />
                    </React.Fragment>
                  );
                })}
              </InfiniteScroll>
            </React.Fragment>
          </ListCard>
        </PagesContainer>

        {/* Discover */}
        <PagesContainer>
          <h2>{intl.get('page.discover')}</h2>
          <ListCard>
            <React.Fragment>
              <InfiniteScroll
                dataLength={data.length}
                next={loadMoreItems}
                hasMore={hasNext}
                loader={<Skeleton avatar active />}
                scrollableTarget="scrollableDiv"
              >
                {data.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <CardPageItem item={mapPageItem(item, index)} onClickItem={id => routerPageDetail(id)} />
                    </React.Fragment>
                  );
                })}
              </InfiniteScroll>
            </React.Fragment>
          </ListCard>
        </PagesContainer>
      </StyledPageFeed>
    </>
  );
};

export default PageHome;
