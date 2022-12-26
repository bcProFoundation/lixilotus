import QRCode from '@bcpros/lixi-components/components/Common/QRCode';
import CreatePostCard from '@components/Common/CreatePostCard';
import { getSelectedAccount } from '@store/account/selectors';
import { setSelectedPost } from '@store/post/actions';
import { useInfinitePostsBySearchQuery } from '@store/post/useInfinitePostsBySearchQuery';
import { WalletContext } from '@context/index';
import { getLatestBurnForPost } from '@store/burn';
import { api as postApi, useLazyPostQuery } from '@store/post/posts.api';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { Menu, MenuProps, Modal, Skeleton } from 'antd';
import _ from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import SearchBox from '../Common/SearchBox';
import intl from 'react-intl-universal';
import PostListItem from './PostListItem';

type PostsListingProps = {
  className?: string;
};

const StyledPostsListing = styled.div`
  #list-virtuoso {
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
  }

  .custom-query-list {
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
    animation: fadeInAnimation 0.75s;
  }

  @keyframes fadeInAnimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const StyledHeader = styled.div`
  .menu-post-listing {
    .ant-menu-item {
      .ant-menu-title-content {
        color: rgba(30, 26, 29, 0.6);
      }
      &.ant-menu-item-selected {
        .ant-menu-title-content {
          color: #1e1a1d;
          font-weight: 500;
        }
        &::after {
          border-bottom: 2px solid #9e2a9c !important;
        }
      }
    }
  }
`;

const PostsListing: React.FC<PostsListingProps> = ({ className }: PostsListingProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isShowQrCode, setIsShowQrCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const refPostsListing = useRef<HTMLDivElement | null>(null);

  const [queryPostTrigger, queryPostResult] = useLazyPostQuery();
  const latestBurnForPost = useAppSelector(getLatestBurnForPost);

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

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsQuery(
    {
      first: 20,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
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

  //#region QueryVirtuoso
  const { queryData, fetchNextQuery, hasNextQuery, isQueryFetching, isFetchingQueryNext } =
    useInfinitePostsBySearchQuery(
      {
        query: searchValue
      },
      false
    );

  const loadMoreQueryItems = () => {
    if (hasNextQuery && !isQueryFetching) {
      fetchNextQuery();
    } else if (hasNextQuery) {
      fetchNextQuery();
    }
  };

  const searchPost = value => {
    setSearchValue(value);
  };

  const QueryHeader = () => {
    return (
      <div>
        <SearchBox searchPost={searchPost} value={searchValue} />
        <h1 style={{ textAlign: 'left', fontSize: '20px' }}>
          {intl.get('general.searchResults', { text: searchValue })}
        </h1>
      </div>
    );
  };

  const QueryFooter = () => {
    return (
      <div
        style={{
          padding: '1rem 2rem 2rem 2rem',
          textAlign: 'center'
        }}
      >
        {isFetchingQueryNext ? <Skeleton avatar active /> : "It's so empty here..."}
      </div>
    );
  };
  //#endregion

  //#region Normal Virtuoso

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

  const triggerSrollbar = e => {
    const virtuosoNode = refPostsListing.current.querySelector('#list-virtuoso') || null;
    virtuosoNode.classList.add('show-scroll');
    setTimeout(() => {
      virtuosoNode.classList.remove('show-scroll');
    }, 700);
  };

  const Header = () => {
    return (
      <StyledHeader>
        <SearchBox searchPost={searchPost} value={searchValue} />
        <CreatePostCard refetch={() => refetch()} />
        <Menu
          className="menu-post-listing"
          style={{
            border: 'none',
            position: 'relative',
            marginBottom: '1rem',
            background: 'var(--bg-color-light-theme)'
          }}
          mode="horizontal"
          defaultSelectedKeys={['top']}
          onClick={onClickMenu}
          items={menuItems}
        ></Menu>
      </StyledHeader>
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
  //#endregion

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

  return (
    <StyledPostsListing ref={refPostsListing}>
      {!searchValue ? (
        <Virtuoso
          id="list-virtuoso"
          onScroll={e => triggerSrollbar(e)}
          style={{ height: '100vh', paddingBottom: '2rem' }}
          data={data}
          endReached={loadMoreItems}
          overscan={3000}
          itemContent={(index, item) => {
            return <PostListItem index={index} item={item} />;
          }}
          components={{ Header, Footer }}
        />
      ) : (
        <Virtuoso
          className="custom-query-list"
          style={{ height: '100vh', paddingBottom: '2rem' }}
          data={queryData}
          endReached={loadMoreQueryItems}
          overscan={3000}
          itemContent={(index, item) => {
            return <PostListItem index={index} item={item} />;
          }}
          components={{ Header: QueryHeader, Footer: QueryFooter }}
        />
      )}
    </StyledPostsListing>
  );
};

export default PostsListing;
