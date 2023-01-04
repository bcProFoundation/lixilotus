import { DownOutlined, FireOutlined } from '@ant-design/icons';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { currency } from '@components/Common/Ticker';
import PostListItem from '@components/Posts/PostListItem';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsByTokenIdQuery } from '@store/post/useInfinitePostsByTokenIdQuery';
import { getSelectedToken } from '@store/tokens';
import { formatBalance } from '@utils/cashMethods';
import { Button, Dropdown, Image, Menu, MenuProps, message, Space, Tabs } from 'antd';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import styled from 'styled-components';

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
`;

const BannerTicker = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(0deg, rgba(158, 42, 156, 0.14), rgba(158, 42, 156, 0.14)), #fffbff;
  border: 1px solid var(--boder-item-light);
  border-radius: 24px;
  .avatar-ticker {
    img {
      width: 120px;
      height: 120px;
    }
  }
  .info-ticker {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;
    .title-ticker {
      margin: 0;
      font-size: 28px;
      line-height: 40px;
      color: #1e1a1d;
    }
    .score-ticker {
      span {
        font-size: 16px;
        line-height: 28px;
        color: #4e444b;
        &.burn-index {
          margin-right: 2rem;
        }
      }
    }
  }
`;

const TokensFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const tokenInfo = useAppSelector(getSelectedToken);
  console.log('TOKEN INFO', tokenInfo);

  let options = ['Withdraw', 'Rename', 'Export'];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByTokenIdQuery(
    {
      first: 10,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      },
      id: tokenInfo.id
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

  const menus = options.map(option => <Menu.Item key={option}>{option}</Menu.Item>);

  return (
    <StyledTokensFeed>
      <BannerTicker>
        <div className="avatar-ticker">
          <Image
            width={120}
            height={120}
            src={`${currency.tokenIconsUrl}/128/${tokenInfo.tokenId}.png`}
            fallback={makeBlockie(tokenInfo?.tokenId ?? '')}
            preview={false}
          />
        </div>
        <div className="info-ticker">
          <h4 className="title-ticker">{tokenInfo['ticker']}</h4>
          <p className="title-name">{tokenInfo['name']}</p>
          <div className="score-ticker">
            <span className="burn-index">
              <FireOutlined /> {formatBalance(tokenInfo.lotusBurnDown + tokenInfo.lotusBurnUp) + ' XPI'}
            </span>
          </div>
        </div>
      </BannerTicker>

      <CreatePostCard tokenPrimaryId={tokenInfo.id} refetch={() => refetch()} />
      <SearchBox />

      <div className="content">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Top discussions" key="1">
            <div className={'listing'} style={{ height: '100vh' }}>
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
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Most recent" key="2">
            Content of Tab Pane 2
          </Tabs.TabPane>
        </Tabs>
        <div className="filter">
          <Dropdown overlay={<Menu onClick={e => handleMenuClick(e)}>{menus}</Menu>}>
            <Button type="primary" className="outline-btn">
              <Space>
                All favorables
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </div>
      </div>
    </StyledTokensFeed>
  );
};

export default TokensFeed;
