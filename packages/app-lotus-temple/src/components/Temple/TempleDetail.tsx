import React, { useState, useRef, ReactNode, useEffect } from 'react';
import style from 'styled-components';
import WorshipTempleCard from './WorshipTempleCard';
import { Space, Tabs, Skeleton } from 'antd';
import type { TabsProps } from 'antd';
import TempleInfo from './TempleInfo';
import { FireOutlined } from '@ant-design/icons';
import { WorshipedPerson } from '@bcpros/lixi-models';
import { WORSHIP_TYPES } from '@bcpros/lixi-models/constants';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination } from '@utils/cashMethods';
import intl from 'react-intl-universal';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { currency } from '@components/Common/Ticker';
import { showToast } from '@store/toast/actions';
import _ from 'lodash';
import { BurnCommand, BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { AllWorshipedByPersonIdQuery } from '@store/worship/worshipedPerson.generated';
import { WorshipedPersonQuery } from '@store/worship/worshipedPerson.generated';
import { useInfiniteWorshipByPersonIdQuery } from '@store/worship/useInfiniteWorshipByPersonIdQuery';
import InfiniteScroll from 'react-infinite-scroll-component';
import { OrderDirection, WorshipedPersonOrderField, WorshipOrderField } from 'src/generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { setTransactionReady } from '@store/account/actions';
import { Counter } from '@components/Common/Counter';

export type PersonType = WorshipedPersonQuery['worshipedPerson'];

type TempleDetail = {
  temple: any;
  isMobile: boolean;
};

const StyledTab = style(Tabs)`
  margin-top: 10px;
`;

const StyledTempleCard = style.div`
  width: 700px;
  display: flex;
  flex-direction: column
`;

const StyledTopCard = style.div`
  width: 100%;
  display: flex;
  margin-top: 10px;
  background: #FFFFFF;
  border-radius: 24px 24px 0 0px;
  flex-direction: column
`;

const StyledBottomCard = style.div`
  width: 100%;
  display: flex;
  background: #FFFFFF;
  border-top: 1px solid #CDCCCA;
  border-radius: 0 0 24px 24px ;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 16px 32px;
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
  border-radius: 30px;
  background-image: url(${(props: any) => props.avatar});
  background-size: 250px;
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  box-shadow: inset 0px 0px 4px #000000;
`;

const StyledTempleName = style.p`
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 36px;
  margin-bottom: 10px;
`;

const StyledTempleDate = style.p`
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 22px;
  line-height: 28px;
`;

const StyledActionContainer = style.div`
  display: flex;
  width: 50%;
  justify-content: space-evenly
`;

const StyledWorshipInfo = style.div`
  display: flex;
  width: 50%;
  flex-direction: column;
`;

const StyledText = style.span`
  font-size: 16px;
  line-height: 24px;
  font-weight: bold;
`;

const StyledActionIcon = style.img`
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
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
    useInfiniteWorshipByPersonIdQuery(
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
        burnValue: burnValue.toString()
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
      children: <TempleInfo />
    }
  ];

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useDidMountEffectNotification();

  return (
    <React.Fragment>
      <StyledTempleCard>
        <StyledTopCard>
          <StyledTempleCover>
            <StyledTempleAvatar avatar="/images/lotus-temple-placeholder.jpg" />
          </StyledTempleCover>
          <StyledTempleName>{temple.name}</StyledTempleName>
          {/* <StyledTempleDate>1752 - 16 tháng 9,1972</StyledTempleDate> */}
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
                <img alt="burn-icon" src="/images/burn-icon.svg" width="32px" />
              </picture>
              <StyledText>10.5K XPI</StyledText>
            </Space>
          </StyledWorshipInfo>
          <StyledActionContainer>
            <picture onClick={() => handleWorship(WORSHIP_TYPES.INCENSE)}>
              <StyledActionIcon alt="incense" src="/images/incense.svg" />
            </picture>
            <picture onClick={() => handleWorship(WORSHIP_TYPES.CANDLE)}>
              <StyledActionIcon alt="candle" src="/images/candle.svg" />
            </picture>
            <picture onClick={() => handleWorship(WORSHIP_TYPES.FLOWER)}>
              <StyledActionIcon alt="lotus-burn" src="/images/lotus-burn.svg" />
            </picture>
          </StyledActionContainer>
        </StyledBottomCard>
        <StyledTab defaultActiveKey="1" items={items} onChange={onChange} />
      </StyledTempleCard>
    </React.Fragment>
  );
};

export default TempleDetail;
