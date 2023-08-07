import { HashtagOrderField, OrderDirection, PostOrderField } from '@generated/types.generated';
import { getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getFilterPostsHome, getIsTopPosts, getNavCollapsed } from '@store/settings/selectors';
import { push } from 'connected-next-router';
import _ from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  ItemQuickAccess,
  ShortCutBackTopic,
  ShortCutItem,
  ShortCutPageItem,
  ShortCutTopicItem,
  typeFilterPageQuery
} from './SideBarShortcut';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { setSelectedPost } from '@store/post/actions';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
import { useInfiniteHashtagByPageQuery } from '@store/hashtag/useInfiniteHashtagByPageQuery';
import { useInfinitePostsBySearchQueryWithHashtagAtPage } from '@store/post/useInfinitePostsBySearchQueryWithHashtagAtPage';
import { addRecentHashtagAtPages } from '@store/account';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: Function;
};

const ContainerSideBarContent = styled.div`
  height: 100%;
  text-align: left;
  .wrapper {
    padding-bottom: 5rem;
    h3 {
      margin-bottom: 1rem !important;
    }
    .header-bar {
      position: sticky;
      top: 0;
      z-index: 9;
      width: 100%;
      background: #fff;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-left: 0.5rem;
      button {
        border-radius: 4px;
        .anticon {
          font-size: 18px;
          margin: 10px;
        }
      }
    }
    .item-quick-access {
      width: 100%;
      gap: 8px !important;
      padding: 0 8px;
      border: 1px solid var(--border-color-base);
      cursor: pointer;
      margin-bottom: 0.5rem;
      border-radius: 8px;
      .icon-quick-item {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 25px;
          height: 25px;
        }
      }
      .title-item {
        font-size: 14px;
        font-weight: 500;
      }
      &:hover {
        border-color: var(--color-primary);
        img {
          filter: var(--filter-color-primary) !important;
        }
        .title-item {
          color: var(--color-primary);
        }
      }
    }
  }
`;

