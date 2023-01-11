import { Radio } from 'antd';
import intl from 'react-intl-universal';
import * as _ from 'lodash';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import { getSelectedAccount } from '@store/account/selectors';
import SmartButton from '@components/Common/PrimaryButton';
import { MoneyCollectOutlined } from '@ant-design/icons';
import Mobifone from '@assets/images/mobile-topup/mobifone_logo.png';
import Vietnamobile from '@assets/images/mobile-topup/vietnamobile_logo.png';
import Vinaphone from '@assets/images/mobile-topup/vinaphone_logo.png';
import Viettel from '@assets/images/mobile-topup/viettel_logo.png';
import Gmobile from '@assets/images/mobile-topup/gmobile_logo.png';
import Checkmark from '@assets/images/checkmark.png';
import InvertedCheckmark from '@assets/images/inverted_checkmark.png';

const StyledRadioGroup = styled(Radio.Group)`
  display: flex !important;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;

  .ant-radio-button-wrapper {
    display: flex;
    width: 120px;
    height: 60px;
    align-items: center;
    justify-content: center;
    line-height: 0;
    margin-bottom: 10px;
    transition: 0.3s;

    &::before {
      width: 0px;
    }

    &:first-child {
      border: 1px solid #e8e8e8;
      border-radius: ${props => props.theme.radio.borderRadius};
    }
    &:last-child {
      border: 1px solid #e8e8e8;
      border-radius: ${props => props.theme.radio.borderRadius};
    }

    &:hover {
      border: 3px solid ${props => props.theme.radio.primary};
    }
  }

  .ant-radio-button-wrapper-checked {
    border: 3px solid ${props => props.theme.radio.primary};
    border-radius: ${props => props.theme.radio.borderRadius};
    color: ${props => props.theme.radio.secondary}!important;

    &:first-child {
      border: 3px solid ${props => props.theme.radio.primary} !important;
      border-radius: ${props => props.theme.radio.borderRadius};
    }
  }
`;

const StyledMNButton = styled(Radio.Button)`
  border: 1px solid ${props => props.theme.radio.secondary};
  border-radius: ${props => props.theme.radio.borderRadius};
`;

const StyledDenominationButton = styled(Radio.Button)`
  border: 1px solid ${props => props.theme.radio.secondary};
  border-radius: ${props => props.theme.radio.borderRadius};
  & > span {
    font-size: 14px;
    font-weight: bold;
  }

  .ant-radio-button-checked {
    background-color: ${props => props.theme.radio.primary};
  }
`;

const ImageContainer = styled.div`
  width: 12px;
  height: 12px;
  position: absolute;
  bottom: 2px;
  left: 2px;
`;

const MobileNetworks: Object[] = [
  {
    name: 'mobifone',
    src: Mobifone
  },
  {
    name: 'vietnamobile',
    src: Vietnamobile
  },
  {
    name: 'Viettel',
    src: Viettel
  },
  {
    name: 'VinaPhone',
    src: Vinaphone
  },
  {
    name: 'Gmobile',
    src: Gmobile
  }
];

const Denominations: Object[] = [
  {
    name: '10.000',
    value: 10000
  },
  {
    name: '20.000',
    value: 20000
  },
  {
    name: '50.000',
    value: 50000
  },
  {
    name: '100.000',
    value: 100000
  },
  {
    name: '200.000',
    value: 200000
  },
  {
    name: '500.000',
    value: 500000
  }
];

const SwapMobileCard: React.FC = () => {
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [selectedMobileNetwork, setMobileNetwork] = useState('');
  const [selectedDenomination, setDenomination] = useState('');

  // radio button change
  const onChangeMobileNetwork = (e: any) => {
    setMobileNetwork(e.target.value);
  };
  const onChangeDenomination = (e: any) => {
    setDenomination(e.target.value);
  };

  return (
    <>
      <StyledRadioGroup className="mobile-network" onChange={onChangeMobileNetwork}>
        {MobileNetworks.map((item: any, index: number) => {
          return (
            <StyledMNButton value={item.name} key={index}>
              {selectedMobileNetwork == `${item.name}` && (
                <ImageContainer>
                  <Image src={Checkmark} alt="checkmark" />
                </ImageContainer>
              )}
              <Image src={item.src} />
            </StyledMNButton>
          );
        })}
      </StyledRadioGroup>
      <br />
      <StyledRadioGroup className="denominations" size="large">
        {Denominations.map((item: any, index: number) => {
          return (
            <StyledDenominationButton value={item.value} key={index} onChange={onChangeDenomination}>
              {selectedDenomination == `${item.value}` && (
                <ImageContainer>
                  <Image src={InvertedCheckmark} alt="checkmark" />
                </ImageContainer>
              )}
              {item.name}
            </StyledDenominationButton>
          );
        })}
      </StyledRadioGroup>

      {/* <h1>Need {0.000403*500000} XPI</h1> */}

      <SmartButton>
        <MoneyCollectOutlined /> {intl.get('general.swapCard')}
      </SmartButton>
    </>
  );
};

export default SwapMobileCard;
