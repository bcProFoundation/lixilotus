import { CopyOutlined, DownOutlined, FireOutlined } from '@ant-design/icons';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { currency } from '@components/Common/Ticker';
import PostListItem, { IconBurn } from '@components/Posts/PostListItem';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsByTokenIdQuery } from '@store/post/useInfinitePostsByTokenIdQuery';
import { getSelectedToken, getToken } from '@store/token';
import { useTokenQuery } from '@store/token/tokens.api';
import { formatBalance } from '@utils/cashMethods';
import { Button, Dropdown, Image, Menu, MenuProps, message, notification, Skeleton, Space, Tabs, TimePicker } from 'antd';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField, Token } from 'src/generated/types.generated';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import UpVoteSvg from '@assets/icons/upVotePurple.svg';
import { InfoSubCard } from '@components/Lixi';
import moment from 'moment';
import intl from 'react-intl-universal';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getFilterPostsToken } from '@store/settings/selectors';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { getSelectedAccountId } from '@store/account/selectors';
import Ticker from '@bcpros/lixi-components/src/atoms/Ticker';
import { LikeOutlined } from '@ant-design/icons';
const StyledTokensFeed = styled.div`
  .content {
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-top: 1rem;
    .ant-tabs {
      flex: 1;
      .ant-tabs-nav {
        &::before {
          content: none;
        }
      }
    }
    .filter {
      position: absolute;
      right: 0;
      top: 10px;
    }
  }
  @media (max-width: 960px) {
    padding-bottom: 7rem;
  }
`;

const BannerTicker = styled.div`
  padding: 2rem;
  background-image: url(/images/xec-home-bg.svg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid var(--boder-item-light);
  border-radius: 24px;
  .banner-detail {
    display: flex;
    gap: 2rem;
    .avatar-ticker {
      img {
        width: 120px;
        height: 120px;
      }
    }
    // css reponsive Show more info in token page
    .info-ticker {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .info-ticker__left{
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: flex-start;
      }
      .info-ticker__right{
        margin-right: 150px;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: flex-start ;
      }
      .title-ticker {
        margin: 0;
        font-size: 28px;
        line-height: 40px;
        color: #fff;
      }
      .ant-space {
        flex-direction: row;
        justify-content: center;
        align-items: baseline;
        .type-name {
          min-width: 100px;
          text-align: left;
          color: #edeff099;
        }
        .content {
          margin-top: 4px;
          color: #fff;
          .anticon {
            margin-left: 4px;
          }
        }
      }
      @media (max-width: 650px) {
        flex-direction: column;
      }
    }
    @media (max-width: 960px) {
      flex-direction: column;
    }
  }
  .score-ticker {
    margin-left: 60rem;
    display: inline-flex;
    margin-top: 1rem;
    .count {
      color: #edeff099 !important;
    }
    span {
      color: #edeff099 !important;
    }
    span {
      font-size: 14px;
      line-height: 28px;
      color: #4e444b;
      &.burn-index {
        margin-right: 2rem;
      }
    }
  }
  @media (max-width: 960px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
`;

type TokenProps = {
  token: any;
  isMobile: boolean;
};

