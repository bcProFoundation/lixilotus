import { Dropdown, Image, Modal, notification, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import { isIOS, isMobile, isSafari } from 'react-device-detect';
import { useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { viewRedeem } from 'src/store/redeem/actions';
import { getCurrentLixiRedeem } from 'src/store/redeem/selectors';
import styled from 'styled-components';
import WalletLabel from '@abcpros/givegift-components/components/Common/WalletLabel';
import BalanceHeader from '@abcpros/givegift-components/components/Common/BalanceHeader';
import { ViewRedeemDto } from '@abcpros/givegift-models';
import { SaveOutlined, ShareAltOutlined } from '@ant-design/icons';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { base62ToNumber } from '@utils/encryptionMethods';

type LixiRedeemProps = {
  className?: string;
  redeemId: string
}

process.env.REACT_APP_LIXI_API

const LixiRedeemed = ({
  className,
  redeemId
}: LixiRedeemProps) => {

  const history = useHistory();
  const dispatch = useAppDispatch();

  const currentLixiRedeem = useAppSelector(getCurrentLixiRedeem) as ViewRedeemDto;
  const imageUrl = currentLixiRedeem?.image
    ? process.env.REACT_APP_LIXI_API + currentLixiRedeem?.image
    : process.env.REACT_APP_LIXI_API + 'default.png';

  useEffect(() => {
    const id = parseInt(redeemId);
    dispatch(viewRedeem(id));
  }, [redeemId]);

  return (
    <div className={className}>
      {currentLixiRedeem && currentLixiRedeem.amount && (
        <>
          <WalletLabel name='You have redeemed lixi' />
          <BalanceHeader
            balance={fromSmallestDenomination(currentLixiRedeem.amount)}
            ticker='XPI' />
          <Image src={imageUrl} />
          <h3>{currentLixiRedeem.message}</h3>
        </>
      )}
    </div>
  );
};

const Container = styled(LixiRedeemed)`
  
  .ant-modal, .ant-modal-content {
      height: 100vh !important;
      top: 0 !important;
  }
  .ant-modal-body {
      height: calc(100vh - 110px) !important;
  }

`;

export default Container;