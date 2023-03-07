import { CopyOutlined, DownOutlined, FireOutlined, FireTwoTone } from '@ant-design/icons';
import CreatePostCard from '@components/Common/CreatePostCard';
import SearchBox from '@components/Common/SearchBox';
import { currency } from '@components/Common/Ticker';
import PostListItem from '@components/Posts/PostListItem';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useInfinitePostsByTokenIdQuery } from '@store/post/useInfinitePostsByTokenIdQuery';
import { getSelectedToken, getToken } from '@store/token';
import { useTokenQuery } from '@store/token/tokens.api';
import { formatBalance, fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { Button, Dropdown, Image, Menu, MenuProps, message, notification, Skeleton, Space, Tabs } from 'antd';
import makeBlockie from 'ethereum-blockies-base64';
import React, { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { OrderDirection, PostOrderField, Token } from 'src/generated/types.generated';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import UpVoteSvg from '@assets/icons/upVotePurple.svg';
import { InfoSubCard } from '@components/Lixi';
import moment from 'moment';
import intl from 'react-intl-universal';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { IconBurn } from '@components/Posts/PostDetail';
import BigNumber from 'bignumber.js';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { getSelectedAccount } from '@store/account/selectors';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { addBurnQueue, addBurnTransaction, getBurnQueue, getFailQueue, removeAllFailQueue } from '@store/burn';
import useDidMountEffect from '@hooks/useDidMountEffect ';
import { setTransactionReady } from '@store/account/actions';
import { showToast } from '@store/toast/actions';
import { TokenQuery } from '@store/token/tokens.generated';
import { showBurnNotification } from '@components/Common/showBurnNotification';

export type TokenItem = TokenQuery['token'];

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
  @media (max-width: 960px) {
    padding-bottom: 7rem;
  }
`;

const BannerTicker = styled.div`
  padding: 2rem;
  background-image: url(/images/xec-home-bg.svg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid var(--boder-item-light);
  border-radius: 24px;
  .banner-detail {
    display: flex;
    gap: 2rem;
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
        color: #fff;
      }
      .ant-space {
        flex-direction: row;
        justify-content: center;
        align-items: baseline;
        .type-name {
          min-width: 80px;
          text-align: left;
          color: #edeff099;
        }
        .content {
          margin-top: 4px;
          color: #fff;
          .anticon {
            margin-left: 4px;
          }
        }
      }
    }
    @media (max-width: 960px) {
      flex-direction: column;
    }
  }
  .score-ticker {
    margin-top: 1rem;
    text-align: right;
    .count {
      color: #edeff099 !important;
    }
    span {
      color: #edeff099 !important;
    }
    span {
      font-size: 14px;
      line-height: 28px;
      color: #4e444b;
      &.burn-index {
        margin-right: 2rem;
      }
    }
  }
  @media (max-width: 960px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }
`;

type TokenProps = {
  token: any;
  isMobile: boolean;
};

const TokensFeed = ({ token, isMobile }: TokenProps) => {
  const dispatch = useAppDispatch();
  const [tokenDetailData, setTokenDetailData] = useState<any>(token);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const burnQueue = useAppSelector(getBurnQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);

  let options = ['Withdraw', 'Rename', 'Export'];

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } = useInfinitePostsByTokenIdQuery(
    {
      first: 10,
      orderBy: {
        direction: OrderDirection.Desc,
        field: PostOrderField.UpdatedAt
      },
      id: token.id
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

  const handleOnCopy = (id: string) => {
    notification.info({
      message: intl.get('token.copyId'),
      description: id,
      placement: 'top'
    });
  };

  const menus = options.map(option => <Menu.Item key={option}>{option}</Menu.Item>);

  const UpvoteIcon = () => {
    return (
      <>
        <UpVoteSvg />
      </>
    );
  };

  useDidMountEffect(() => {
    console.log('txid has changed');
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useDidMountEffect(() => {
    if (burnQueue.length > 0) {
      showBurnNotification('info', burnQueue);
    } else {
      showBurnNotification('success');
    }

    if (failQueue.length > 0) {
      showBurnNotification('error');
    }
  }, [burnQueue, failQueue]);

  const handleBurnForPost = async (isUpVote: boolean, post: any) => {
    try {
      const burnValue = '1';
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue)
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }
      if (failQueue.length > 0) dispatch(removeAllFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = post.id;
      let tipToAddresses: { address: string; amount: string }[] = [
        {
          address: post.page ? post.pageAccount.address : post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        }
      ];

      if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
        tipToAddresses.push({
          address: post.postAccount.address,
          amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)) as unknown as string
        });
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);

      const burnCommand: any = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: BurnForType.Post,
        burnedBy,
        burnForId,
        burnValue,
        tipToAddresses: tipToAddresses,
        postQueryTag: PostsQueryTag.PostsByTokenId,
        tokenId: post.token?.id
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = e.message || intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: errorMessage,
          duration: 3
        })
      );
    }
  };

  return (
    <StyledTokensFeed>
      <BannerTicker>
        <div className="banner-detail">
          <div className="avatar-ticker">
            <Image
              width={120}
              height={120}
              src={`${currency.tokenIconsUrl}/128/${tokenDetailData.tokenId}.png`}
              fallback={makeBlockie(tokenDetailData?.tokenId ?? '')}
              preview={false}
            />
          </div>
          <div className="info-ticker">
            <h4 className="title-ticker">{tokenDetailData['ticker']}</h4>
            <InfoSubCard typeName={'Name:'} content={tokenDetailData.name} />
            <CopyToClipboard text={tokenDetailData.tokenId} onCopy={() => handleOnCopy(tokenDetailData.tokenId)}>
              <div>
                <InfoSubCard
                  typeName={'ID:'}
                  content={tokenDetailData.tokenId.slice(0, 7) + '...' + tokenDetailData.tokenId.slice(-7)}
                  icon={CopyOutlined}
                />
              </div>
            </CopyToClipboard>
            <InfoSubCard
              typeName={'Created:'}
              content={moment(tokenDetailData.createdDate).format('YYYY-MM-DD HH:MM')}
            />
          </div>
        </div>
        <div className="score-ticker">
          <IconBurn
            imgUrl="/images/ico-burn-up.svg"
            burnValue={formatBalance(tokenDetailData?.lotusBurnUp ?? 0)}
            key={`list-vertical-upvote-o-${tokenDetailData.id}`}
            dataItem={tokenDetailData}
            onClickIcon={() => {}}
          />
        </div>
      </BannerTicker>

      <CreatePostCard tokenPrimaryId={tokenDetailData.id} refetch={() => refetch()} />
      <SearchBox />

      <div className="content">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Top discussions" key="1">
            <React.Fragment>
              <InfiniteScroll
                dataLength={data.length}
                next={loadMoreItems}
                hasMore={hasNext}
                loader={<Skeleton avatar active />}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <p>{data.length > 0 ? 'end reached' : "It's so empty here..."}</p>
                  </p>
                }
                scrollableTarget="scrollableDiv"
              >
                {data.map((item, index) => {
                  return <PostListItem index={index} item={item} key={item.id} handleBurnForPost={handleBurnForPost} />;
                })}
              </InfiniteScroll>
            </React.Fragment>
            {/* <div className={'listing'} style={{ height: '100vh' }}>
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
            </div> */}
          </Tabs.TabPane>
          {/* <Tabs.TabPane tab="Most recent" key="2">
            Content of Tab Pane 2
          </Tabs.TabPane> */}
        </Tabs>
        <div className="filter">
          {/* <Dropdown overlay={<Menu onClick={e => handleMenuClick(e)}>{menus}</Menu>}>
            <Button type="primary" className="outline-btn">
              <Space>
                All favorables
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown> */}
        </div>
      </div>
    </StyledTokensFeed>
  );
};

export default TokensFeed;