const TokensFeed = ({ token, isMobile }: TokenProps) => {
  const dispatch = useAppDispatch();
  const [tokenDetailData, setTokenDetailData] = useState<any>(token);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const filterValue = useAppSelector(getFilterPostsToken);

  let options = ['Withdraw', 'Rename', 'Export'];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByTokenIdQuery(
    {
      first: 10,
      minBurnFilter: filterValue ?? 1,
      accountId: selectedAccountId ?? null,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      },
      id: token.id
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

  const handleMenuClick: MenuProps['onClick'] = e => {
    message.info('Click on menu item.');
    console.log('click', e);
  };

  const handleOnCopy = (id: string) => {
    notification.info({
      message: intl.get('token.copyId'),
      description: id,
      placement: 'top'
    });
  };

  const menus = options.map(option => <Menu.Item key={option}>{option}</Menu.Item>);

  const UpvoteIcon = () => {
    return (
      <>
        <UpVoteSvg />
      </>
    );
  };

  return (
    <StyledTokensFeed>
      <BannerTicker>
        <div className="banner-detail">
          <div className="avatar-ticker">
            <Image
              width={120}
              height={120}
              src={`${currency.tokenIconsUrl}/128/${tokenDetailData.tokenId}.png`}
              fallback={makeBlockie(tokenDetailData?.tokenId ?? '')}
              preview={false}
            />
          </div>
          {/* Show more info in token page */}
          <div className="info-ticker">
            <div className='info-ticker__left'>
              <h4 className="title-ticker">{tokenDetailData['ticker']}</h4>
              <InfoSubCard typeName={intl.get('token.ticker')} content={tokenDetailData.ticker} />
              <InfoSubCard typeName={intl.get('token.name')} content={tokenDetailData.name} />
              <InfoSubCard typeName={intl.get('token.burntxpi')} content={tokenDetailData.lotusBurnUp} />
            </div>
            <div className='info-ticker__right'>
              <CopyToClipboard text={tokenDetailData.tokenId} onCopy={() => handleOnCopy(tokenDetailData.tokenId)}>
                <InfoSubCard
                  typeName={intl.get('token.id')}
                  content={tokenDetailData.tokenId.slice(0, 7) + '...' + tokenDetailData.tokenId.slice(-7)}
                  icon={CopyOutlined}
                  onClickIcon={() => { }}
                />
              </CopyToClipboard>
              <InfoSubCard
                typeName={intl.get('token.created')}
                content={moment(tokenDetailData.createdDate).format('YYYY-MM-DD HH:MM')}
              />
              <InfoSubCard
                typeName={intl.get('token.comments')}
                content={moment(tokenDetailData.comments).format('YYYY-MM-DD HH:MM')}
              />
            </div>
          </div>
        </div>
        <div className="score-ticker">
          <LikeOutlined style={{ marginRight: '10px', fontSize: '1.2rem' }}
          />
          <IconBurn
            imgUrl="/images/ico-burn-up.svg"
            burnValue={formatBalance(tokenDetailData?.lotusBurnUp ?? 0)}
            key={`list-vertical-upvote-o-${tokenDetailData.id}`}
            dataItem={tokenDetailData}
            onClickIcon={() => { }}
          />
        </div>
      </BannerTicker>

      <CreatePostCard tokenPrimaryId={tokenDetailData.id} refetch={() => refetch()} />
      <SearchBar>
        <SearchBox />
        <FilterBurnt filterForType={FilterType.PostsToken} />
      </SearchBar>

      <div className="content">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Top discussions" key="1">
            <React.Fragment>
              <InfiniteScroll
                dataLength={data.length}
                next={loadMoreItems}
                hasMore={hasNext}
                loader={<Skeleton avatar active />}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <p>{data.length > 0 ? 'end reached' : "It's so empty here..."}</p>
                  </p>
                }
                scrollableTarget="scrollableDiv"
              >
                {data.map((item, index) => {
                  return <PostListItem index={index} item={item} />;
                })}
              </InfiniteScroll>
            </React.Fragment>
            {/* <div className={'listing'} style={{ height: '100vh' }}>
              <Virtuoso
                className={'listing'}
                style={{ height: '100%' }}
                data={data}
                endReached={loadMoreItems}
                overscan={900}
                itemContent={(index, item) => {
                  return <PostListItem index={index} item={item} />;
                }}
                totalCount={totalCount}
                components={{
                  Footer: () => {
                    return (
                      <div
                        style={{
                          padding: '1rem',
                          textAlign: 'center'
                        }}
                      >
                        end reached
                      </div>
                    );
                  }
                }}
              />
            </div> */}
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab="Most recent" key="2">
            Content of Tab Pane 2
          </Tabs.TabPane> */}
        </Tabs>
        <div className="filter">
          {/* <Dropdown overlay={<Menu onClick={e => handleMenuClick(e)}>{menus}</Menu>}>
            <Button type="primary" className="outline-btn">
              <Space>
                All favorables
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown> */}
        </div>
      </div>
    </StyledTokensFeed>
  );
};

export default TokensFeed;
