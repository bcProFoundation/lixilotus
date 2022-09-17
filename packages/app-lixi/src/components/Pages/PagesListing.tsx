import { CommentOutlined, DislikeOutlined, FilterOutlined, LikeOutlined } from '@ant-design/icons';
import { Avatar, Button, Comment, Input, List, Menu, MenuProps, message, Modal, Space } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import React from 'react';
import { AppContext } from '@store/store';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { getAllPages, getSelectedPageId } from '@store/page/selectors';
import { fetchAllPages, setSelectedPage } from '@store/page/action';
import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import { push } from 'connected-next-router';
import _ from 'lodash';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import moment from 'moment';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import InfoCardUser from '@components/Common/InfoCardUser';
import PageListItem from './PageListItem';

type PagesListingProps = {
  className?: string;
};

const PagesListing: React.FC<PagesListingProps> = ({ className }: PagesListingProps) => {
  const ContextValue = React.useContext(AppContext);
  const dispatch = useAppDispatch();
  const { XPI, Wallet } = ContextValue;
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isShowQrCode, setIsShowQrCode] = useState(false);
  // const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [balanceAccount, setBalanceAccount] = useState(0);

  const menuItems = [
    { label: 'All', key: 'all' },
    { label: 'Friend', key: 'friend' },
    {
      label: 'Trending',
      key: 'trending'
    },
    {
      label: 'Experiance',
      key: 'experiance'
    }
  ];

  const { data, totalCount, fetchNext, hasNext, isFetching } = useInfinitePagesQuery(
    {
      first: 2,
      last: undefined
    },
    false
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    XPI.Electrumx.balance(selectedAccount?.address)
      .then(result => {
        if (result && result.balance) {
          const balance = result.balance.confirmed + result.balance.unconfirmed;
          setBalanceAccount(balance);
        }
      })
      .catch(e => {
        setBalanceAccount(0);
      });
  }, []);

  const onChange = (checked: boolean) => {
    setLoading(!checked);
  };

  const onClickMenu: MenuProps['onClick'] = e => {
    if (e.key === 'filter') {
    }
    if (e.key === 'week') {
      dispatch(setSelectedPage('testPage'));
    }
  };

  const isItemLoaded = (index: number) => {
    return index < data.length && !_.isNil(data[index]);
  };

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    }
  };

  return (
    <div className={className}>
      <SearchBox></SearchBox>
      <CreatePostCard></CreatePostCard>
      <Menu
        style={{
          border: 'none',
          position: 'relative',
          marginBottom: '1rem',
          background: 'var(--bg-color-light-theme)'
        }}
        mode="horizontal"
        defaultSelectedKeys={['all']}
        onClick={onClickMenu}
        items={menuItems}
      ></Menu>
      <div className={'listing'} style={{ height: '100vh' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List itemLayout="vertical" size="large">
              <InfiniteLoader isItemLoaded={isItemLoaded} loadMoreItems={loadMoreItems} itemCount={totalCount}>
                {({ onItemsRendered, ref }) => (
                  <FixedSizeList
                    className="infinite-listing"
                    height={height}
                    width={width}
                    itemSize={500}
                    itemCount={totalCount}
                    itemData={data}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                  >
                    {PageListItem}
                  </FixedSizeList>
                )}
              </InfiniteLoader>
            </List>
          )}
        </AutoSizer>
      </div>

      <Modal title="Are you sure to down vote shop?" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
      </Modal>

      <Modal title="Qr code to claim lotus" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {isShowQrCode && selectedAccount?.address && <QRCode address={selectedAccount?.address} />}
      </Modal>
    </div>
  );
};

const StyledPagesListing = styled(PagesListing)`
  .infinite-listing {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;

    &::-webkit-scrollbar {
      width: 1px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: transparent;
    }

    .no-scrollbars::-webkit-scrollbar {
      display: none; /* Safari and Chrome */
    }
  }
`;

export default StyledPagesListing;
