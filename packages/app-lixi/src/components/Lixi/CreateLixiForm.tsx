import { Checkbox, Collapse, DatePicker, Form, Input, Menu, Modal, notification, Radio, RadioChangeEvent } from 'antd';
import { range } from 'lodash';
import isEmpty from 'lodash.isempty';
import intl from 'react-intl-universal';
import moment from 'moment';
import React, { useState } from 'react';
import { openModal } from 'src/store/modal/actions';
import { showToast } from 'src/store/toast/actions';
import { generateLixi } from 'src/store/lixi/actions';

import { AntdFormWrapper } from '@bcpros/lixi-components/components/Common/EnhancedInputs';
import { SmartButton } from '@bcpros/lixi-components/components/Common/PrimaryButton';
import {
  AdvancedCollapse, LixiCollapse
} from '@bcpros/lixi-components/components/Common/StyledCollapse';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import { Account } from '@bcpros/lixi-models/lib/account';
import { countries } from '@bcpros/lixi-models/constants';
import { GenerateLixiCommand, LixiType, ClaimType } from '@bcpros/lixi-models/lib/lixi';
import { PlusSquareOutlined } from '@ant-design/icons';
import CountrySelectDropdown from '@components/Common/CountrySelectDropdown';
import EnvelopeSelectDropdown from '@components/Common/EnvelopeSelectDropdown';
import { isValidAmountInput } from '@utils/validation';

import { CreateLixiConfirmationModalProps } from './CreateLixiConfirmationModal';
import { LixiEnvelopeUploader, StyledLixiEnvelopeUploaded } from './LixiEnvelopeUploader';
import { getAllEnvelopes } from 'src/store/envelope/selectors';
import TextArea from 'antd/lib/input/TextArea';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import EnvelopeCarousel from '@components/Common/EnvelopeCarousel';

const { Panel } = Collapse;

type CreateLixiFormProps = {
  account?: Account
} & React.HTMLProps<HTMLElement>;

