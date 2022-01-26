import {
  Checkbox, Collapse, DatePicker, Form, Input, Menu, Modal, notification, Radio, RadioChangeEvent
} from 'antd';
import { range } from 'lodash';
import isEmpty from 'lodash.isempty';
import moment from 'moment';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { openModal } from 'src/store/modal/actions';
import { showToast } from 'src/store/toast/actions';
import { generateVault } from 'src/store/vault/actions';

import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import {
  AdvancedCollapse, VaultCollapse
} from '@abcpros/givegift-components/components/Common/StyledCollapse';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';
import { Account } from '@abcpros/givegift-models';
import { countries } from '@abcpros/givegift-models/constants';
import { GenerateVaultCommand, VaultType } from '@abcpros/givegift-models/lib/vault';
import { PlusSquareOutlined } from '@ant-design/icons';
import CountrySelectDropdown from '@components/Common/CountrySelectDropdown';
import EnvelopeSelectDropdown from '@components/Common/EnvelopeSelectDropdown';
import { isValidAmountInput } from '@utils/validation';

import { CreateVaultConfirmationModalProps } from './CreateVaultConfirmationModal';
import { LixiEnvelopeUploader, StyledLixiEnvelopeUploaded } from './LixiEnvelopeUploader';
import { getAllEnvelopes } from 'src/store/envelope/selectors';
import TextArea from 'antd/lib/input/TextArea';
import EnvelopeCarousel from '@components/Common/EnvelopeCarousel';

const { Panel } = Collapse;

type CreateVaultFormProps = {
  account?: Account
} & React.HTMLProps<HTMLElement>;

