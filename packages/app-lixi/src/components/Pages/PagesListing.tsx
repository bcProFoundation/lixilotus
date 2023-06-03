import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { getSelectedAccount } from '@store/account/selectors';
import { setSelectedPage } from '@store/page/action';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import { WalletContext } from '@context/index';
import { Menu, MenuProps, Modal } from 'antd';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import PageListItem from './PageListItem';

type PagesListingProps = {
  className?: string;
};

const PagesListing: React.FC<PagesListingProps> = ({ className }: PagesListingProps) => {
  const Wallet = React.useContext(WalletContext);
  const { XPI } = Wallet;
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isShowQrCode, setIsShowQrCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [balanceAccount, setBalanceAccount] = useState(0);

  const listRef = useRef();
  const menuItems = [
    { label: 'Top', key: 'top' },
    { label: 'New', key: 'new' },
    {
      label: 'Follows',
      key: 'follows'
    },
    {
      label: 'Hot discussion',
      key: 'hotDiscussion'
    }
  ];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext } = useInfinitePagesQuery(
    {
      first: 10
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
    } else if (hasNext) {
      fetchNext();
    }
  };

  return (
    <div className={className}>
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
        <Virtuoso
          className={'listing'}
          style={{ height: '100%' }}
          data={data}
          endReached={loadMoreItems}
          overscan={900}
          itemContent={(index, item) => {
            return <PageListItem index={index} item={item} />;
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

      <Modal title="Are you sure to down vote shop?" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <p>Some contents...</p>
      </Modal>

      <Modal title="Qr code to claim lotus" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        {isShowQrCode && selectedAccount?.address && <QRCode address={selectedAccount?.address} />}
      </Modal>
    </div>
  );
};

export default PagesListing;