const CreateLixiForm = ({
  account,
  disabled,
}: CreateLixiFormProps) => {

  const dispatch = useAppDispatch();
  const envelopes = useAppSelector(getAllEnvelopes);

  // New Lixi name
  const [newLixiName, setNewLixiName] = useState('');
  const [newLixiNameIsValid, setNewLixiNameIsValid] = useState<boolean | null>(null);
  const [lixiType, setLixiType] = useState<number>(LixiType.Random);
  const [claimType, setClaimType] = useState<number>(ClaimType.Single);

  // New lixi balance number
  const [newLixiAmount, setNewLixiAmount] = useState('');
  const [newLixiAmountValueIsValid, setNewLixiAmountValueIsValid] = useState(true);

  // New Lixi sub Value
  const [newNumberOfSubLixi, setNewNumberOfSubLixi] = useState('');
  const [newSubLixiIsValid, setNewSubLixiIsValid] = useState(true);

  // New Lixi Min Value
  const [newLixiMinValue, setNewLixiMinValue] = useState('');
  const [newLixiMinValueIsValid, setNewLixiMinValueIsValid] = useState(true);

  // New Lixi Max Value
  const [newLixiMaxValue, setNewLixiMaxValue] = useState('');
  const [newLixiMaxValueIsValid, setNewLixiMaxValueIsValid] = useState(true);

  // New Lixi Default Value
  const [newLixiFixedValue, setNewLixiFixedValue] = useState('');
  const [newLixiFixedValueIsValid, setNewLixiFixedValueIsValid] = useState(false);

  // New Lixi Divided Value
  const [newLixiDividedValue, setNewLixiDividedValue] = useState('');
  const [newLixiDividedValueIsValid, setNewLixiDividedValueIsValid] = useState(false);

  // New Country
  const [newCountryLixi, setNewCountryLixi] = useState('');
  const [newCountryLixiIsValid, setNewCountryLixiIsValid] = useState(true);

  // New max redemption number
  const [newMaxClaim, setNewMaxClaimLixi] = useState('');
  const [newMaxClaimLixiIsValid, setNewMaxClaimLixiIsValid] = useState(true);

  // New minimum staking number
  const [newMinStaking, setNewMinStaking] = useState('');
  const [newMinStakingIsValid, setNewMinStakingIsValid] = useState(true);

  // New ExpiryAt
  const [newExpiryAt, setNewExpiryAtLixi] = useState('');
  const [newExpiryAtLixiIsValid, setExpiryAtLixiIsValid] = useState(true);

  // New ActivatedAt
  const [newActivatedAt, setNewActivatedAtLixi] = useState('');
  const [newActivatedAtLixiIsValid, setActivatedAtLixiIsValid] = useState(true);

  // New FamilyFriendly
  const [isFamilyFriendly, setIsFamilyFriendlyLixi] = useState<boolean>(false);

  // New Envelope
  const [newEnvelopeId, setNewEnvelopeId] = useState<number | null>(null);
  const [newEnvelopeMessage, setNewEnvelopeMessage] = useState('');


  const handleNewLixiNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiName(value);
    if (value && !isEmpty(value)) {
      setNewLixiNameIsValid(true);
    } else {
      setNewLixiNameIsValid(false);
    }
  };

  const handleEnvelopeMessageInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNewEnvelopeMessage(value);
  }

  // Only enable CreateLixi button if all form entries are valid
  let createLixiFormDataIsValid =
    newLixiNameIsValid && newMaxClaimLixiIsValid &&
    newExpiryAtLixiIsValid && account && newActivatedAtLixiIsValid &&
    (claimType == ClaimType.OneTime &&
      (lixiType == LixiType.Random && newNumberOfSubLixi && newLixiAmountValueIsValid && newLixiMinValueIsValid && newLixiMaxValueIsValid) ||
      (lixiType == LixiType.Equal && newNumberOfSubLixi && newLixiAmountValueIsValid)) ||
    (claimType == ClaimType.Single &&
      (lixiType == LixiType.Random && newLixiMinValueIsValid && newLixiMaxValueIsValid) ||
      (lixiType == LixiType.Fixed && newLixiFixedValueIsValid) ||
      (lixiType == LixiType.Divided && newLixiDividedValueIsValid)
    );

  const handleChangeClaimType = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setClaimType(value);
  }

  const handleChangeLixiType = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setLixiType(value);
  }

  const handleNewLixiAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiAmountValueIsValid(isValidAmountInput(value));
    setNewLixiAmount(value);
  }

  const handleNewNumberOfSubLixi = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewSubLixiIsValid(isValidAmountInput(value));
    setNewNumberOfSubLixi(value);
  }

  const handleChangeMinValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiMinValueIsValid(isValidAmountInput(value));
    setNewLixiMinValue(value);
  }
  const handleChangeMaxValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiMaxValueIsValid(isValidAmountInput(value) && Number(value) !== 0);
    setNewLixiMaxValue(value);
  }

  const handleChangeFixedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiFixedValueIsValid(isValidAmountInput(value));
    setNewLixiFixedValue(value);
  }

  const handleChangeDividedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewLixiDividedValueIsValid(isValidAmountInput(value));
    setNewLixiDividedValue(value);
  }

  const handleChangeCountry = (value, e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCountryLixi(value);
    if (value && !isEmpty(value)) {
      setNewCountryLixiIsValid(true);
    }
  }

  const handleChangeEnvelope = (value: number) => {
    setNewEnvelopeId(value);
  }

  const handleNewMaxClaimInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewMaxClaimLixi(value);
    if (value && !isEmpty(value)) {
      setNewMaxClaimLixiIsValid(true);
    }
  };

  // Minimum Staking
  const handleNewMinStakingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewMinStaking(value);
    if (value && !isEmpty(value)) {
      setNewMinStakingIsValid(true);
    }
  };

  // Expiry Time
  const disabledDate = (current) => {
    return current && current < moment().startOf('day');
  }
  const disabledDateTime = (current) => {
    if (newExpiryAt && moment(newExpiryAt).date() > moment().date()) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
      };
    }
    return {
      disabledHours: () => range(0, moment().hour()),
      disabledMinutes: () => range(0, moment().minute()),
    };
  }
  const handleNewExpityTimeInput = (value) => {
    setNewExpiryAtLixi(value._d.toString());
  }

  const handleNewActivatedTimeInput = (value) => {
    setNewActivatedAtLixi(value._d.toString());
  }

  const handleFamilyFriendly = (e) => {
    const value = e.target.checked;
    setIsFamilyFriendlyLixi(value);
  }

  const handleSubmitCreateLixi = () => {

    if (!account) {
      dispatch(showToast('error', {
        message: intl.get('account.unableCreateLixi'),
        description: intl.get('account.selectLixiFirst'),
        duration: 5
      }));
    }

    const command: GenerateLixiCommand = {
      name: newLixiName,
      accountId: account?.id ?? 0,
      mnemonic: account?.mnemonic ?? '',
      mnemonicHash: account?.mnemonicHash ?? '',
      maxClaim: newMaxClaim,
      expiryAt: newExpiryAt,
      activationAt: newActivatedAt,
      minValue: newLixiMinValue,
      maxValue: newLixiMaxValue,
      fixedValue: newLixiFixedValue,
      dividedValue: newLixiDividedValue,
      claimType: claimType,
      lixiType: lixiType,
      minStaking: newMinStaking,
      country: newCountryLixi,
      isFamilyFriendly: isFamilyFriendly,
      amount: newLixiAmount,
      numberOfSubLixi: newNumberOfSubLixi,
      envelopeId: newEnvelopeId,
      envelopeMessage: newEnvelopeMessage,
    };

    const createLixiModalProps: CreateLixiConfirmationModalProps = {
      claimType,
      lixiType,
      newAccountName: account?.name ?? '',
      newLixiName,
      newMaxClaim,
      newExpiryAt,
      newActivatedAt,
      newLixiAmount,
      newNumberOfSubLixi,
      newLixiMinValue,
      newLixiMaxValue,
      newLixiFixedValue,
      newLixiDividedValue,
      newMinStaking,
      newCountryLixi,
      isFamilyFriendly,
      newEnvelopeId,
      onOkAction: generateLixi(command)
    };
    dispatch(openModal('CreateLixiConfirmationModal', createLixiModalProps));
  }

  const onOk = (value) => {
    setNewExpiryAtLixi(value._d.toUTCString())
    if (value && !isEmpty(value)) {
      setExpiryAtLixiIsValid(true)
    }
  }

  const onActivatedOk = (value) => {
    setNewActivatedAtLixi(value._d.toUTCString())
    if (value && !isEmpty(value)) {
      setActivatedAtLixiIsValid(true)
    }
  }
  const selectClaimType = () => {
    if (claimType == ClaimType.Single) {
      return (
        <Form.Item>
          <Radio.Group value={lixiType} onChange={handleChangeLixiType}>
            <Radio value={LixiType.Random}>{intl.get('account.random')}</Radio>
            <Radio value={LixiType.Fixed}>{intl.get('account.fixed')}</Radio>
            <Radio value={LixiType.Divided}>{intl.get('account.divided')}</Radio>
          </Radio.Group>
        </Form.Item>
      );
    }
    else {
      return (
        <>
          <Form.Item>
            <Radio.Group value={lixiType} onChange={handleChangeLixiType}>
              <Radio value={LixiType.Random}>{intl.get('account.random')}</Radio>
              <Radio value={LixiType.Equal}>{intl.get('account.equal')}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Input
              addonBefore={intl.get('account.sub-lixi')}
              type="number"
              value={newNumberOfSubLixi}
              placeholder={intl.get('account.numberOfSubLixi')}
              name="equalValue"
              onChange={e => handleNewNumberOfSubLixi(e)}
            />
          </Form.Item>
        </>
      );
    }
  }

  const selectLixiType = () => {
    switch (lixiType) {
      // isFixed
      case LixiType.Fixed:
        return (
          <>
            <Form.Item>
              <Input.Group compact>
                <Input
                  addonBefore={intl.get('account.fixed')}
                  type="number"
                  step={1 / 10 ** currency.cashDecimals}
                  value={newLixiFixedValue}
                  placeholder={intl.get('account.defaultValueToGive')}
                  name="fixedValue"
                  onChange={e => handleChangeFixedValue(e)}
                >
                </Input>
              </Input.Group>
            </Form.Item>
          </>
        );
      // isDivided
      case LixiType.Divided:
        return (
          <>
            <Form.Item>
              <Input.Group compact>
                <Input
                  addonBefore={intl.get('account.divided')}
                  type="number"
                  step={1 / 10 ** currency.cashDecimals}
                  value={newLixiDividedValue}
                  placeholder={intl.get('account.dividedNumber')}
                  name="dividedValue"
                  onChange={e => handleChangeDividedValue(e)}
                >
                </Input>
              </Input.Group>
            </Form.Item>
          </>
        );
      // isEqual
      case LixiType.Equal:
        return;
      // isRandom
      default:
        return (
          <>
            <Form.Item>
              <Input
                addonBefore={intl.get('account.min')}
                type="number"
                step={1 / 10 ** currency.cashDecimals}
                placeholder={intl.get('account.minValueToGive')}
                name="minValue"
                value={newLixiMinValue}
                onChange={e => handleChangeMinValue(e)}
              >
              </Input>
            </Form.Item>
            <Form.Item>
              <Input
                addonBefore={intl.get('account.max')}
                type="number"
                step={1 / 10 ** currency.cashDecimals}
                placeholder={intl.get('account.maxValueToGive')}
                name="maxValue"
                value={newLixiMaxValue}
                onChange={e => handleChangeMaxValue(e)}
              >
              </Input>
            </Form.Item>
          </>
        );
    }
  }

  const selectExpiry = () => {
    return (
      <>
        {/* Max redemption */}
        <Form.Item
          validateStatus={
            newMaxClaimLixiIsValid === null ||
              newMaxClaimLixiIsValid
              ? ''
              : 'error'
          }
        >
          <Input
            addonBefore={intl.get('account.maxClaim')}
            type="number"
            placeholder={intl.get('account.enterMaxClaimNumber')}
            name="lixiMaxClaim"
            value={newMaxClaim}
            onChange={e => handleNewMaxClaimInput(e)}
          />
        </Form.Item>

        {/* Minimum Staking */}
        <Form.Item
          validateStatus={
            newMinStakingIsValid === null ||
              newMinStakingIsValid
              ? ''
              : 'error'
          }
        >
          <Input
            addonBefore={intl.get('account.minStaking')}
            type="number"
            step={1 / 10 ** currency.cashDecimals}
            placeholder={intl.get('account.enterMinStaking')}
            name="MinStaking"
            value={newMinStaking}
            onChange={e => handleNewMinStakingInput(e)}
          />
        </Form.Item>

        {/* Activation Time */}
        <Form.Item
          validateStatus={
            newActivatedAtLixiIsValid === null ||
              newActivatedAtLixiIsValid
              ? ''
              : 'error'
          }
        >
          <DatePicker
            placeholder={intl.get('account.activatedTime')}
            name="lixiActivatedAt"
            disabledDate={(current) => disabledDate(current)}
            disabledTime={(current) => disabledDateTime(current)}
            showTime={{
              format: 'HH:mm',
              defaultValue: moment()
            }}
            format="YYYY-MM-DD HH:mm"
            size={'large'}
            style={{
              width: "100%",
            }}
            onSelect={handleNewActivatedTimeInput}
            onOk={onActivatedOk}
          />
        </Form.Item>

        {/* Expiry Time */}
        <Form.Item
          validateStatus={
            newExpiryAtLixiIsValid === null ||
              newExpiryAtLixiIsValid
              ? ''
              : 'error'
          }
        >
          <DatePicker
            placeholder={intl.get('account.expiryTime')}
            name="lixiExpiryAt"
            disabledDate={(current) => disabledDate(current)}
            disabledTime={(current) => disabledDateTime(current)}
            showTime={{
              format: 'HH:mm',
              defaultValue: moment()
            }}
            format="YYYY-MM-DD HH:mm"
            size={'large'}
            style={{
              width: "100%",
            }}
            onSelect={handleNewExpityTimeInput}
            onOk={onOk}
          />
        </Form.Item>
      </>
    );
  }

  return (
    <>
      <LixiCollapse
        accordion
        collapsible={disabled ? 'disabled' : 'header'}
        disabled={disabled}
        style={{
          marginBottom: '24px'
        }}
      >
        <Panel header={intl.get('account.createLixi')} key="1">
          <AntdFormWrapper>
            <Form
              size="small"
              style={{
                width: 'auto',
              }}
            >
              {/* Name */}
              <Form.Item
                validateStatus={
                  newLixiNameIsValid === null ||
                    newLixiNameIsValid
                    ? ''
                    : 'error'
                }
              >
                <Input
                  addonBefore={intl.get('lixi.name')}
                  placeholder={intl.get('account.enterLixiName')}
                  name="lixiName"
                  value={newLixiName}
                  onChange={e => handleNewLixiNameInput(e)}
                />
              </Form.Item>

              {/* select type claim */}
              <Form.Item>
                <Radio.Group buttonStyle="solid" size="large" value={claimType} onChange={handleChangeClaimType}>
                  <Radio.Button value={ClaimType.Single}>{intl.get('account.singleCode')}</Radio.Button>
                  <Radio.Button value={ClaimType.OneTime}>{intl.get('account.oneTimeCode')}</Radio.Button>
                </Radio.Group>
              </Form.Item>
              {selectClaimType()}
              <Form.Item>
                <Input
                  type="number"
                  addonBefore={intl.get('account.amount')}
                  placeholder={intl.get('account.enterLixiBalance')}
                  name="lixiAmount"
                  value={newLixiAmount}
                  onChange={e => handleNewLixiAmountInput(e)}
                />
              </Form.Item>
              {selectLixiType()}
              {/* Lixi envelope */}
              <Form.Item>
                <AntdFormWrapper>
                  <EnvelopeCarousel
                    envelopes={envelopes}
                    handleChangeEnvelope={handleChangeEnvelope}
                  />
                </AntdFormWrapper>
              </Form.Item>
              {/* Message */}
              <Form.Item>
                <TextArea
                  placeholder={intl.get('account.lixiMessage')}
                  name="envelopeMessage"
                  value={newEnvelopeMessage}
                  onChange={e => handleEnvelopeMessageInput(e)}
                />
              </Form.Item>

              {/* Lixi country */}
              <Form.Item>
                <AntdFormWrapper>
                  <CountrySelectDropdown
                    countries={countries}
                    defaultValue={newCountryLixi ? newCountryLixi : intl.get('account.allCountry')}
                    handleChangeCountry={handleChangeCountry}
                  />
                </AntdFormWrapper>
              </Form.Item>

              {/* Advanced */}
              <Form.Item>
                <AdvancedCollapse>
                  <Panel header={intl.get('account.advance')} key="2">
                    {/* Max Claim and Expity Time */}
                    {selectExpiry()}
                    {/* Family Friendly */}
                    <Form.Item>
                      <Checkbox
                        value={isFamilyFriendly}
                        onChange={e => handleFamilyFriendly(e)}>
                        {intl.get('account.familyFriendly')}
                      </Checkbox>
                    </Form.Item>
                  </Panel>
                </AdvancedCollapse>
              </Form.Item>
            </Form>
          </AntdFormWrapper>
          <SmartButton
            onClick={() => handleSubmitCreateLixi()}
            disabled={!createLixiFormDataIsValid}
          >
            <PlusSquareOutlined />
            &nbsp;{intl.get('account.createLixi')}
          </SmartButton>
        </Panel>
      </LixiCollapse>
    </>
  );
}

export default CreateLixiForm;
