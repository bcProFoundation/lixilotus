import { Collapse, Input, InputNumber } from 'antd';
import * as React from 'react';
import styled from 'styled-components';

import { fromSmallestDenomination, toSmallestDenomination } from '@abcpros/givegift-models';

import { currency } from '../../../../givegift-components/src/components/Common/Ticker';
import { QRCode } from './QRCode';

const WalletName = styled.h4`
  font-size: 20px;
  font-weight: bold;
  display: inline-block;
  color: ${props => props.theme.primary};
  margin-bottom: 0px;
  @media (max-width: 400px) {
      font-size: 16px;
  }
`;

const WalletBalance = styled.h3`
  font-size: 30px;
  font-weight: bold;
  display: inline-block;
  color: ${props => props.theme.primary};
  margin-bottom: 0px;
  @media (max-width: 400px) {
      font-size: 16px;
  }
`;

type WalletLabelProps = {
  name: string;
  address: string;
  balance: number;
};

const WalletLabel = ({ name, address, balance }: WalletLabelProps) => {
  return (
    <>
      {name && typeof name === 'string' && (
        <WalletName>{name}</WalletName>
      )}
      <br/>
      <WalletBalance>{fromSmallestDenomination(balance)} {currency.ticker}</WalletBalance>
      <br/>
      <QRCode
        address={address}
      />
    </>
  );
};

export default WalletLabel;
