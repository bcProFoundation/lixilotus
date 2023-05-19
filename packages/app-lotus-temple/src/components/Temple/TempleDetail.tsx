import React, { useRef } from 'react';
import style from 'styled-components';
import WorshipTempleCard from './WorshipTempleCard';
import { Space, Tabs, Skeleton, Tooltip } from 'antd';
import type { TabsProps } from 'antd';
import TempleInfo from './TempleInfo';
import { WORSHIP_AMOUNT_TYPES, WORSHIP_TYPES } from '@bcpros/lixi-models/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination } from '@utils/cashMethods';
import intl from 'react-intl-universal';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { currency } from '@components/Common/Ticker';
import { showToast } from '@store/toast/actions';
import _ from 'lodash';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { useInfiniteWorshipByTempleIdQuery } from '@store/worship/useInfiniteWorshipByTempleIdQuery';
import InfiniteScroll from 'react-infinite-scroll-component';
import { OrderDirection, WorshipOrderField } from '@generated/types.generated';
import { Counter } from '@components/Common/Counter';
import { TempleQuery } from '@store/temple/temple.generated';
import moment from 'moment';

export type TempleType = TempleQuery['temple'];

type TempleDetail = {
  temple: TempleType;
  isMobile: boolean;
};

const StyledTab = style(Tabs)`
  margin-top: 10px;
`;

const StyledTempleCard = style.div`
  display: flex;
  flex-direction: column
`;

const StyledTopCard = style.div`
  width: 100%;
  display: flex;
  margin-top: 10px;
  background: var(--bg-color-person-card-light-theme);
  border-radius: 24px 24px 0 0px;
  flex-direction: column
`;

const StyledBottomCard = style.div`
  width: 100%;
  display: flex;
  background: var(--bg-color-person-card-light-theme);
  border-top: 1px solid rgba(255, 255, 255, 0.12);;
  border-radius: 0 0 24px 24px ;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 16px 32px;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const StyledTempleCover = style.div`
  background-image: url(/images/placeholder.svg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 500px;
  display:flex;
  width: 100%;
  height: 220px;
  justify-content: center;
  align-items: center;
  margin-top:30px;
`;

const StyledTempleAvatar: any = style.div`
  width: 250px;
  height: 200px;
  background: #D9D9D9;
  border-radius: 40px;
  background-image: url(${(props: any) => props.avatar});
  background-size: 250px;
  background-position-x: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  box-shadow: inset 0px 0px 4px #000000;
`;

const StyledTempleName = style.p`
  font-family: 'Open Sans';
  color: var(--text-color-on-background);
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 36px;
  margin-bottom: 0px;
`;

const StyledTempleDate = style.p`
  font-family: 'Open Sans';
  color: var(--text-color-on-background);
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
`;

const StyledActionContainer = style.div`
  display: flex;
  width: 50%;
  justify-content: space-evenly;

  @media (max-width: 480px) {
    width: 100%;
    align-items: center;
  }
`;

const StyledWorshipInfo = style.div`
  display: flex;
  width: 50%;
  flex-direction: column;

  @media (max-width: 480px) {
    width: 100%;
    align-items: center;
    margin-top: 20px;
  }
`;

const StyledText = style.span`
  color: var(--text-color-on-background);
  font-size: 16px;
  line-height: 24px;
  font-weight: bold;
`;

const StyledActionIcon = style.img`
  width: 60px;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  @media (max-width: 480px) {
    width: 72px;
  }
`;

const TempleDetail = ({ temple, isMobile }: TempleDetail) => {
  const dispatch = useAppDispatch();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);

  const onChange = (key: string) => {
    console.log(key);
  };

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } =
    useInfiniteWorshipByTempleIdQuery(
      {
        first: 20,
        id: temple.id,
        orderBy: {
          direction: OrderDirection.Desc,
          field: WorshipOrderField.UpdatedAt
        }
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

  const items: TabsProps['items'] = [
    {
      label: 'Tưởng niệm',
      key: 'worship',
      children: (
        <React.Fragment>
          <InfiniteScroll
            dataLength={data.length}
            next={loadMoreItems}
            hasMore={hasNext}
            loader={<Skeleton avatar active />}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>{"It's so empty here..."}</b>
              </p>
            }
            scrollableTarget="scrollableDiv"
          >
            {data.map((item, index) => {
              return <WorshipTempleCard index={index} item={item} key={item.id} />;
            })}
          </InfiniteScroll>
        </React.Fragment>
      )
    },
    {
      label: 'Thông tin',
      key: 'info',
      children: <TempleInfo temple={temple} />
    }
  ];

  const handleWorship = async (worshipAmount: number) => {
    try {
      const burnValue = worshipAmount;
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < burnValue
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = BurnType.Up;
      const burnedBy = hash160;
      const burnForId = temple.id;
      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: BurnForType.Worship,
        burnedBy,
        burnForId,
        burnValue: burnValue.toString(),
        worshipType: WORSHIP_TYPES.TEMPLE
      };
      dispatch(addBurnQueue(_.omit(burnCommand)));
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
    <React.Fragment>
      <StyledTempleCard>
        <StyledTopCard>
          <StyledTempleCover>
            <StyledTempleAvatar avatar={temple.avatar ? temple.avatar : '/images/lotus-temple-placeholder.jpg'} />
          </StyledTempleCover>
          <StyledTempleName>{temple.name}</StyledTempleName>
          <StyledTempleDate>
            {temple.dateOfCompleted ? moment(temple.dateOfCompleted).locale('vi').format('Do MMMM YYYY') : ''}
          </StyledTempleDate>
        </StyledTopCard>
        <StyledBottomCard>
          <StyledWorshipInfo>
            <Space style={{ marginBottom: '3px' }}>
              <picture>
                <img alt="lotus-logo" src="/images/lotus_logo.png" width="32px" />
              </picture>
              <StyledText>Lotus Temple Official</StyledText>
            </Space>
            <Space>
              <picture>
                <img alt="fire-icon-light" src="/images/fire-icon-light.svg" width="32px" />
              </picture>
              <StyledText>
                <Counter num={temple.totalWorshipAmount ?? 0} />
              </StyledText>
            </Space>
          </StyledWorshipInfo>
          <StyledActionContainer>
            <Tooltip title={`${WORSHIP_AMOUNT_TYPES.FLOWER} XPI`}>
              <picture onClick={() => handleWorship(WORSHIP_AMOUNT_TYPES.FLOWER)}>
                <StyledActionIcon alt="flowers" src="/images/flowers.svg" />
              </picture>
            </Tooltip>

            <Tooltip title={`${WORSHIP_AMOUNT_TYPES.INCENSE} XPI`}>
              <picture onClick={() => handleWorship(WORSHIP_AMOUNT_TYPES.INCENSE)}>
                <StyledActionIcon alt="incense" src="/images/incense.svg" />
              </picture>
            </Tooltip>

            <Tooltip title={`${WORSHIP_AMOUNT_TYPES.CANDLE} XPI`}>
              <picture onClick={() => handleWorship(WORSHIP_AMOUNT_TYPES.CANDLE)}>
                <StyledActionIcon alt="candle" src="/images/candle.svg" />
              </picture>
            </Tooltip>
          </StyledActionContainer>
        </StyledBottomCard>
        <StyledTab defaultActiveKey="1" items={items} onChange={onChange} centered />
      </StyledTempleCard>
    </React.Fragment>
  );
};

export default TempleDetail;