const SidebarContent = ({ className }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isCollapse, setIsCollapse] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);
  const currentPathName = router.pathname ?? '';
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [filterGroup, setFilterGroup] = useState([]);
  let isTop = useAppSelector(getIsTopPosts);
  const [filterPosts, setFilterPosts] = useState([]);
  const [filterPage, setFilterPage] = useState({});
  const [filterPageQuery, setFilterPageQuery] = useState<typeFilterPageQuery>({});
  const [query, setQuery] = useState<any>('');
  const [hashtags, setHashtags] = useState<any>([]);
  const pageId = router.pathname.includes('page') && (router.query?.slug as string);
  const [cachePostIdGeneral, setCachePostIdGeneral] = useState(0);

  let { data: PostsData } = useInfinitePostsQuery(
    {
      first: 50,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      isTop: String(isTop),
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.LastRepostAt
        },
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ]
    },
    false
  );

  let { data: postsOfPage } = useInfinitePostsByPageIdQuery(
    {
      first: 10,
      minBurnFilter: filterValue ?? 1,
      accountId: selectedAccountId ?? undefined,
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.LastRepostAt
        },
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      ],
      id: pageId
    },
    false
  );

  const { data: hashtagData } = useInfiniteHashtagByPageQuery(
    {
      first: 10,
      orderBy: {
        direction: OrderDirection.Desc,
        field: HashtagOrderField.DanaBurnScore
      },
      id: pageId
    },
    false
  );

  const { queryData } = useInfinitePostsBySearchQueryWithHashtagAtPage(
    {
      first: 20,
      minBurnFilter: filterValue ?? 1,
      query: query,
      hashtags: hashtags,
      pageId: pageId,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      }
    },
    false
  );

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q);
    } else {
      setQuery(null);
    }

    if (router.query.hashtags) {
      setHashtags((router.query.hashtags as string).split(' '));
    } else {
      setHashtags([]);
    }
  }, [router.query]);

  // Group by topic for page via hashtag
  useEffect(() => {
    const postsOfPageClone = _.cloneDeep(postsOfPage);
    const hashTagsClone = _.cloneDeep(hashtagData);
    let filterPageTemp = {};
    if (hashtagData.length > 0) {
      hashTagsClone.forEach(item => {
        let topicGroup = [];
        let generalTopic = [];
        postsOfPageClone.forEach(post => {
          if (post.content.toLowerCase().includes(`#${item.normalizedContent}`)) {
            topicGroup.push(post);
          }
          if (!post.content.toLowerCase().includes('#')) {
            generalTopic.push(post);
          }
        });
        filterPageTemp[item.normalizedContent] = topicGroup;
        filterPageTemp['general'] = generalTopic;
      });
    } else {
      filterPageTemp['general'] = postsOfPageClone;
    }
    setFilterPage({ ...filterPageTemp });
  }, [postsOfPage]);

  // Group by child of topic
  useEffect(() => {
    const postsOfPageQueryClone = _.cloneDeep(queryData);
    let hashTagMapping = hashtags.map(hashtag => hashtag.replace('#', ''));
    let arrHashTagString = hashtagData.map(hashTag => {
      return hashTag.normalizedContent;
    });
    let hashtagRemaining = _.difference(arrHashTagString, hashTagMapping);
    let filterPageQueryTemp = {};
    if (postsOfPageQueryClone.length !== 0) {
      if (hashtagRemaining.length !== 0) {
        hashtagRemaining.forEach(hashTag => {
          let topicGroup = [];
          postsOfPageQueryClone.forEach(post => {
            if (post.content.toLowerCase().includes(`#${hashTag.toLowerCase()}`)) {
              topicGroup.push(post);
            }
          });
          filterPageQueryTemp[hashTag.toLowerCase()] = topicGroup;
          filterPageQueryTemp['zparent'] = postsOfPageQueryClone;
        });
      } else {
        filterPageQueryTemp['zparent'] = postsOfPageQueryClone;
      }
    } else {
      filterPageQueryTemp = {};
    }
    const sortedQueryPage = Object.keys(filterPageQueryTemp)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = filterPageQueryTemp[key];

        return accumulator;
      }, {});
    setFilterPageQuery({ ...sortedQueryPage });
  }, [queryData]);

  useEffect(() => {
    const newArrFilter = _.uniqBy(PostsData, item => {
      return item?.page?.id || item?.token?.tokenId || item?.postAccount.address;
    });
    setFilterPosts([...newArrFilter]);
  }, [PostsData]);

  // const handleOnClick = () => {
  //   dispatch(toggleCollapsedSideNav(!navCollapsed));
  // };

  const handleIconClick = (newPath?: string) => {
    dispatch(push(newPath));
  };

  const showParrentTopic = posts => {
    let parrentTopic = [];
    parrentTopic = posts;

    return parrentTopic.map(post => {
      return (
        <ShortCutPageItem
          item={post}
          onClickIcon={() => dispatch(setSelectedPost(post.id))}
          isCollapse={navCollapsed}
        />
      );
    });
  };

  const showChildTopic = (topic, posts) => {
    return (
      <ShortCutTopicItem
        onClickIcon={(topicName, isFilter) =>
          onTopHashtagClick(`${topicName !== 'general' ? `#${topicName}` : ''}`, posts, isFilter)
        }
        topicName={topic}
        posts={posts}
        isCollapse={navCollapsed}
      />
    );
  };

  const showShortCutForPage = () => {
    return !query && hashtags.length === 0 ? (
      Object.entries(filterPage).map(([key, value]) => {
        return (
          <ShortCutTopicItem
            onClickIcon={(topicName, isFilter) =>
              onTopHashtagClick(`${topicName !== 'general' ? `#${topicName}` : ''}`, value, isFilter)
            }
            topicName={key}
            posts={value}
          />
        );
      })
    ) : (
      <>
        <ShortCutBackTopic
          topicName={_.nth(hashtags, -2)}
          onClickIcon={() => handleTagClose(_.nth(hashtags, -1) || hashtags[0])}
        />
        {filterPageQuery &&
          Object.entries(filterPageQuery).map(([topic, posts]) => {
            return topic !== 'zparent' ? showChildTopic(topic, posts) : showParrentTopic(posts);
          })}
      </>
    );
  };

  const showShortCutItemForHome = () => {
    return (
      <>
        {filterPosts.map(item => {
          return <ShortCutItem item={item} onClickIcon={() => handleClickShortCutItemForHome(item?.id)} />;
        })}
      </>
    );
  };

  const handleClickShortCutItemForHome = id => {
    dispatch(setSelectedPost(id));
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  const onTopHashtagClick = (hashtag, posts?, isFilter?) => {
    if (hashtag !== '#general' && isFilter) {
      if (router.query.hashtags) {
        //Check dup before adding to query
        const queryHashtags = (router.query.hashtags as string).split(' ');
        const hashtagExistedIndex = queryHashtags.findIndex(h => h.toLowerCase() === hashtag.toLowerCase());

        if (hashtagExistedIndex === -1) {
          router.replace({
            query: {
              ...router.query,
              hashtags: router.query.hashtags + ' ' + hashtag
            }
          });
        }
      } else {
        router.replace({
          query: {
            ...router.query,
            q: '',
            hashtags: hashtag
          }
        });
      }
      dispatch(addRecentHashtagAtPages({ id: pageId, hashtag: hashtag.substring(1) }));
      setTimeout(() => {
        dispatch(setSelectedPost(posts[0].id));
      }, 500);
    } else {
      if (hashtag === '#general') {
        dispatch(setSelectedPost(posts[cachePostIdGeneral].id));
        cachePostIdGeneral < posts.length - 1
          ? setCachePostIdGeneral(cachePostIdGeneral + 1)
          : setCachePostIdGeneral(0);
      } else {
        dispatch(setSelectedPost(posts[0].id));
      }
    }
  };

  const handleTagClose = removedTag => {
    const updatedTags = hashtags.filter(tag => tag !== removedTag);
    setHashtags([...updatedTags]);
    if (updatedTags.length === 0) {
      const { pathname, query } = router;
      delete query.hashtags;

      router.push({
        pathname,
        query
      });
    } else {
      router.replace({
        query: {
          ...router.query,
          hashtags: updatedTags.join(' ')
        }
      });
    }
  };

  return (
    <>
      <ContainerSideBarContent className="side-bar-content">
        <div className="wrapper">
          <div className="header-bar">
            <h3>Digest</h3>
            <Button
              type="primary"
              className="no-border-btn animate__animated animate__heartBeat"
              icon={<LeftOutlined />}
              onClick={() => dispatch(toggleCollapsedSideNav(!navCollapsed))}
            />
          </div>
          <div className="social-digest">
            <ItemQuickAccess
              icon={'/images/ico-newfeeds.svg'}
              text={'Feeds'}
              direction="horizontal"
              onClickItem={() => handleIconClick('/')}
            />
            {pageId ? showShortCutForPage() : showShortCutItemForHome()}
          </div>
        </div>
      </ContainerSideBarContent>
    </>
  );
};

export default SidebarContent;
