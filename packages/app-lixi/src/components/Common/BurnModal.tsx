import { Button, Form, Modal, Radio, Select } from 'antd';
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
import { XpiToBurn } from '@bcpros/lixi-models/constants/burnValue';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { burnForUpDownVote, getLatestBurnForToken } from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import _ from 'lodash';

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
  }
  &.downVote {
    background: #ba1a1a;
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
  }
`;

type BurnModalProps = {
  isToken: boolean;
  token?: Token;
} & React.HTMLProps<HTMLElement>;

export const BurnModal: React.FC<BurnModalProps> = (props: BurnModalProps) => {
  const { isToken, token } = props;
  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm<Burn>();
  const dispatch = useAppDispatch();

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { burnXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);

  // const [newBurnValue, setNewBurnValue] = useState('');
  // const handleNewBurnValueInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value } = e.target;
  //   setNewBurnValue(value);
  // };

  const onSubmit: SubmitHandler<Burn> = data => {
    console.log('data: ', data);
  };

  const handleBurn = async (isUpVote: boolean) => {
    try {
      if (slpBalancesAndUtxos.nonSlpUtxos.length == 0) {
        throw new Error('Insufficient funds');
      }

      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { fundingWif, hash160 } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = isToken ? token.id : '';
      const burnValue = _.isNil(control._formValues.burnedValue) ? XpiToBurn[0].value : control._formValues.burnedValue;

      const txHex = await burnXpi(
        XPI,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        burnType,
        isToken && BurnForType.Token,
        burnedBy,
        burnForId,
        burnValue
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Token,
        burnedBy,
        burnForId,
        burnValue
      };

      dispatch(burnForUpDownVote(burnCommand));
      dispatch(closeModal());
    } catch (e) {
      dispatch(
        showToast('error', {
          message: intl.get('post.unableToBurn'),
          duration: 5
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
      className="custom-create-lixi-modal"
      open={true}
      onCancel={handleOnCancel}
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UpDownSvg /> {intl.get('general.goodOrNot')}
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
        <p>{intl.get('text.selectXpi', { name: isToken ? token.ticker : intl.get('text.post') })} </p>

        <Controller
          name="burnedValue"
          control={control}
          rules={{
            required: {
              value: true,
              message: intl.get('burn.selectXpi', { name: isToken ? token.ticker : intl.get('text.post') })
            }
          }}
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <RadioStyle
              {...fieldProps}
              value={value}
              defaultValue={XpiToBurn.find(xpi => xpi.value === 1).value}
              options={XpiToBurn.map(xpi => xpi.value)}
              optionType="button"
              buttonStyle="solid"
              onChange={value => onChange(value)}
            />
          )}
        />
        <p style={{ color: 'red', margin: '10px', fontSize: '12px' }}>
          {errors.burnedValue && errors.burnedValue.message}
        </p>
      </Form>
    </Modal>
  );
};
