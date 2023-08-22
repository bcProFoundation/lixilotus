import {
  CameraOutlined,
  CompassOutlined,
  EditOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { OPTION_BURN_VALUE, PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { FilterType } from '@bcpros/lixi-models/lib/filter';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { FilterBurnt } from '@components/Common/FilterBurn';
import { currency } from '@components/Common/Ticker';
import PostListItem from '@components/Posts/PostListItem';
import {
  CreateFollowPageInput,
  CreatePageMessageInput,
  DeleteFollowPageInput,
  HashtagOrderField,
  OrderDirection,
  PostOrderField,
  RepostInput,
  PageMessageSessionStatus
} from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import {
  addRecentHashtagAtPages,
  clearRecentHashtagAtPages,
  removeRecentHashtagAtPages,
  setTransactionReady
} from '@store/account/actions';
import {
  getPageAvatarUpload,
  getPageCoverUpload,
  getRecentHashtagAtPages,
  getSelectedAccount,
  getSelectedAccountId
} from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { useCreateFollowPageMutation, useDeleteFollowPageMutation } from '@store/follow/follows.api';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { useInfinitePostsByPageIdQuery } from '@store/post/useInfinitePostsByPageIdQuery';
import { getFilterPostsPage } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { Button, Skeleton, Space, Tabs, Tag } from 'antd';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInfinitePostsBySearchQueryWithHashtagAtPage } from '@store/post/useInfinitePostsBySearchQueryWithHashtagAtPage';
import { useInfiniteHashtagByPageQuery } from '@store/hashtag/useInfiniteHashtagByPageQuery';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { PageQuery } from '@store/page/pages.generated';
import { useRepostMutation } from '@store/post/posts.api';
import _ from 'lodash';
import { getSelectedPostId } from '@store/post/selectors';
import { setSelectedPost } from '@store/post/actions';
import {
  useCreatePageMessageSessionMutation,
  useUserHadMessageToPageQuery
} from '@store/message/pageMessageSession.generated';
import { ReactSVG } from 'react-svg';
import { PostListType } from '@bcpros/lixi-models/constants';
import { AuthorizationContext } from '@context/index';
import useAuthorization from '@components/Common/Authorization/use-authorization.hooks';

export type PageItem = PageQuery['page'];

type PageDetailProps = {
  page: PageItem;
  isMobile: boolean;
  checkIsFollowed: boolean;
};

const StyledContainerProfileDetail = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
  background: var(--bg-color-light-theme);
  border-radius: var(--border-radius-primary);
  padding-bottom: 3rem;
  .reaction-container {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-left: 0;
    border-right: 0;
  }

  .comment-item-meta {
    margin-bottom: 0.5rem;
    .ant-list-item-meta-avatar {
      margin-top: 3%;
    }
    .ant-list-item-meta-title {
      margin-bottom: 0.5rem;
    }
  }

  .input-comment {
    padding: 1rem 0 0 0;
  }
`;

const ProfileCardHeader = styled.div`
  border: 1px solid var(--border-item-light);
  border-bottom: 0;
  border-top-left-radius: var(--border-radius-item);
  border-top-right-radius: var(--border-radius-item);
  .container-img {
    position: relative;
    .cover-img {
      width: 100%;
      height: 200px;
      border-top-right-radius: var(--border-radius-item);
      border-top-left-radius: var(--border-radius-item);
      object-fit: cover;
      @media (max-width: 768px) {
        border-radius: 0;
        height: 200px;
      }
    }
    button {
      display: block;
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
    }
    @media (max-width: 960px) {
      button {
        display: none;
      }
    }
  }
  .info-profile {
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: end;
    padding: 1rem 2rem 1rem 0;
    background: #fff;
    .wrapper-avatar {
      left: 2rem;
      top: -90px;
      position: absolute;
      padding: 2px;
      background: #fff;
      border-radius: var(--border-radius-primary);
      .avatar-img {
        width: 150px;
        height: 150px;
        border-radius: var(--border-radius-primary);
        object-fit: cover;
      }
      @media (max-width: 768px) {
        left: auto;
      }
      .btn-upload-avatar {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 35px;
        height: 35px;
        position: absolute;
        border-radius: 50%;
        bottom: 5%;
        right: 5%;
        background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
        .anticon {
          font-size: 20px;
          color: var(--color-primary);
        }
      }
    }
    .title-profile {
      margin-left: calc(160px + 48px);
      text-align: left;
      line-height: 28px;
      @media (max-width: 768px) {
        margin-left: 0;
        margin-top: 4rem;
        text-align: center;
      }
      h2 {
        font-weight: 600;
        margin-bottom: 0;
      }
    }
    .action-profile {
      display: flex;
      align-self: center;
      gap: 8px;
      .btn-edit-cover {
        display: none;
      }
      @media (max-width: 960px) {
        text-align: center;
        button {
          margin-bottom: 4px;
        }
        .btn-edit-cover {
          display: block;
        }
      }
      button {
        .anticon-custom {
          svg {
            filter: var(--filter-color-primary);
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      padding-right: 0;
    }
  }

  .description-profile {
    width: 100%;
    background: #fff;
    padding: 0 calc(0px + 48px);
    text-align: left;
    display: flex;
    flex-direction: column;
    @media (max-width: 768px) {
      margin-left: 0;
      text-align: center;
    }
  }
`;

const ProfileContentContainer = styled.div`
  display: flex;
  gap: 1rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LegacyProfile = styled.div`
  max-width: 35%;
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const AboutBox = styled.div`
  background: #ffffff;
  border-radius: var(--border-radius-primary);
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--border-item-light);
  h3 {
    text-align: left;
  }
  .about-content {
    padding: 1rem 0;
    text-align: left;
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 426px) {
    margin: 0 4px 1rem 4px;
  }
`;

const PictureBox = styled.div`
  background: #ffffff;
  border-radius: var(--border-radius-primary);
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--border-item-light);
  h3 {
    text-align: left;
  }
  .picture-content {
    padding: 1rem 0;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-gap: 10px;
    img {
      width: 110px;
      height: 110px;
      @media (max-width: 768px) {
        width: 95%;
      }
    }
  }
  .blank-picture {
    img {
      width: 100%;
    }
  }
  @media (max-width: 426px) {
    margin: 0 4px 1rem 4px;
  }
`;

const FriendBox = styled.div`
  background: #ffffff;
  border-radius: var(--border-radius-primary);
  margin-bottom: 1rem;
  padding: 24px;
  border: 1px solid var(--border-item-light);
  h3 {
    text-align: left;
  }
  .friend-content {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-column-gaps: 10px;
    grid-row-gap: 1rem;
    padding: 1rem 0;
    .friend-item {
      img {
        width: 110px;
        height: 110px;
        border-radius: 50%;
        @media (max-width: 768px) {
          width: 95%;
        }
      }
      p {
        margin: 0;
        color: #4e444b;
        letter-spacing: 0.4px;
        font-size: 12px;
        line-height: 24px;
        width: 110px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
  .blank-friend {
    img {
      width: 100%;
    }
    button {
      width: 100%;
      white-space: break-spaces;
    }
  }
  @media (max-width: 426px) {
    margin: 0 4px 1rem 4px;
  }
`;

const ContentTimeline = styled.div`
  .search-bar {
    margin: 1rem 0;
    @media (min-width: 960px) {
      .search-container {
        display: none !important;
      }
    }
  }
`;

const Timeline = styled.div`
  border-radius: var(--border-radius-primary);
  width: 100%;
  margin-right: 1rem;
  margin-bottom: 1rem;
  .blank-timeline {
    background: #ffffff;
    border: 1px solid rgba(128, 116, 124, 0.12);
    border-radius: var(--border-radius-primary);
    padding: 1rem 0;
    margin-top: 1rem;
    img {
      max-height: 45vh;
      @media (max-width: 426px) {
        max-width: 100%;
        max-height: 45vh;
      }
    }
    p {
      color: rgba(30, 26, 29, 0.6);
    }
  }
`;

const StyledSpace = styled(Space)`
  margin-bottom: 1rem;
  .ant-space-item {
    height: fit-content;
    .anticon {
      font-size: 18px;
      color: rgba(30, 26, 29, 0.38);
    }
  }
`;

const StyledMenu = styled(Tabs)`
  width: 100%;
  // TODO: Display none to hide tabs untill add more option tabs
  .ant-tabs-nav {
    border-bottom-right-radius: 20px;
    border-bottom-left-radius: 20px;
    padding: 1rem 24px;
    border: 1px solid var(--border-item-light);
    background: white;
    &:before {
      content: none;
    }
    @media (max-width: 426px) {
      padding-top: 0;
    }
  }
`;

const TagContainer = styled.div`
  margin-bottom: 1rem;
  text-align: left;
  @media (min-width: 968px) {
    display: none;
  }
`;

const StyledTag = styled(Tag)`
  font-weight: bold;
  font-style: italic;
  font-size: 15px;
  height: 24px;
  margin-bottom: 5px;
  margin-right: 5px;
  cursor: pointer;
`;

const SubAbout = ({
  icon,
  text,
  dataItem,
  imgUrl,
  onClickIcon
}: {
  icon?: React.FC;
  text?: string;
  dataItem?: any;
  imgUrl?: string;
  onClickIcon: () => void;
}) => (
  <StyledSpace onClick={onClickIcon}>
    {icon && React.createElement(icon)}
    {imgUrl && React.createElement('img', { src: imgUrl }, null)}
    {text}
  </StyledSpace>
);

const PageDetail = ({ page, checkIsFollowed, isMobile }: PageDetailProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const [pageDetailData, setPageDetailData] = useState<any>(page);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const filterValue = useAppSelector(getFilterPostsPage);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const recentTagAtPages = useAppSelector(getRecentHashtagAtPages);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [suggestedHashtag, setSuggestedTags] = useState([]);
  const [query, setQuery] = useState<any>('');
  const [hashtags, setHashtags] = useState<any>([]);
  const postIdSelected = useAppSelector(getSelectedPostId);
  const refs = useRef([]);
  const pageAvatarUpload = useAppSelector(getPageAvatarUpload);
  const pageCoverUpload = useAppSelector(getPageCoverUpload);
  const [urlPageAvatarUpload, setUrlPageAvatarUpload] = useState('');
  const [urlPageCoverUpload, setUrlPageCoverUpload] = useState('');
  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();

  useEffect(() => {
    if (!_.isNil(pageAvatarUpload?.cfImageId)) {
      setUrlPageAvatarUpload(
        `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${pageAvatarUpload?.cfImageId}/public`
      );
    }
    if (!_.isNil(pageCoverUpload?.cfImageId)) {
      setUrlPageCoverUpload(
        `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${pageCoverUpload?.cfImageId}/public`
      );
    }
  }, [pageAvatarUpload, pageCoverUpload]);

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
  }, [router.query.hashtags]);

  useEffect(() => {
    if (router.query.q) {
      setQuery(router.query.q as string);
    } else {
      setQuery(null);
    }
  }, [router.query.q]);

  const [
    createFollowPageTrigger,
    {
      isLoading: isLoadingCreateFollowPage,
      isSuccess: isSuccessCreateFollowPage,
      isError: isErrorCreateFollowPage,
      error: errorOnCreate
    }
  ] = useCreateFollowPageMutation();

  const [
    deleteFollowPageTrigger,
    {
      isLoading: isLoadingDeleteFollowPage,
      isSuccess: isSuccessDeleteFollowPage,
      isError: isErrorDeleteFollowPage,
      error: errorOnDelete
    }
  ] = useDeleteFollowPageMutation();

  const [
    createPageMessageSessionTrigger,
    {
      isLoading: isLoadingCreatePageMessageSession,
      isSuccess: isSuccessCreatePageMessageSession,
      isError: isErrorCreatePageMessageSession
    }
  ] = useCreatePageMessageSessionMutation();

  const { data: pageMessageSessionData, refetch: pageMessageSessionRefetch } = useUserHadMessageToPageQuery(
    {
      accountId: selectedAccount?.id,
      pageId: page.id
    },
    { skip: selectedAccount?.id === page.pageAccountId || !selectedAccount?.id }
  );

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByPageIdQuery(
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
      id: page.id
    },
    false
  );

  const { data: hashtagData } = useInfiniteHashtagByPageQuery(
    {
      first: 3,
      orderBy: {
        direction: OrderDirection.Desc,
        field: HashtagOrderField.DanaBurnScore
      },
      id: page.id
    },
    false
  );

  useEffect(() => {
    const pageId = page.id;
    const topHashtags = _.map(hashtagData, 'content');
    const pageRecentHashtag = recentTagAtPages.find((page: any) => page.id === pageId);
    const recentHashtags: string[] = pageRecentHashtag?.hashtags || [];

    const combinedHashtags = [...topHashtags, ...recentHashtags.filter(tag => !topHashtags.includes(tag))];

    setSuggestedTags(combinedHashtags);
  }, [recentTagAtPages, hashtagData]);

  const loadMoreItems = () => {
    if (hasNext && !isFetching) {
      fetchNext();
    } else if (hasNext) {
      fetchNext();
    }
  };

  useEffect(() => {
    if (refs.current[postIdSelected]) {
      const listChildNodes = refs?.current[postIdSelected]?.offsetParent?.offsetParent?.childNodes;
      let headerNode = null;
      listChildNodes.forEach(node => {
        if (node?.localName === 'header') {
          headerNode = node;
        }
      });
      headerNode ? (headerNode.style.display = 'none') : null;
      refs.current[postIdSelected].firstChild.classList.add('active-post');
      refs.current[postIdSelected].scrollIntoView({ behaviour: 'smooth' });
      headerNode ? (headerNode.style.display = 'grid') : null;
      dispatch(setSelectedPost(''));
    }
  }, [data, postIdSelected]);

  const navigateEditPage = () => {
    dispatch(openModal('EditPageModal', { page: pageDetailData }));
  };

  const uploadModal = (isAvatar: boolean) => {
    dispatch(openModal('UploadAvatarCoverModal', { page: pageDetailData, isAvatar: isAvatar }));
  };

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useDidMountEffectNotification();

  const handleBurnForPost = async (isUpVote: boolean, post: any, optionBurn?: string) => {
    try {
      const burnValue = OPTION_BURN_VALUE[optionBurn];
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: page.pageAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
        }
      ];

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);
      const totalTip = fromSmallestDenomination(
        tipToAddresses.reduce((total, item) => total + parseFloat(item.amount), 0)
      );
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue) + totalTip
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
        extraArguments: {
          postQueryTag: PostsQueryTag.PostsByPageId,
          pageId: post.page?.id,
          minBurnFilter: filterValue,
          query: query,
          hashtags: hashtags
        }
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: intl.get('toast.error'),
          description: errorMessage,
          duration: 3
        })
      );
    }
  };

  const handleFollowPage = async () => {
    if (authorization.authorized) {
      const createFollowPageInput: CreateFollowPageInput = {
        accountId: selectedAccountId,
        pageId: pageDetailData.id
      };

      await createFollowPageTrigger({ input: createFollowPageInput });
    } else {
      askAuthorization();
    }
  };

  const handleUnfollowPage = async () => {
    if (authorization.authorized) {
      const deleteFollowPageInput: DeleteFollowPageInput = {
        accountId: selectedAccountId,
        pageId: pageDetailData.id
      };

      await deleteFollowPageTrigger({ input: deleteFollowPageInput });
    } else {
      askAuthorization();
    }
  };

  //#region QueryVirtuoso
  const { queryData, fetchNextQuery, hasNextQuery, isQueryFetching, isFetchingQueryNext, isQueryLoading, noMoreQuery } =
    useInfinitePostsBySearchQueryWithHashtagAtPage(
      {
        first: 20,
        minBurnFilter: filterValue ?? 1,
        query: query,
        hashtags: hashtags,
        pageId: page.id,
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      },
      false
    );

  const loadMoreQueryItems = () => {
    if (hasNextQuery && !isQueryFetching && !noMoreQuery) {
      fetchNextQuery();
    } else if (hasNextQuery && !noMoreQuery) {
      fetchNextQuery();
    }
  };

  const QueryFooter = () => {
    if (isQueryLoading) return null;
    return (
      <b
        style={{
          padding: '1rem 2rem 2rem 2rem',
          textAlign: 'center'
        }}
      >
        {isFetchingQueryNext ? <Skeleton avatar active /> : "It's so empty here..."}
      </b>
    );
  };
  //#endregion
  const onTopHashtagClick = e => {
    const hashtag = e.currentTarget.innerText;
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

    dispatch(addRecentHashtagAtPages({ id: page.id, hashtag: hashtag.substring(1) }));
  };

  const showPosts = () => {
    return (
      <React.Fragment>
        {!query && hashtags.length === 0 ? (
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreItems}
            hasMore={hasNext}
            loader={<Skeleton avatar active />}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>{data.length > 0 ? 'end reached' : ''}</b>
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {data.map((item, index) => {
              return (
                <div
                  key={item.id}
                  ref={element => {
                    refs.current[item.id] = element;
                  }}
                >
                  <PostListItem
                    index={index}
                    item={item}
                    key={item.id}
                    handleBurnForPost={handleBurnForPost}
                    postListType={PostListType.Page}
                    addToRecentHashtags={hashtag =>
                      dispatch(addRecentHashtagAtPages({ id: page.id, hashtag: hashtag.substring(1) }))
                    }
                  />
                </div>
              );
            })}
          </InfiniteScroll>
        ) : (
          <InfiniteScroll
            dataLength={queryData.length}
            next={loadMoreQueryItems}
            hasMore={hasNextQuery && !noMoreQuery}
            loader={<Skeleton avatar active />}
            endMessage={<QueryFooter />}
            scrollableTarget="scrollableDiv"
          >
            {queryData.map((item, index) => {
              return (
                <div
                  key={item.id}
                  ref={element => {
                    refs.current[item.id] = element;
                  }}
                >
                  <PostListItem
                    index={index}
                    item={item}
                    key={item.id}
                    handleBurnForPost={handleBurnForPost}
                    postListType={PostListType.Page}
                    addToRecentHashtags={hashtag =>
                      dispatch(addRecentHashtagAtPages({ id: page.id, hashtag: hashtag.substring(1) }))
                    }
                  />
                </div>
              );
            })}
          </InfiniteScroll>
        )}
      </React.Fragment>
    );
  };

  const openPageMessageLixiModal = () => {
    dispatch(openModal('PageMessageLixiModal', { account: selectedAccount, page: page, wallet: walletStatus }));
  };

  return (
    <React.Fragment>
      <StyledContainerProfileDetail className="page-detail">
        <ProfileCardHeader>
          <div className="container-img">
            <img
              className="cover-img"
              src={urlPageCoverUpload || pageDetailData?.cover || '/images/default-cover.jpg'}
              alt=""
            />
            {selectedAccountId == pageDetailData?.pageAccountId && (
              <Button type="primary" className="no-border-btn" onClick={() => uploadModal(false)}>
                <CameraOutlined />
                {intl.get('page.editCoverPhoto')}
              </Button>
            )}
          </div>
          <div className="info-profile">
            <div className="wrapper-avatar">
              <picture>
                <img
                  className="avatar-img"
                  src={urlPageAvatarUpload || pageDetailData?.avatar || '/images/default-avatar.jpg'}
                  alt=""
                />
              </picture>
              {/* TODO: implement in the future */}
              {selectedAccountId == pageDetailData?.pageAccountId && (
                <div className="btn-upload-avatar" onClick={() => uploadModal(true)}>
                  <CameraOutlined />
                </div>
              )}
            </div>
            <div className="title-profile">
              <h2>{pageDetailData.name}</h2>
              <p>{intl.get('category.' + pageDetailData.category.name)}</p>
            </div>
            {/* TODO: implement in the future */}
            {selectedAccountId == pageDetailData?.pageAccountId && (
              <div className="action-profile">
                <Button
                  type="primary"
                  className="outline-btn"
                  icon={
                    <ReactSVG wrapper="span" className="anticon anticon-custom" src="/images/ico-edit-square.svg" />
                  }
                  onClick={navigateEditPage}
                >
                  {intl.get('page.editPage')}
                </Button>
                <Button type="primary" className="outline-btn btn-edit-cover" onClick={() => uploadModal(false)}>
                  <CameraOutlined />
                  {intl.get('page.editCoverPhoto')}
                </Button>
              </div>
            )}
            {/* Follow */}
            {selectedAccountId != pageDetailData?.pageAccountId && (
              <div>
                {/* Chat */}
                {selectedAccountId != pageDetailData?.pageAccountId && _.isNil(pageMessageSessionData) && (
                  <Button type="primary" className="outline-btn" onClick={() => openPageMessageLixiModal()}>
                    {intl.get('messenger.chatPage')}
                  </Button>
                )}
                {selectedAccountId != pageDetailData?.pageAccountId && pageMessageSessionData && (
                  <React.Fragment>
                    {
                      {
                        [PageMessageSessionStatus.Open]: (
                          <Button type="primary" className="outline-btn">
                            {intl.get('messenger.openMessage')}
                          </Button>
                        ),
                        [PageMessageSessionStatus.Pending]: (
                          <Button type="primary" className="outline-btn" disabled>
                            {intl.get('messenger.pendingMessage')}
                          </Button>
                        )
                      }[pageMessageSessionData.userHadMessageToPage.status]
                    }
                  </React.Fragment>
                )}
                <Button
                  type="primary"
                  className="outline-btn"
                  style={{ marginLeft: '0.5rem' }}
                  onClick={checkIsFollowed ? handleUnfollowPage : handleFollowPage}
                >
                  {checkIsFollowed ? intl.get('general.unfollow') : intl.get('general.follow')}
                </Button>
              </div>
            )}
          </div>
          <div className="description-profile">
            {pageDetailData.description && (
              <p>
                <InfoCircleOutlined /> {pageDetailData.description}
              </p>
            )}

            {(pageDetailData.address || pageDetailData.stateName || pageDetailData.countryName) && (
              <p>
                <HomeOutlined />{' '}
                {[pageDetailData.address, pageDetailData.stateName, pageDetailData.countryName]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}

            {pageDetailData.website && (
              <p>
                <CompassOutlined />
                {<a href={pageDetailData.website}> {pageDetailData.website}</a>}
              </p>
            )}

            <p>
              {' '}
              <FireOutlined /> {pageDetailData?.totalBurnForPage + intl.get('general.dana')}
            </p>
          </div>
        </ProfileCardHeader>
        <ProfileContentContainer>
          <StyledMenu defaultActiveKey="post">
            <Tabs.TabPane tab="Post" key="post">
              {/* TODO: implement in the future */}
              {/* <LegacyProfile>
                <AboutBox>
                  <h3>About</h3>
                  {pageDetailData && !pageDetailData.description && (
                    <div className="blank-about">
                      <img src="/images/about-blank.svg" alt="" />
                      <p>Let people know more about you (description, hobbies, address...</p>
                      <Button type="primary" className="outline-btn">
                        Update info
                      </Button>
                    </div>
                  )}
                  <div className="about-content">
                    <SubAbout
                      dataItem={pageDetailData?.description}
                      onClickIcon={() => {}}
                      icon={InfoCircleOutlined}
                      text={pageDetailData?.description}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.address}
                      onClickIcon={() => {}}
                      icon={CompassOutlined}
                      text={pageDetailData?.address}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.website}
                      onClickIcon={() => {}}
                      icon={HomeOutlined}
                      text={pageDetailData?.website}
                    />
                    {selectedAccountId == pageDetailData?.pageAccountId && (
                      <Button type="primary" className="outline-btn" onClick={navigateEditPage}>
                        Edit your profile
                      </Button>
                    )}
                  </div>
                </AboutBox>
                <PictureBox>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Pictures</h3>
                    {listsPicture && listsPicture.length > 0 && (
                      <Button type="primary" className="no-border-btn" style={{ padding: '0' }}>
                        See all
                      </Button>
                    )}
                  </div>
                  {listsPicture && listsPicture.length == 0 && (
                    <div className="blank-picture">
                      <img src="/images/photo-blank.svg" alt="" />
                      <p>Photos uploaded in posts, or posts that have tag of your name</p>
                      <Button type="primary" className="outline-btn">
                        Update picture
                      </Button>
                    </div>
                  )}
                  {listsPicture && listsPicture.length > 0 && (
                    <div className="picture-content">
                      {listsPicture.map((item: any, index: number) => {
                        if (index < 9) return <img key={item.id} src={item.download_url} alt={item.author} />;
                      })}
                    </div>
                  )}
                </PictureBox>
                <FriendBox>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3>Friends</h3>
                      <p
                        style={{
                          margin: '0',
                          fontSize: '13px',
                          letterSpacing: '0.5px',
                          color: 'rgba(30, 26, 29, 0.6)'
                        }}
                      >
                        {listsFriend.length > 0 ? listsFriend.length + ' friends' : ''}
                      </p>
                    </div>
                    {listsFriend && listsFriend.length > 0 && (
                      <Button type="primary" className="no-border-btn" style={{ padding: '0' }}>
                        See all
                      </Button>
                    )}
                  </div>
                  {listsFriend && listsFriend.length == 0 && (
                    <div className="blank-friend">
                      <img src="/images/friend-blank.svg" alt="" />
                      <p>Connect with people you know in Lixi.</p>
                      <Button type="primary" className="outline-btn">
                        Discover Lixi social network
                      </Button>
                    </div>
                  )}
                  {listsFriend && listsFriend.length > 0 && (
                    <div className="friend-content">
                      {listsFriend.map((item: any, index: number) => {
                        if (index < 9)
                          return (
                            <div key={item.id} className="friend-item">
                              <img src={item.download_url} alt="" />
                              <p>{item.author}</p>
                            </div>
                          );
                      })}
                    </div>
                  )}
                </FriendBox>
              </LegacyProfile> */}
              <ContentTimeline>
                <div className="search-bar">
                  <SearchBox />
                  {/* <FilterBurnt filterForType={FilterType.PostsPage} /> */}
                </div>
                <CreatePostCard page={page} hashtags={hashtags} query={query} />
                <TagContainer>
                  {hashtagData &&
                    hashtagData.map(tag => (
                      <StyledTag key={tag.id} color="green" onClick={onTopHashtagClick}>
                        {`#${tag.normalizedContent}`}
                      </StyledTag>
                    ))}
                </TagContainer>

                <Timeline>
                  {/* <Button
                    title="Change"
                    onClick={() => {
                      setHashtags(['#angular']);
                      setQuery('angular');
                    }}
                  /> */}
                  {data.length == 0 && (
                    <div className="blank-timeline">
                      <img className="time-line-blank" src="/images/time-line-blank.svg" alt="" />
                      <p>Become a first person post on the page...</p>
                    </div>
                  )}
                  {showPosts()}
                </Timeline>
              </ContentTimeline>
            </Tabs.TabPane>
            {/* <Tabs.TabPane tab="About" key="about">
              <LegacyProfile>
                <AboutBox>
                  <h3>About</h3>
                  {pageDetailData && !pageDetailData.description && (
                    <div className="blank-about">
                      <img src="/images/about-blank.svg" alt="" />
                      <p>Let people know more about you description, hobbies, address...</p>
                      <Button type="primary" className="outline-btn">
                        Update info
                      </Button>
                    </div>
                  )}
                  <div className="about-content">
                    <SubAbout
                      dataItem={pageDetailData?.description}
                      onClickIcon={() => {}}
                      icon={InfoCircleOutlined}
                      text={pageDetailData?.description}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.address}
                      onClickIcon={() => {}}
                      icon={CompassOutlined}
                      text={pageDetailData?.address}
                    />
                    <SubAbout
                      dataItem={pageDetailData?.website}
                      onClickIcon={() => {}}
                      icon={HomeOutlined}
                      text={pageDetailData?.website}
                    />
                  </div>
                </AboutBox>
              </LegacyProfile>
            </Tabs.TabPane> */}
            {/* TODO: implement in the future */}
            {/* <Tabs.TabPane tab="Friend" key="friend"></Tabs.TabPane>
            <Tabs.TabPane tab="Picture" key="picture"></Tabs.TabPane> */}
          </StyledMenu>
        </ProfileContentContainer>
      </StyledContainerProfileDetail>
    </React.Fragment>
  );
};

export default PageDetail;
