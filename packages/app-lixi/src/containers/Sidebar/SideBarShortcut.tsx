import { Account, NotificationDto } from '@bcpros/lixi-models';
import { getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Layout, message, Space, Modal, Popover, Button, Badge, Avatar } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import axiosClient from '@utils/axiosClient';
import intl from 'react-intl-universal';
import { getAllNotifications } from '@store/notification/selectors';
import { fetchNotifications } from '@store/notification/actions';
import _ from 'lodash';
import { addRecentHashtagAtPages, setGraphqlRequestLoading } from '@store/account/actions';
import { HashtagOrderField, OrderDirection, PostOrderField } from '@generated/types.generated';
import { getFilterPostsHome, getIsTopPosts, getNavCollapsed } from '@store/settings/selectors';
import { api as postApi } from '@store/post/posts.api';
import { useInfinitePostsQuery } from '@store/post/useInfinitePostsQuery';
import { push } from 'connected-next-router';
import { transformShortName } from '@components/Common/AvatarUser';
import { stripHtml } from 'string-strip-html';
import moment from 'moment';
import { currency } from '@components/Common/Ticker';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { DownOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { setSelectedPost } from '@store/post/actions';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
import { useInfiniteHashtagByPageQuery } from '@store/hashtag/useInfiniteHashtagByPageQuery';
import { useInfinitePostsBySearchQueryWithHashtagAtPage } from '@store/post/useInfinitePostsBySearchQueryWithHashtagAtPage';

const { Sider } = Layout;

export type typeFilterPageQuery = {
  topic?: string;
  posts?: Array<any>;
};

export const ItemAccess = ({
  icon,
  text,
  href,
  active,
  direction,
  onClickItem
}: {
  icon: string;
  text?: string;
  href?: string;
  active: boolean;
  direction?: string;
  onClickItem?: () => void;
}) => {
  return (
    <div className={active ? 'active-item-access' : ''} onClick={onClickItem}>
      <Space direction={direction === 'horizontal' ? 'horizontal' : 'vertical'} className={'item-access'}>
        <div className={classNames('icon-item')}>
          <img src={icon} />
        </div>
        {text && <span className="text-item">{text}</span>}
      </Space>
    </div>
  );
};

export const ItemQuickAccess = ({
  icon,
  text,
  direction,
  isCollapse,
  onClickItem
}: {
  icon: string;
  text?: string;
  direction?: string;
  isCollapse?: boolean;
  onClickItem?: () => void;
}) => {
  return (
    <div onClick={onClickItem}>
      <Space
        direction={direction === 'horizontal' ? 'horizontal' : 'vertical'}
        className={'item-quick-access'}
        style={{ padding: isCollapse ? '0' : '' }}
      >
        <div className={classNames('icon-quick-item')}>
          <img src={icon} />
        </div>
        {!isCollapse && text && <span className="title-item">{text}</span>}
      </Space>
    </div>
  );
};

export const ItemAccessNotification = ({
  icon,
  text,
  href,
  active,
  direction,
  notifications,
  onClickItem
}: {
  icon: string;
  text: string;
  href?: string;
  active: boolean;
  direction?: string;
  notifications: NotificationDto[];
  onClickItem?: () => void;
}) => {
  return (
    <div className={active ? 'active-item-access' : ''} onClick={onClickItem}>
      <Space direction={direction === 'horizontal' ? 'horizontal' : 'vertical'} className={'item-access'}>
        <div className={classNames('icon-item')}>
          <Badge
            count={notifications.filter(item => _.isNil(item.readAt)).length}
            overflowCount={9}
            offset={[notifications?.length < 10 ? 0 : 5, 8]}
            color="var(--color-primary)"
          >
            <img src={icon} />
          </Badge>
        </div>
        <span className="text-item">{text}</span>
      </Space>
    </div>
  );
};

export const ItemAccessBarcode = ({
  icon,
  component,
  active
}: {
  icon: React.FC;
  component: JSX.Element;
  active: boolean;
}) => (
  <Link href="">
    <a>
      <Space direction="vertical" className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>{React.createElement(icon)}</div>
        <span className="text-item">{component}</span>
      </Space>
    </a>
  </Link>
);

export const ContainerAccess = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  background: #fff;
  .item-access {
    cursor: pointer;
    gap: 8px !important;
    &:hover {
      .text-item {
        color: var(--color-primary);
      }
      .icon-item {
        img {
          filter: var(--filter-color-primary);
        }
      }
    }
    @media (max-height: 768px) {
      margin-bottom: 1rem;
    }
    @media (max-height: 610px) {
      margin-bottom: 0.5rem;
    }
    @media (max-height: 530px) {
      margin-bottom: 0.2rem;
    }
    .anticon {
      font-size: 25px;
      color: #12130f;
    }
    .icon-item {
      padding: 6px;
      img {
        filter: invert(24%) sepia(10%) saturate(603%) hue-rotate(266deg) brightness(95%) contrast(82%);
        width: 25px;
        height: 25px;
      }
      @media (max-height: 530px) {
        padding: 8px;
      }
    }
    .text-item {
      font-size: 13px;
      font-weight: 400;
      color: #4e444b;
      @media (max-height: 610px) {
        font-size: 12px;
      }
      @media (max-height: 530px) {
        font-size: 10px;
      }
    }
  }
  .wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    .social-menu,
    .social-feature {
      width: 100%;
      text-align: left;
      padding: 1rem;

      h3 {
        margin-bottom: 1rem;
      }

      div:not(.ant-space-item) {
        margin-bottom: 1rem;
        &:last-child {
          margin-bottom: 0;
        }
      }

      .active-item-access {
        background: var(--bg-color-light-theme);
        padding: 2px 0;
        border-radius: var(--border-radius-primary);
        img {
          filter: var(--filter-color-primary);
        }
        .text-item {
          color: var(--color-primary);
        }
      }
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
      .button {
        border-radius: 4px;
        .anticon {
          font-size: 18px;
          margin: 10px;
        }
      }
    }
    .social-digest {
      padding: 0 0.5rem;
      width: 100%;
      text-align: left;
      padding-bottom: 5rem;
      h3 {
        padding: 1rem 0;
        margin: 0;
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

const StyledLogo = styled.div`
  margin: 2rem 0;
  cursor: pointer;
  background: #fff;
  @media (max-height: 768px) {
    margin: 0.8rem 0;
  }
`;

const ShortcutSideBar = styled(Sider)`
  position: sticky !important;
  background: transparent !important;
  top: 0px;
  height: 100vh;
  flex: none !important;
  overflow: auto;
  background: var(--bg-color-light-theme);
  box-shadow: 0 0 30px rgb(80 181 255 / 5%);
  min-width: 300px !important;
  max-width: 300px !important;
  -ms-overflow-style: none; // Internet Explorer 10+
  scrollbar-width: none; // Firefox
  ::-webkit-scrollbar {
    display: none; // Safari and Chrome
  }
  // &::-webkit-scrollbar {
  //   width: 5px;
  // }
  // &::-webkit-scrollbar-thumb {
  //   background: transparent;
  // }
  // &.show-scroll {
  //   &::-webkit-scrollbar {
  //     width: 5px;
  //   }
  //   &::-webkit-scrollbar-thumb {
  //     background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
  //     box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
  //     border-radius: 100px;
  //   }
  // }

  @media (max-width: 960px) {
    display: none;
  }

  &.minimize-short-cut {
    min-width: 70px !important;
    max-width: 70px !important;
    .text-item {
      display: none;
    }
    h3 {
      text-align: center;
    }
  }
`;

const SpaceShorcutItem = styled(Space)`
  width: 100%;
  gap: 8px !important;
  padding: 8px;
  border: 1px solid var(--border-color-base);
  cursor: pointer;
  margin-bottom: 0.5rem;
  &:hover {
    background: var(--border-color-base);
    .page-name {
      color: var(--color-primary);
    }
  }
  .ant-space-item {
    &:last-child {
      flex: 1;
    }
  }
  .avatar-account {
    border: 1px solid #fbf1fb;
    border-radius: 50%;
    width: fit-content;
    .ant-avatar {
      display: flex;
      align-items: center;
      font-size: 14px !important;
      width: 46px;
      height: 46px;
    }
    img {
      object-fit: cover;
      border-radius: 50%;
      width: 46px;
      height: 46px;
    }
  }
  .content-account {
    display: flex;
    .info-account {
      flex: 1;
      p {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        line-clamp: 1;
        -webkit-line-clamp: 1;
        box-orient: vertical;
        -webkit-box-orient: vertical;
        margin: 0;
        text-align: left;
        line-height: 16px;
        word-break: break-word;
      }
      .page-name {
        font-size: 14px;
        font-weight: 500;
      }
      .account-name {
        font-size: 12px;
      }
      .content {
        font-size: 11px;
        color: gray;
      }
    }
    .time-score {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      gap: 8px;
      p {
        margin: 0;
        color: gray;
        &.create-date {
          font-size: 10px;
        }
        &.lotus-burn-score {
          font-size: 10px;
          color: #fff;
        }
      }
      .content-score {
        padding: 2px 4px;
        background: #bfbfbf;
        border-radius: 12px;
      }
      button {
        &.animation-rotage {
          animation: 0.2s rotageFrames;
          transform: rotate(90deg);
        }

        @keyframes rotageFrames {
          from {
            transform: rotate(0);
          }
          to {
            transform: rotate(90deg);
          }
        }
      }
    }
  }
  &.collapse {
    img {
      width: 30px;
      height: 30px;
    }
    .ant-avatar {
      width: 30px;
      height: 30px;
    }
  }
  &.card-topic {
    background: #f6fdeb;
    border-color: #b7eb8f;
    .topic-title {
      text-transform: capitalize;
      color: #389e0e;
    }
    .topic-name {
      color: #389e0e;
    }
  }
  &.short-cut-back-topic {
    background: #fef1f6;
    border-color: #ffadd1;
    img {
      height: 30px;
    }
    .page-name {
      color: #c41e7f;
    }
  }
`;

const SpaceShortCutTopicItem = styled(Space)`
  display: flex;
  flex-direction: column;
  gap: 0 !important;
  border-radius: 6px;
  & > div {
    width: 100%;
  }
  .post-of-topic {
    padding: 0 0.5rem;
    .ant-space {
      background: #fff;
    }
  }
  .anticon {
    color: var(--color-primary);
  }
`;

const transformCreatedAt = date => {
  let dateFormated = '';
  const today = new Date();
  if (moment(date).isSame(today, 'day')) {
    dateFormated = moment(date).format('HH:SS');
  } else if (moment(date).isSame(today, 'week')) {
    dateFormated = moment(date).format('ddd');
  } else {
    dateFormated = moment(date).format('DD/MM');
  }
  return dateFormated;
};

export const ShortCutItem = ({
  item,
  classStyle,
  isCollapse,
  onClickIcon
}: {
  item?: any;
  classStyle?: string;
  isCollapse?: boolean;
  onClickIcon?: (e: any) => void;
}) => (
  <SpaceShorcutItem
    className={isCollapse ? 'collapse card' : 'card'}
    onClick={() => onClickIcon(item?.page?.id || item?.token?.tokenId || item?.postAccount?.address)}
    size={5}
  >
    <div className="avatar-account">
      {item?.page && <img src={item?.page?.avatar || '/images/default-avatar.jpg'} />}
      {item?.token && <img src={`${currency.tokenIconsUrl}/64/${item?.token?.tokenId}.png`} />}
      {!item?.page && !item?.token && (
        <Avatar src={item?.postAccount?.avatar ? item?.postAccount?.avatar : ''}>
          {transformShortName(item?.postAccount?.name)}
        </Avatar>
      )}{' '}
    </div>
    {!isCollapse && (
      <>
        <div className="content-account">
          <div className="info-account">
            {item?.page?.name && <p className="page-name">{item?.page?.name}</p>}
            {item?.token?.name && <p className="page-name">{item?.token?.name}</p>}
            <p className={!item?.page?.name && !item?.token?.name ? 'page-name' : 'account-name'}>
              {item?.postAccount?.name}
            </p>
            <p className="content">
              {item?.content.includes('twitter') ? 'Via Twitter' : stripHtml(item?.content).result}
            </p>
          </div>
          <div className="time-score">
            <p className="create-date">{transformCreatedAt(item?.createdAt)}</p>
            <div className="content-score">
              <p className="lotus-burn-score">{item?.lotusBurnScore}</p>
            </div>
          </div>
        </div>
      </>
    )}
  </SpaceShorcutItem>
);

export const ShortCutBackTopic = ({
  topicName,
  isCollapse,
  onClickIcon
}: {
  topicName?: any;
  isCollapse?: boolean;
  onClickIcon?: (e: any) => void;
}) => (
  <SpaceShorcutItem
    className={`${isCollapse ? 'collapse card' : 'card'} short-cut-back-topic`}
    style={{ width: isCollapse ? 'auto' : '100%' }}
    onClick={() => onClickIcon(topicName)}
    size={5}
  >
    <div className="avatar-account avartar-topic">
      <img src="/images/ico-back.png" />
    </div>
    {!isCollapse && (
      <>
        <div className="content-account">
          <div className="info-account">
            <p className="page-name">Back to {topicName ? topicName : 'page'}</p>
          </div>
        </div>
      </>
    )}
  </SpaceShorcutItem>
);

export const ShortCutTopicItem = ({
  topicName,
  posts,
  classStyle,
  isCollapse,
  onClickIcon
}: {
  topicName?: any;
  posts?: any;
  classStyle?: string;
  isCollapse?: boolean;
  onClickIcon?: (e: any, isFilter?: boolean) => void;
}) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const calculateTotalBurnTopic = useMemo(() => {
    let burnScore = 0;
    if (posts.length > 0) {
      burnScore = posts.reduce((result, post) => {
        return (result += post?.lotusBurnScore);
      }, 0);
    }
    return burnScore;
  }, [posts]);

  return posts.length !== 0 ? (
    <>
      <SpaceShortCutTopicItem
        style={{ background: showMore ? '#f9f0fa' : 'transparent', marginBottom: showMore ? '0.5rem' : '0' }}
        className={showMore ? 'space-shortcut-topic-item' : ''}
      >
        {isCollapse && (
          <SpaceShorcutItem
            className={`${isCollapse ? 'collapse card' : 'card'} card-topic`}
            size={5}
            onClick={() => onClickIcon(topicName)}
          >
            <div className="avatar-account avartar-topic">
              <Avatar>{topicName.slice(0, 2).toUpperCase()}</Avatar>
            </div>
          </SpaceShorcutItem>
        )}
        {!isCollapse && (
          <>
            <SpaceShorcutItem className={`${isCollapse ? 'collapse card' : 'card'} card-topic`} size={5}>
              <div className="avatar-account avartar-topic">
                <img src="/images/ico-topic.png" />
              </div>
              <div className="content-account">
                <div className="info-account" onClick={() => onClickIcon(topicName)}>
                  <p className="page-name topic-title">{`${topicName === 'general' ? 'general' : '#' + topicName}`}</p>
                  <p className="account-name topic-name">{posts[0]?.postAccount?.name}</p>
                  <p className="content">{stripHtml(posts[0]?.content).result}</p>
                </div>
                <div className="time-score">
                  <p className="create-date">Total Dana: {calculateTotalBurnTopic}</p>
                  <Button
                    className={`${showMore ? 'animation-rotage' : ''}`}
                    type="text"
                    icon={<RightOutlined />}
                    onClick={() => onClickIcon(topicName, true)}
                    // TODO: can change in future
                    // () => setShowMore(!showMore)
                  ></Button>
                </div>
              </div>
            </SpaceShorcutItem>
            <div hidden={!showMore} className="post-of-topic">
              {posts.map(post => {
                return (
                  <ShortCutPageItem key={post.id} item={post} onClickIcon={() => dispatch(setSelectedPost(post.id))} />
                );
              })}
            </div>
          </>
        )}
      </SpaceShortCutTopicItem>
    </>
  ) : (
    <></>
  );
};

export const ShortCutPageItem = ({
  item,
  classStyle,
  isCollapse,
  onClickIcon
}: {
  item?: any;
  classStyle?: string;
  isCollapse?: boolean;
  onClickIcon?: (e: any) => void;
}) => (
  <SpaceShorcutItem
    className={isCollapse ? 'collapse card' : 'card'}
    style={{ width: isCollapse ? 'auto' : '100%' }}
    onClick={() => onClickIcon(item)}
    size={5}
  >
    <div className="avatar-account">
      <Avatar>{transformShortName(item?.postAccount?.name)}</Avatar>
    </div>
    {!isCollapse && (
      <>
        <div className="content-account">
          <div className="info-account">
            <p className="account-name">{item?.postAccount?.name}</p>
            <p className="content">
              {item?.content.includes('twitter') ? 'Via Twitter' : stripHtml(item?.content).result}
            </p>
          </div>
          <div className="time-score">
            <p className="create-date">{transformCreatedAt(item?.createdAt)}</p>
            <div className="content-score">
              <p className="lotus-burn-score">{item?.lotusBurnScore}</p>
            </div>
          </div>
        </div>
      </>
    )}
  </SpaceShorcutItem>
);

const SidebarShortcut = () => {
  const refSidebarShortcut = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isCollapse, setIsCollapse] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);
  const router = useRouter();
  const currentPathName = router.pathname ?? '';
  const [notificationsSelected, setNotificationsSelected] = useState([]);
  const notifications = useAppSelector(getAllNotifications);
  const filterValue = useAppSelector(getFilterPostsHome);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [filterPosts, setFilterPosts] = useState([]);
  let isTop = useAppSelector(getIsTopPosts);
  const [filterPage, setFilterPage] = useState({});
  const [filterPageQuery, setFilterPageQuery] = useState<typeFilterPageQuery>({});
  const [query, setQuery] = useState<any>('');
  const [hashtags, setHashtags] = useState<any>([]);
  const pageId = router.pathname.includes('page') && (router.query?.slug as string);
  const [cachePostIdGeneral, setCachePostIdGeneral] = useState(0);

  let pastScan;

  let { data: PostsData } = useInfinitePostsQuery(
    {
      first: 50,
      minBurnFilter: filterValue,
      accountId: selectedAccountId ?? null,
      isTop: String(isTop),
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        },
        {
          direction: OrderDirection.Desc,
          field: PostOrderField.LastRepostAt
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
        field: HashtagOrderField.LotusBurnScore
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

  const onScan = async (result: string) => {
    if (pastScan !== result) {
      pastScan = result;

      await axiosClient
        .post('api/lixies/check-valid', { lixiBarcode: result })
        .then(res => {
          message.success(res.data);
        })
        .catch(err => {
          const { response } = err;
          message.error(response.data.message ? response.data.message : intl.get('lixi.unableGetLixi'));
        });
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      dispatch(
        fetchNotifications({
          accountId: selectedAccount.id,
          mnemonichHash: selectedAccount.mnemonicHash
        })
      );
    }
  }, []);

  useEffect(() => {
    const newArrFilter = _.uniqBy(PostsData, item => {
      return item?.page?.id || item?.token?.tokenId || item?.postAccount.address;
    });
    setFilterPosts([...newArrFilter]);
  }, [PostsData]);

  const triggerSrollbar = e => {
    const sidebarShortcutNode = refSidebarShortcut.current;
    sidebarShortcutNode.classList.add('show-scroll');
    setTimeout(() => {
      sidebarShortcutNode.classList.remove('show-scroll');
    }, 700);
  };

  const { refetch } = useInfinitePostsQuery(
    {
      first: 50,
      minBurnFilter: filterValue,
      accountId: selectedAccountId,
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

  const handleIconClick = (newPath?: string) => {
    if (currentPathName === '/' && newPath === '/') {
      dispatch(postApi.util.resetApiState());
      refetch();
      dispatch(setGraphqlRequestLoading());
    } else {
      dispatch(push(newPath));
    }
  };

  const handleMenuClick = e => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  const classNameShortCut = () => {
    let className = '';
    if (!navCollapsed) {
      className = '';
    } else {
      className = 'minimize-short-cut';
    }
    return className;
  };

  const showShortCutForPage = () => {
    return !query && hashtags.length === 0 ? (
      Object.entries(filterPage).map(([key, value]) => {
        return (
          <ShortCutTopicItem
            key={key}
            onClickIcon={(topicName, isFilter) => onTopHashtagClick(`#${topicName}`, value, isFilter)}
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
        {filterPosts.map((item, index) => {
          return <ShortCutItem key={index} item={item} onClickIcon={() => dispatch(setSelectedPost(item.id))} />;
        })}
      </>
    );
  };

  const showShortCutForPageNavCollapse = () => {
    return !query && hashtags.length === 0 ? (
      Object.entries(filterPage).map(([key, value]) => {
        return (
          <ShortCutTopicItem
            key={key}
            onClickIcon={(topicName, isFilter) => onTopHashtagClick(`#${topicName}`, value, isFilter)}
            topicName={key}
            posts={value}
            isCollapse={navCollapsed}
          />
        );
      })
    ) : (
      <>
        <ShortCutBackTopic
          topicName={_.nth(hashtags, -2)}
          onClickIcon={() => handleTagClose(_.nth(hashtags, -1) || hashtags[0])}
          isCollapse={navCollapsed}
        />
        {filterPageQuery &&
          Object.entries(filterPageQuery).map(([topic, posts]) => {
            return topic !== 'zparent' ? showChildTopic(topic, posts) : showParrentTopic(posts);
          })}
      </>
    );
  };

  const showShortCutForHomeNavCollapse = () => {
    return (
      <div className="social-feature" style={{ padding: navCollapsed ? '0.5rem' : '1rem' }}>
        {filterPosts.map((item, index) => {
          return (
            <ShortCutItem
              key={index}
              item={item}
              isCollapse={navCollapsed}
              onClickIcon={() => dispatch(setSelectedPost(item.id))}
            />
          );
        })}
      </div>
    );
  };

  const showParrentTopic = posts => {
    let parrentTopic = [];
    parrentTopic = posts;

    return parrentTopic.map((post, index) => {
      return (
        <ShortCutPageItem
          key={index}
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
        onClickIcon={(topicName, isFilter) => onTopHashtagClick(`#${topicName}`, posts, isFilter)}
        topicName={topic}
        posts={posts}
        isCollapse={navCollapsed}
      />
    );
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
      <ShortcutSideBar
        className={classNameShortCut()}
        id="short-cut-sidebar"
        ref={refSidebarShortcut}
        onScroll={e => triggerSrollbar(e)}
      >
        <ContainerAccess className="container-access">
          <div className="wrapper">
            {!navCollapsed && (
              <>
                <div className="header-bar">
                  <h3>Digest</h3>
                  <Button
                    type="primary"
                    className="no-border-btn animate__animated animate__heartBeat"
                    icon={<LeftOutlined />}
                    onClick={handleMenuClick}
                  />
                </div>
                <div className="social-digest">
                  <ItemQuickAccess
                    icon={'/images/ico-newfeeds.svg'}
                    text={'Feeds'}
                    direction="horizontal"
                    isCollapse={navCollapsed}
                    onClickItem={() => handleIconClick('/')}
                  />
                  {pageId ? showShortCutForPage() : showShortCutItemForHome()}
                </div>
              </>
            )}
            {navCollapsed && (
              <>
                <h3 style={{ marginBottom: '0.5rem' }} onClick={handleMenuClick}>
                  <img
                    className="animate__animated animate__heartBeat"
                    style={{ margin: '5px', cursor: 'pointer' }}
                    width={22}
                    height={22}
                    src="/images/ico-list-bullet_2.svg"
                    alt=""
                  />
                </h3>
                <ItemQuickAccess
                  icon={'/images/ico-newfeeds.svg'}
                  text={'Feeds'}
                  direction="horizontal"
                  isCollapse={navCollapsed}
                  onClickItem={() => handleIconClick('/')}
                />
                {pageId ? showShortCutForPageNavCollapse() : showShortCutForHomeNavCollapse()}
              </>
            )}
          </div>
        </ContainerAccess>
      </ShortcutSideBar>
    </>
  );
};
export default SidebarShortcut;
