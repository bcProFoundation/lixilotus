import React, { useState, useRef, ReactNode, useEffect } from 'react';
import style from 'styled-components';
import WorshipPersonCard from './WorshipCard';
import { Space, Tabs, Skeleton, Tooltip } from 'antd';
import type { TabsProps } from 'antd';
import PersonInfo from './PersonInfo';
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
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { WorshipedPersonQuery } from '@store/worship/worshipedPerson.generated';
import { useInfiniteWorshipByPersonIdQuery } from '@store/worship/useInfiniteWorshipByPersonIdQuery';
import InfiniteScroll from 'react-infinite-scroll-component';
import { OrderDirection, WorshipedPersonOrderField, WorshipOrderField } from 'src/generated/types.generated';
import useDidMountEffectNotification from '@hooks/useDidMountEffectNotification';
import { addRecentVisitedPerson, setTransactionReady } from '@store/account/actions';
import { Counter } from '@components/Common/Counter';
import moment from 'moment';

export type PersonType = WorshipedPersonQuery['worshipedPerson'];

type PersonDetailProp = {
  person: PersonType;
  isMobile: boolean;
};

const StyledTab = style(Tabs)`
  margin-top: 10px;
`;

const StyledPersonCard = style.div`
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

const StyledPersonCover = style.div`
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

const StyledPersonAvatar: any = style.div`
  width: 150px;
  height: 200px;
  background: #D9D9D9;
  border-radius: 40px;
  background-image: url(${(props: any) => props.avatar});
  background-size: 175px;
  background-position-x: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  box-shadow: inset 0px 0px 4px #000000;
`;

const StyledPersonName = style.p`
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 800;
  font-size: 24px;
  line-height: 36px;
  margin-bottom: 0px;
`;

const StyledPersonDate = style.p`
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

const PersonDetail = ({ person, isMobile }: PersonDetailProp) => {
  const dispatch = useAppDispatch();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);

  useEffect(() => {
    dispatch(addRecentVisitedPerson(person));
  }, []);

  const onChange = (key: string) => {
    console.log(key);
  };

  const { data, totalCount, fetchNext, hasNext, isFetching, isFetchingNext, refetch } =
    useInfiniteWorshipByPersonIdQuery(
      {
        first: 20,
        id: person.id,
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
              return <WorshipPersonCard index={index} item={item} key={item.id} />;
            })}
          </InfiniteScroll>
        </React.Fragment>
      )
    },
    {
      label: 'Thông tin',
      key: 'info',
      children: <PersonInfo person={person} />
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
      const burnForId = person.id;
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

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useDidMountEffectNotification();

  return (
    <React.Fragment>
      <StyledPersonCard>
        <StyledTopCard>
          <StyledPersonCover>
            <StyledPersonAvatar avatar={person.wikiAvatar ? person.wikiAvatar : '/images/placeholderAvatar.svg'} />
          </StyledPersonCover>
          <StyledPersonName>{person.name}</StyledPersonName>
          <StyledPersonDate>
            {person.dateOfBirth ? moment(person.dateOfBirth).locale('vi-vn').format('Do MMMM YYYY') : ''} -{' '}
            {person.dateOfDeath ? moment(person.dateOfDeath).locale('vi-vn').format('Do MMMM YYYY') : ''}
          </StyledPersonDate>
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
              <StyledText>
                <Counter num={person.totalWorshipAmount ?? 0} />
              </StyledText>
            </Space>
          </StyledWorshipInfo>
          <StyledActionContainer>
            <Tooltip title={`${WORSHIP_TYPES.INCENSE} XPI`}>
              <picture onClick={() => handleWorship(WORSHIP_TYPES.INCENSE)}>
                <StyledActionIcon alt="incense" src="/images/incense.svg" />
              </picture>
            </Tooltip>

            <Tooltip title={`${WORSHIP_TYPES.CANDLE} XPI`}>
              <picture onClick={() => handleWorship(WORSHIP_TYPES.CANDLE)}>
                <StyledActionIcon alt="candle" src="/images/candle.svg" />
              </picture>
            </Tooltip>

            <Tooltip title={`${WORSHIP_TYPES.FLOWER} XPI`}>
              <picture onClick={() => handleWorship(WORSHIP_TYPES.FLOWER)}>
                <StyledActionIcon alt="lotus-burn" src="/images/lotus-burn.svg" />
              </picture>
            </Tooltip>
          </StyledActionContainer>
        </StyledBottomCard>
        <StyledTab defaultActiveKey="1" items={items} onChange={onChange} />
      </StyledPersonCard>
    </React.Fragment>
  );
};

export default PersonDetail;
