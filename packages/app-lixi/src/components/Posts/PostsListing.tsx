import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { getSelectedAccount } from '@store/account/selectors';
import { setSelectedPost } from '@store/post/actions';
import { useInfinitePostsBySearchQuery } from '@store/post/useInfinitePostsBySearchQuery';
import { WalletContext } from '@context/index';
import { getLatestBurnForPost } from '@store/burn';
import { api as postApi, useLazyPostQuery } from '@store/post/posts.api';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
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

  const [queryPostTrigger, queryPostResult] = useLazyPostQuery();
  const latestBurnForPost = useAppSelector(getLatestBurnForPost);

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

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsBySearchQuery(
    {
      first: 10,
      query: 'post'
    },
    false
  );

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    (async () => {
      if (latestBurnForPost) {
        const post = await queryPostTrigger({ id: latestBurnForPost.burnForId });
        console.log('post', post);
        dispatch(
          postApi.util.updateQueryData('Posts', undefined, draft => {
            const postToUpdate = draft.allPosts.edges.find(item => item.node.id === latestBurnForPost.burnForId);
            if (postToUpdate) {
              console.log('update post');
              postToUpdate.node = post.data.post;
            }
          })
        );
        postApi.util.invalidateTags(['Post']);
        refetch();
      }
    })();
  }, [latestBurnForPost]);

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

  const Header = () => {
    return (
      <div>
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
      </div>
    );
  };

  const Footer = () => {
    return (
      <div
        style={{
          padding: '1rem 2rem 2rem 2rem',
          textAlign: 'center'
        }}
      >
        {isFetchingNext ? <Skeleton avatar active /> : "It's so empty here..."}
      </div>
    );
  };

  return (
    <div>
      <Virtuoso
        style={{ height: '100vh', paddingBottom: '2rem' }}
        data={data}
        endReached={loadMoreItems}
        overscan={500}
        itemContent={(index, item) => {
          return <PostListItem index={index} item={item} />;
        }}
        components={{ Header, Footer }}
      />
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