const CreateVaultForm = ({
  account,
  disabled,
}: CreateVaultFormProps) => {

  const dispatch = useAppDispatch();
  const envelopes = useAppSelector(getAllEnvelopes);

  // New Vault name
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultNameIsValid, setNewVaultNameIsValid] = useState<boolean | null>(null);
  const [vaultType, setVaultType] = useState<number>(0);

  // New max redemption number
  const [newMaxRedeem, setNewMaxRedeemVault] = useState('');
  const [newMaxRedeemVaultIsValid, setNewMaxRedeemVaultIsValid] = useState(true);

  // New ExpiryAt
  const [newExpiryAt, setNewExpiryAtVault] = useState('');
  const [newExpiryAtVaultIsValid, setExpiryAtVaultIsValid] = useState(true);

  // New Vault Min Value
  const [newVaultMinValue, setNewVaultMinValue] = useState('');
  const [newVaultMinValueIsValid, setNewVaultMinValueIsValid] = useState(true);

  // New Vault Max Value
  const [newVaultMaxValue, setNewVaultMaxValue] = useState('');
  const [newVaultMaxValueIsValid, setNewVaultMaxValueIsValid] = useState(true);

  // New Vault Default Value
  const [newVaultFixedValue, setNewVaultFixedValue] = useState('');
  const [newVaultFixedValueIsValid, setNewVaultFixedValueIsValid] = useState(true);

  // New Vault Divided Value
  const [newVaultDividedValue, setNewVaultDividedValue] = useState('');
  const [newVaultDividedValueIsValid, setNewVaultDividedValueIsValid] = useState(true);

  // New Country
  const [newCountryVault, setNewCountryVault] = useState('');
  const [newCountryVaultIsValid, setNewCountryVaultIsValid] = useState(true);

  // New FamilyFriendly
  const [isFamilyFriendly, setIsFamilyFriendlyVault] = useState<boolean>(false);

  // New Envelope
  const [newEnvelopeId, setNewEnvelopeId] = useState<number | null>(null);
  const [newEnvelopeMessage, setNewEnvelopeMessage] = useState('');


  const handleNewVaultNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultName(value);
    if (value && !isEmpty(value)) {
      setNewVaultNameIsValid(true);
    }
  };

  const handleNewMaxRedeemInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewMaxRedeemVault(value);
    if (value && !isEmpty(value)) {
      setNewMaxRedeemVaultIsValid(true);
    }
  };

  const handleNewExpityTimeInput = (value) => {
    setNewExpiryAtVault(value._d.toString());
  }

  const handleEnvelopeMessageInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNewEnvelopeMessage(value);
  }

  const onOk = (value) => {
    setNewExpiryAtVault(value._d.toUTCString())
    if (value && !isEmpty(value)) {
      setExpiryAtVaultIsValid(true)
    }
  }

  // Only enable CreateVault button if all form entries are valid
  let createVaultFormDataIsValid =
    newVaultNameIsValid && newMaxRedeemVaultIsValid &&
    newExpiryAtVaultIsValid && account &&
    ((vaultType == VaultType.Random && newVaultMinValueIsValid && newVaultMaxValueIsValid) ||
      (vaultType == VaultType.Fixed && newVaultFixedValueIsValid) ||
      (vaultType == VaultType.Divided && newVaultDividedValueIsValid));

  const handleChangeVaultType = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setVaultType(value);
  }

  const handleChangeMinValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultMinValueIsValid(isValidAmountInput(value));
    setNewVaultMinValue(value);
  }
  const handleChangeMaxValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultMaxValueIsValid(isValidAmountInput(value) && Number(value) !== 0);
    setNewVaultMaxValue(value);
  }

  const handleChangeFixedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultFixedValueIsValid(isValidAmountInput(value));
    setNewVaultFixedValue(value);
  }

  const handleChangeDividedValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultDividedValueIsValid(isValidAmountInput(value));
    setNewVaultDividedValue(value);
  }

  const handleChangeCountry = (value, e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCountryVault(value);
    if (value && !isEmpty(value)) {
      setNewCountryVaultIsValid(true);
    }
  }

  const handleChangeEnvelope = (value: number) => {
    setNewEnvelopeId(value);
  }

  const handleFamilyFriendly = (e) => {
    const value = e.target.checked;
    setIsFamilyFriendlyVault(value);
  }

  const handleSubmitCreateVault = () => {

    if (!account) {
      dispatch(showToast('error', {
        message: 'Unable to create vault.',
        description: 'Please Select an account first before creating vault',
        duration: 5
      }));
    }

    const command: GenerateVaultCommand = {
      name: newVaultName,
      accountId: account?.id ?? 0,
      mnemonic: account?.mnemonic ?? '',
      mnemonicHash: account?.mnemonicHash ?? '',
      maxRedeem: newMaxRedeem,
      expiryAt: newExpiryAt,
      minValue: newVaultMinValue,
      maxValue: newVaultMaxValue,
      fixedValue: newVaultFixedValue,
      dividedValue: newVaultDividedValue,
      vaultType: vaultType,
      country: newCountryVault,
      isFamilyFriendly: isFamilyFriendly,
      envelopeId: newEnvelopeId,
      envelopeMessage: newEnvelopeMessage
    };

    const createVaultModalProps: CreateVaultConfirmationModalProps = {
      vaultType,
      newAccountName: account?.name ?? '',
      newVaultName,
      newMaxRedeem,
      newExpiryAt,
      newVaultMinValue,
      newVaultMaxValue,
      newVaultFixedValue,
      newVaultDividedValue,
      newCountryVault,
      isFamilyFriendly,
      newEnvelopeId,
      onOkAction: generateVault(command)
    };
    dispatch(openModal('CreateVaultConfirmationModal', createVaultModalProps));
  }

  const selectVaultType = () => {
    switch (vaultType) {
      // isFixed
      case VaultType.Fixed:
        return (
          <>
            <Form.Item>
              <Input.Group compact>
                <Input
                  addonBefore="Fixed"
                  type="number"
                  step={1 / 10 ** currency.cashDecimals}
                  value={newVaultFixedValue}
                  placeholder="Default value to give"
                  name="fixedValue"
                  onChange={e => handleChangeFixedValue(e)}
                >
                </Input>
              </Input.Group>
            </Form.Item>
          </>
        );
      // isDivided
      case VaultType.Divided:
        return (
          <>
            <Form.Item>
              <Input.Group compact>
                <Input
                  addonBefore="Divided"
                  type="number"
                  step={1 / 10 ** currency.cashDecimals}
                  value={newVaultDividedValue}
                  placeholder="Dividend number (Max 1,000,000)"
                  name="dividedValue"
                  onChange={e => handleChangeDividedValue(e)}
                >
                </Input>
              </Input.Group>
            </Form.Item>
          </>
        );
      // isRandom
      default:
        return (
          <>
            <Form.Item>
              <Input
                addonBefore="Min"
                type="number"
                step={1 / 10 ** currency.cashDecimals}
                placeholder="Min value to give"
                name="minValue"
                value={newVaultMinValue}
                onChange={e => handleChangeMinValue(e)}
              >
              </Input>
            </Form.Item>
            <Form.Item>
              <Input
                addonBefore="Max"
                type="number"
                step={1 / 10 ** currency.cashDecimals}
                placeholder="Max value to give"
                name="maxValue"
                value={newVaultMaxValue}
                onChange={e => handleChangeMaxValue(e)}
              >
              </Input>
            </Form.Item>
          </>
        );
    }
  }

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

  const selectExpiry = () => {
    return (
      <>
        {/* Max redemption */}
        <Form.Item
          validateStatus={
            newMaxRedeemVaultIsValid === null ||
              newMaxRedeemVaultIsValid
              ? ''
              : 'error'
          }
        >
          <Input
            addonBefore="Max Redeem"
            type="number"
            placeholder="Enter max Redeem number"
            name="vaultMaxReDeem"
            value={newMaxRedeem}
            onChange={e => handleNewMaxRedeemInput(e)}
          />
        </Form.Item>

        {/* Expiry Time */}
        <Form.Item
          validateStatus={
            newExpiryAtVaultIsValid === null ||
              newExpiryAtVaultIsValid
              ? ''
              : 'error'
          }
        >
          <DatePicker
            placeholder="Expiry time for your vault"
            name="vaultExpiryAt"
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
      <VaultCollapse
        accordion
        collapsible={disabled ? 'disabled' : 'header'}
        disabled={disabled}
        style={{
          marginBottom: '24px'
        }}
      >
        <Panel header="Create Vault" key="1">
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
                  newVaultNameIsValid === null ||
                    newVaultNameIsValid
                    ? ''
                    : 'error'
                }
              >
                <Input
                  addonBefore="Name"
                  placeholder="Enter a name for your vault"
                  name="vaultName"
                  value={newVaultName}
                  onChange={e => handleNewVaultNameInput(e)}
                />
              </Form.Item>

              {/* select VaultType and Expiry */}
              <Form.Item>
                <Radio.Group value={vaultType} onChange={handleChangeVaultType}>
                  <Radio value={0}>Random</Radio>
                  <Radio value={1}>Fixed</Radio>
                  <Radio value={2}>Divided</Radio>
                </Radio.Group>
              </Form.Item>
              {selectVaultType()}

              {/* Vault envelope */}
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

                  placeholder="Enter the vault message"
                  name="envelopeMessage"
                  value={newEnvelopeMessage}
                  onChange={e => handleEnvelopeMessageInput(e)}
                />
              </Form.Item>

              {/* Vault country */}
              <Form.Item>
                <AntdFormWrapper>
                  <CountrySelectDropdown
                    countries={countries}
                    defaultValue={newCountryVault ? newCountryVault : 'All of country'}
                    handleChangeCountry={handleChangeCountry}
                  />
                </AntdFormWrapper>
              </Form.Item>

              {/* Advanced */}
              <Form.Item>
                <AdvancedCollapse>
                  <Panel header="Advanced" key="2">

                    {/* Max Redeem and Expity Time */}
                    {selectExpiry()}

                    {/* Family Friendly */}
                    <Form.Item>
                      <Checkbox
                        value={isFamilyFriendly}
                        onChange={e => handleFamilyFriendly(e)}>
                        Family Friendly
                      </Checkbox>
                    </Form.Item>
                    {/* <StyledLixiEnvelopeUploaded /> */}
                    <TextArea rows={4} />
                  </Panel>
                </AdvancedCollapse>
              </Form.Item>

            </Form>
          </AntdFormWrapper>
          <SmartButton
            onClick={() => handleSubmitCreateVault()}
            disabled={!createVaultFormDataIsValid}
          >
            <PlusSquareOutlined />
            &nbsp;Create Vault
          </SmartButton>
        </Panel>
      </VaultCollapse>
    </>
  );
}

export default CreateVaultForm;