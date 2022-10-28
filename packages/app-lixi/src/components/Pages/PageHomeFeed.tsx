import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import { Button } from 'antd';
import SearchBox from '@components/Common/SearchBox';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccountId } from '@store/account/selectors';
import Link from 'next/link';
import { push } from 'connected-next-router';

const StyledPageFeed = styled.div`
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
`;

const ToolboxBar = styled.div`
  display: grid;
  grid-template-columns: 80% 20%;
  align-items: center;
  div:not(.btn-search) {
    padding: 8px;
  }
  .anticon {
    font-size: 18px;
  }
  .ant-btn {
    margin-left: 2rem;
    height: 35px;
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
border: 1px solid rgba(128, 116, 124, 0.12);
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
`;

const YourPageContainer = styled.div`
  margin-top: 1rem;
`;

const ListCard = styled.div`
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  grid-gap: 10px;
  @media (max-width: 768px) {
    grid-template-columns: auto auto;
  }
`;

const StyledCardPage = styled.div`
  max-width: 290px;
  .cover-img {
    width: 285px;
    height: 150px;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;
    @media (max-width: 768px) {
      width: 185px;
      height: 75px;
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
    border: 1px solid rgba(128, 116, 124, 0.12);
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
      }
    }
    .title-profile {
      margin-left: 0;
      margin-top: 1rem;
      text-align: center;
      .page-name {
        font-weight: 500;
        font-size: 16px;
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

type CardPageItem = {
  id?: any;
  name?: string;
  category?: string;
  subText?: string;
  cover?: string;
  avatar?: string;
};

const CardPageItem = ({ item, onClickItem }: { item?: CardPageItem; onClickItem: (id) => void }) => (
  <StyledCardPage onClick={() => onClickItem(item.id)}>
    <div className="container-img">
      <img className="cover-img" src={item.cover || '/images/default-cover.jpg'} alt="" />
    </div>
    <div className="info-profile">
      <div className="wrapper-avatar">
        <img className="avatar-img" src={item.avatar || '/images/default-avatar.jpg'} alt="" />
      </div>
      <div className="title-profile">
        <h3 className="page-name">{item.name}</h3>
        <p className="page-category">{item.category}</p>
        <p className="sub-text">{item.subText + ' people like this page' || '24 people like this page'}</p>
      </div>
    </div>
  </StyledCardPage>
);

const PageHome = () => {
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [selectedPage, setSelectedPage] = useState<any>();
  const [listsPage, setListsPage] = useState<any>([]);
  const dispatch = useAppDispatch();

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext } = useInfinitePagesQuery(
    {
      first: 10
    },
    false
  );

  useEffect(() => {
    setListsPage(data);
    // get page by account
    const page = data.find(page => page.pageAccountId === selectedAccountId);
    setSelectedPage(page || null);
  }, [data]);

  const mapPageItem = pageItem => {
    let newItemObj: CardPageItem = {
      id: pageItem?.id,
      name: pageItem?.name,
      avatar: pageItem?.avatar?.upload?.url || pageItem?.avatar,
      cover: pageItem?.cover?.upload?.url || pageItem?.cover,
      subText: Math.floor(Math.random() * 100).toString(),
      category: 'Food & Drink'
    };
    return newItemObj;
  };

  const routerPageDetail = id => {
    dispatch(push(`/page/${id}`));
  };

  return (
    <>
      <StyledPageFeed>
        {listsPage && listsPage.length > 0 && (
          <ToolboxBar>
            <SearchBox></SearchBox>
            <Link href="/page/create" passHref>
              <Button type="primary" className="outline-btn">
                Create your page
              </Button>
            </Link>
          </ToolboxBar>
        )}
        <YourPageContainer>
          <h2>Your page</h2>
          {!selectedPage && (
            <BlankPage>
              <img src="/images/page-blank.svg" alt="" />
              <div>
                <p>
                  A Page is a space where people can publicly connect with your business, personal brand or
                  organisation. You can do things such as showcase products and services, collect donations{' '}
                </p>
                <Link href="/page/create" passHref>
                  <Button type="primary" className="outline-btn">
                    Create your page
                  </Button>
                </Link>
              </div>
            </BlankPage>
          )}
          {selectedPage && (
            <ListCard>
              <CardPageItem item={mapPageItem(selectedPage)} onClickItem={() => {}}></CardPageItem>
            </ListCard>
          )}
        </YourPageContainer>
        <PagesContainer>
          <h2>Discover</h2>
          <ListCard>
            {listsPage &&
              listsPage.length > 0 &&
              listsPage.map((item: any, index: number) => {
                if (index < 9)
                  return (
                    <CardPageItem item={mapPageItem(item)} onClickItem={id => routerPageDetail(id)}></CardPageItem>
                  );
              })}
          </ListCard>
        </PagesContainer>
      </StyledPageFeed>
    </>
  );
};

export default PageHome;
