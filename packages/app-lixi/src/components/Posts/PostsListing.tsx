import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { WalletContext } from '@context/index';
import useXPI from '@hooks/useXPI';
import { getSelectedAccount } from '@store/account/selectors';
import { setSelectedPost } from '@store/post/actions';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletBalances } from '@store/wallet';
import { Menu, MenuProps, Modal, Skeleton } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import PostListItem from './PostListItem';

type PostsListingProps = {
  className?: string;
};

const PostsListing: React.FC<PostsListingProps> = ({ className }: PostsListingProps) => {

  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isShowQrCode, setIsShowQrCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const menuItems = [
    { label: 'All', key: 'all' },
    { label: 'Friend', key: 'friend' },
    {
      label: 'Trending',
      key: 'trending'
    },
    {
      label: 'Experiences',
      key: 'experiences'
    }
  ];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsQuery(
    {
      first: 10,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    },
    false
  );

  useEffect(() => {
    refetch();
  }, []);

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
      dispatch(setSelectedPost('testPost'));
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
      <SearchBox></SearchBox>
      <CreatePostCard refetch={() => refetch()} />
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
          overscan={500}
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
                  {isFetchingNext ? <Skeleton avatar active /> : "It's so empty here..."}
                </div>
              );
            }
          }}
        />
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

export default PostsListing;
