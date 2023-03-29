import React, { useState, useRef, ReactNode } from 'react';
import style from 'styled-components';
import WorshipCard from './WorshipCard';
import { Space, Tabs } from 'antd';
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
import { AllWorshipedByPersonIdQuery } from '@store/worship/worshipedPerson.generated';

export type PersonType = AllWorshipedByPersonIdQuery['allWorshipedByPersonId']['edges'][0]['node'];

type PersonDetail = {
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
  background-position: center;
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

const PersonDetail = ({ person, isMobile }: PersonDetail) => {
  const dispatch = useAppDispatch();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletStatus = useAppSelector(getWalletStatus);
  const failQueue = useAppSelector(getFailQueue);
  const walletPaths = useAppSelector(getAllWalletPaths);

  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      label: 'Tưởng niệm',
      key: 'worship',
      children: (
        <React.Fragment>
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
          <WorshipCard />
        </React.Fragment>
      )
    },
    {
      label: 'Thông tin',
      key: 'info',
      children: <PersonInfo />
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

  return (
    <React.Fragment>
      <StyledPersonCard>
        <StyledTopCard>
          <StyledPersonCover>
            <StyledPersonAvatar avatar="/images/placeholderAvatar.svg" />
          </StyledPersonCover>
          <StyledPersonName>{person.name}</StyledPersonName>
          <StyledPersonDate>1752 - 16 tháng 9,1972</StyledPersonDate>
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
              <StyledText>{person.totalWorshipAmount} XPI</StyledText>
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
      </StyledPersonCard>
    </React.Fragment>
  );
};

export default PersonDetail;
