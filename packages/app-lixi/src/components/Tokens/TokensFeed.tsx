import { CommentOutlined, DownOutlined, FireOutlined, UserOutlined } from '@ant-design/icons';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { Button, Dropdown, Menu, MenuProps, message, Space, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { Virtuoso } from 'react-virtuoso';
import PostListItem from '@components/Posts/PostListItem';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedTokenId } from '@store/tokens';

interface DataType {
  key: string;
  name: string;
  ticker: string;
  burn: number;
  comments: string;
  created: string;
  tags: string[];
}

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
  border: 1px solid rgba(128, 116, 124, 0.12);
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
  const tokenInfo = useAppSelector(getSelectedTokenId);
  console.log('TOKEN INFO', tokenInfo);

  useEffect(() => {
    // dispatch(fetchAllTokens–());
    // setTokensList([...tokenList]);
  }, []);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
      render: text => <a>{text}</a>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: text => <a>{text}</a>
    },
    {
      title: 'Burn XPI',
      dataIndex: 'burn',
      key: 'burn'
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments'
    },
    {
      title: 'Created',
      dataIndex: 'created',
      key: 'created'
    }
  ];

  let options = ['Withdraw', 'Rename', 'Export'];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext } = useInfinitePostsQuery(
    {
      first: 10
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
          <img src="/images/xpi.svg" alt="" />
        </div>
        <div className="info-ticker">
          <h4 className="title-ticker">{tokenInfo['ticker']}</h4>
          <p className="title-name">{tokenInfo['name']}</p>
          <div className="score-ticker">
            <span className="burn-index">
              <FireOutlined />{' '}
              {(parseInt(tokenInfo['lotusBurnDown']) + parseInt(tokenInfo['lotusBurnUp']) || 0) + ' XPI'}
            </span>
            {/* <span className="comments-index">
              <CommentOutlined /> 0 comments
            </span> */}
          </div>
        </div>
      </BannerTicker>

      <CreatePostCard></CreatePostCard>
      <SearchBox></SearchBox>

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
