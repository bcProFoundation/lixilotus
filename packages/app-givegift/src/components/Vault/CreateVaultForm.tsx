import React, { useState } from 'react';
import { Collapse, Form, Input, Modal, notification, Radio, RadioChangeEvent } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import isEmpty from 'lodash.isempty';
import { VaultCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { currency } from '@abcpros/givegift-components/components/Common/Ticker';
import { isValidAmountInput } from '@utils/validation';
import { VaultParamLabel } from '@abcpros/givegift-components/components/Common/Atoms';
import { GenerateVaultDto, Vault, VaultType } from '@abcpros/givegift-models/lib/vault';
import { useAppDispatch } from 'src/store/hooks';
import { generateVault } from 'src/store/vault/actions';
import { openModal } from 'src/store/modal/actions';
import { CreateVaultConfirmationModalProps } from './CreateVaultConfirmationModal';
const { Panel } = Collapse;

type CreateVaultFormProps = {
} & React.HTMLProps<HTMLElement>;

const CreateVaultForm = ({
  disabled,
}: CreateVaultFormProps) => {

  const dispatch = useAppDispatch();

  // New Vault name
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultNameIsValid, setNewVaultNameIsValid] = useState<boolean | null>(null);
  const [isRandomGive, setIsRandomGive] = useState<boolean>(true);
  const [vaultType, setVaultType] = useState<number>(0);

  // New max redemption number
  const [newMaxRedeem, setNewMaxRedeemVault] = useState('');
  const [newMaxRedeemVaultIsValid, setNewMaxRedeemVaultIsValid] = useState(true);

  //redeemed number
  const [newRedeemedNum, setNewRedeemedVault] = useState('');


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

  // Only enable CreateVault button if all form entries are valid
  let createVaultFormDataIsValid =
    newVaultNameIsValid && newMaxRedeemVaultIsValid &&
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
      redeemedNum: newRedeemedNum,
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
      newRedeemedNum,
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
                  placeholder="Enter max Redeem number for your vault"
                  name="vaultMaxReDeem"
                  value={newMaxRedeem}
                  onChange={e => handleNewMaxRedeemInput(e)}
                />
              </Form.Item>

              <Form.Item>
                <Radio.Group value={vaultType} onChange={handelChangeVaultType}>
                  <Radio value={0}>Random</Radio>
                  <Radio value={1}>Fixed</Radio>
                  <Radio value={2}>Divided</Radio>
                </Radio.Group>
              </Form.Item>
              {selectVaultType()}
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