import React, { useState } from 'react';
import { Collapse, DatePicker, Form, Input, Modal, notification, Radio, RadioChangeEvent, Space } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import isEmpty from 'lodash.isempty';
import { range } from 'lodash';
import moment from 'moment';
import { StyledCollapse, VaultCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';
import { isValidAmountInput } from '@utils/validation';
import { GenerateVaultDto, VaultType } from '@abcpros/givegift-models/lib/vault';
import { useAppDispatch } from 'src/store/hooks';
import { generateVault } from 'src/store/vault/actions';
import { openModal } from 'src/store/modal/actions';
import { CreateVaultConfirmationModalProps } from './CreateVaultConfirmationModal';
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

type CreateVaultFormProps = {
} & React.HTMLProps<HTMLElement>;

const CreateVaultForm = ({
  disabled,
}: CreateVaultFormProps) => {

  const dispatch = useAppDispatch();

  // New Vault name
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultNameIsValid, setNewVaultNameIsValid] = useState<boolean | null>(null);
  const [isRandomGive] = useState<boolean>(true);
  const [vaultType, setVaultType] = useState<number>(0);

  // New max redemption number
  const [newMaxRedeem, setNewMaxRedeemVault] = useState('');
  const [newMaxRedeemVaultIsValid, setNewMaxRedeemVaultIsValid] = useState(true);

  // New ExpiryTime
  const [newExpiryTime, setNewExpiryTimeVault] = useState('');
  const [newExpiryTimeVaultIsValid, setExpiryTimeVaultIsValid] = useState(true);

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
    setNewExpiryTimeVault(value._d.toString());
  }

  const onOk = (value) => {
    setNewExpiryTimeVault(value._d.toUTCString())
    if (value && !isEmpty(value)) {
      setExpiryTimeVaultIsValid(true)
    }
  }

  // Only enable CreateVault button if all form entries are valid
  let createVaultFormDataIsValid =
    newVaultNameIsValid && newMaxRedeemVaultIsValid && newExpiryTimeVaultIsValid &&
    ((vaultType == VaultType.Random && newVaultMinValueIsValid && newVaultMaxValueIsValid) ||
      (vaultType == VaultType.Fixed && newVaultFixedValueIsValid) ||
      (vaultType == VaultType.Divided && newVaultDividedValueIsValid));

  const handelChangeVaultType = (e: RadioChangeEvent) => {
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

  const handleSubmitCreateVault = () => {

    const generateVaultDto: GenerateVaultDto = {
      name: newVaultName,
      maxRedeem: newMaxRedeem,
      expiryTime: newExpiryTime,
      minValue: newVaultMinValue,
      maxValue: newVaultMaxValue,
      fixedValue: newVaultFixedValue,
      dividedValue: newVaultDividedValue,
      isRandomGive: isRandomGive,
      vaultType: vaultType
    };

    const createVaultModalProps: CreateVaultConfirmationModalProps = {
      isRandomGive,
      vaultType,
      newVaultName,
      newMaxRedeem,
      newExpiryTime,
      newVaultMinValue,
      newVaultMaxValue,
      newVaultFixedValue,
      newVaultDividedValue,
      onOkAction: generateVault(generateVaultDto)
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
    if (newExpiryTime && moment(newExpiryTime).date() > moment().date()) {
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
            newExpiryTimeVaultIsValid === null ||
              newExpiryTimeVaultIsValid
              ? ''
              : 'error'
          }
        >
          <Space direction="horizontal" >
            {/* <RangePicker
              // placeholder="Expiry time"
              name="vaultExpiryTime"
              disabledDate={(current) => disabledDate(current)}
              disabledTime={(current) => disabledDateTime(current)}
              showTime={{ 
                hideDisabledOptions: true,
                format: 'HH:mm',
                defaultValue: [moment(), moment('23:59:59', 'HH:mm:ss')]
              }}
              format="YYYY-MM-DD HH:mm"
              size={'large'}
              onChange={handleNewExpityTimeInput}
              onOk={onOk}
              /> */}

            <DatePicker
              placeholder="Expiry time for your vault"
              name="vaultExpiryTime"
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
          </Space>
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
                <Radio.Group value={vaultType} onChange={handelChangeVaultType}>
                  <Radio value={0}>Random</Radio>
                  <Radio value={1}>Fixed</Radio>
                  <Radio value={2}>Divided</Radio>
                </Radio.Group>
              </Form.Item>
              {selectVaultType()}

              {/* Advanced */}
              <Form.Item>
                <StyledCollapse>
                  <Panel header="Advanced" key="1">
                    {selectExpiry()}
                  </Panel>
                </StyledCollapse>
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