import React from 'react';
import { HashtagQuery } from '@store/hashtag/hashtag.generated';
import { useInfinitePostsByHashtagIdQuery } from '@store/post/useInfinitePostsByHashtagIdQuery';
import { OrderDirection, PostOrderField } from '@generated/types.generated';
import styled from 'styled-components';
import PostListItem from '@components/Posts/PostListItem';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { getSelectedAccount } from '@store/account';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { showToast } from '@store/toast/actions';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import BigNumber from 'bignumber.js';
import intl from 'react-intl-universal';
import { currency } from '@components/Common/Ticker';
import _ from 'lodash';
import { getFilterPostsHome } from '@store/settings';
import CreatePostCard from '@components/Common/CreatePostCard';

type HashtagItem = HashtagQuery['hashtag'];

type HashtagProps = {
  hashtag: HashtagItem;
  isMobile: boolean;
};

const StyledHeader = styled.div`
  font-weight: bold;
  text-align: left;
  font-size: 35px;
  margin: 10px 0px 10px 0px;
  font-style: italic;
`;

const StyledContainer = styled.div`
  margin: 1rem auto;
  width: 100%;
  max-width: 816px;
`;

const Hashtag = ({ hashtag, isMobile }: HashtagProps) => {
  const dispatch = useAppDispatch();
  const walletPaths = useAppSelector(getAllWalletPaths);
  const walletStatus = useAppSelector(getWalletStatus);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const failQueue = useAppSelector(getFailQueue);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const filterValue = useAppSelector(getFilterPostsHome);
  const hashtags: string[] = [`#${hashtag.content}`];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } =
    useInfinitePostsByHashtagIdQuery(
      {
        first: 10,
        minBurnFilter: filterValue ?? 1,
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        },
        id: hashtag.id
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

  useDidMountEffectNotification();

  const handleBurnForPost = async (isUpVote: boolean, post: any) => {
    try {
      const burnValue = '1';
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue)
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
        }
      ];

      if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
        tipToAddresses.push({
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
        });
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);

      let tag: string;

      if (_.isNil(post.page) && _.isNil(post.token)) {
        tag = PostsQueryTag.Posts;
      } else if (post.page) {
        tag = PostsQueryTag.PostsByPageId;
      } else if (post.token) {
        tag = PostsQueryTag.PostsByTokenId;
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
          pageId: post.page?.id,
          tokenId: post.token?.id,
          hashtagId: hashtag.id,
          minBurnFilter: filterValue,
          postQueryTag: tag
        }
      };

      dispatch(addBurnQueue(_.omit(burnCommand)));
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

  return (
    <StyledContainer>
      <StyledHeader>{`#${hashtag.content}`}</StyledHeader>
      <CreatePostCard hashtags={hashtags} hashtagId={hashtag.id} />
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
          return <PostListItem index={index} item={item} key={item.id} handleBurnForPost={handleBurnForPost} />;
        })}
      </InfiniteScroll>
    </StyledContainer>
  );
};

export default Hashtag;
