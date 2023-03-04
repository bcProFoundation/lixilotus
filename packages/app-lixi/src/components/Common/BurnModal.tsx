import { Button, Form, Modal, Radio } from 'antd';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { closeModal } from '@store/modal/actions';
import intl from 'react-intl-universal';
import useXPI from '@hooks/useXPI';
import UpDownSvg from '@assets/icons/upDownIcon.svg';
import UpVoteSvg from '@assets/icons/upVote.svg';
import DownVoteSvg from '@assets/icons/downVote.svg';
import { WalletContext } from '@context/walletProvider';
import React, { useState } from 'react';
import { Burn, Token } from '@bcpros/lixi-models';
import styled from 'styled-components';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import { burnForUpDownVote } from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import _ from 'lodash';
import { DislikeOutlined, LikeOutlined } from '@ant-design/icons';

const UpDownButton = styled(Button)`
  background: rgb(158, 42, 156);
  color: white;
  display: flex;
  align-items: center;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  width: 49%;
  height: 40px;
  border-radius: 16px !important;
  justify-content: center;

  &.upVote {
    background: #9e2a9c;
    &:hover {
      color: #fff;
    }
  }
  &.downVote {
    background: #ba1a1a;
    &:hover {
      color: #fff;
    }
  }
`;

const RadioStyle = styled(Radio.Group)`
  flex-flow: wrap !important;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: row;
  justify-content: start;
  gap: 10px;

  .ant-radio-button-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 8px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c5c5c5;
    color: #1e1a1d;
    font-weight: 500;
    font-size: 16px;
    letter-spacing: 0.15px;
    &:before {
      content: none;
    }
    &:hover {
      background: #ffd7f6;
      color: #1e1a1d;
    }
    &.ant-radio-button-wrapper-checked {
      color: #1e1a1d;
      background: #ffd7f6;
      &:hover {
        color: #1e1a1d;
        background: #ffd7f6;
      }
    }
  }
`;

const DefaultXpiBurnValues = [1, 8, 50, 100, 200, 500, 1000];

type BurnModalProps = {
  burnForType: BurnForType;
  token?: Token;
} & React.HTMLProps<HTMLElement>;

export const BurnModal: React.FC<BurnModalProps> = (props: BurnModalProps) => {
  const { burnForType, token } = props;
  const {
    formState: { errors },
    control
  } = useForm<Burn>();
  const dispatch = useAppDispatch();

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const [selectedAmount, setSelectedAmount] = useState(1);

  const handleBurn = async (isUpVote: boolean) => {
    try {
      if (slpBalancesAndUtxos.nonSlpUtxos.length == 0) {
        throw new Error(intl.get('account.insufficientFunds'));
      }

      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { fundingWif, hash160 } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      let burnForId;
      if (burnForType == BurnForType.Token) {
        burnForId = token.tokenId;
      } else {
        throw new Error('not support yet');
      }
      const burnValue = _.isNil(control._formValues.burnedValue)
        ? DefaultXpiBurnValues[0]
        : control._formValues.burnedValue;

      const txHex = createBurnTransaction(
        XPI,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        burnType,
        burnForType,
        burnedBy,
        burnForId,
        burnValue
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: burnForType,
        burnedBy,
        burnForId: token.id,
        burnValue
      };

      dispatch(burnForUpDownVote(burnCommand));
      dispatch(closeModal());
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

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  return (
    <Modal
      width={450}
      className="custom-burn-modal"
      open={true}
      onCancel={handleOnCancel}
      title={
        <div className="custom-burn-header">
          <UpDownSvg />
          <h3>{intl.get('general.goodOrNot')}</h3>
          <div className="banner-count-burn">
            <div className="banner-item">
              <LikeOutlined />
              <div className="count-bar">
                <p className="title">{token?.lotusBurnUp + ' XPI'}</p>
                <p className="sub-title">burnt to up</p>
              </div>
            </div>
            <div className="banner-item">
              <DislikeOutlined />
              <div className="count-bar">
                <p className="title">{token?.lotusBurnDown + ' XPI'}</p>
                <p className="sub-title">burnt to down</p>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <Button.Group style={{ width: '100%' }}>
          <UpDownButton className="upVote" onClick={() => handleBurn(true)}>
            <UpVoteSvg />
            &nbsp; {intl.get('general.burnUp')}
          </UpDownButton>
          <UpDownButton className="downVote" onClick={() => handleBurn(false)}>
            <DownVoteSvg />
            &nbsp; {intl.get('general.burnDown')}
          </UpDownButton>
        </Button.Group>
      }
      style={{ top: '0 !important' }}
    >
      <Form>
        <p className="question-txt">
          {intl.get('text.selectXpi', {
            name: burnForType == BurnForType.Token ? token.ticker : intl.get('text.post')
          })}{' '}
        </p>

        <Controller
          name="burnedValue"
          control={control}
          rules={{
            required: {
              value: true,
              message: intl.get('burn.selectXpi', {
                name: burnForType == BurnForType.Token ? token.ticker : intl.get('text.post')
              })
            }
          }}
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <RadioStyle
              {...fieldProps}
              value={value}
              defaultValue={DefaultXpiBurnValues[0]}
              options={DefaultXpiBurnValues.map(xpi => xpi)}
              optionType="button"
              buttonStyle="solid"
              onChange={value => {
                setSelectedAmount(value?.target?.value);
                onChange(value);
              }}
            />
          )}
        />
        <p style={{ color: 'red', margin: '10px', fontSize: '12px' }}>
          {errors.burnedValue && errors.burnedValue.message}
        </p>
      </Form>
      <p className="amount-burn">{`You're burning ` + selectedAmount + ' XPI'}</p>
    </Modal>
  );
};
