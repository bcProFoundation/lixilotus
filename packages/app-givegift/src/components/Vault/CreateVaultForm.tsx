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
import { GenerateVaultDto, Vault } from '@abcpros/givegift-models/lib/vault';
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

  // New Vault Min Value
  const [newVaultMinValue, setNewVaultMinValue] = useState('');
  const [newVaultMinValueIsValid, setNewVaultMinValueIsValid] = useState(true);

  // New Vault Max Value
  const [newVaultMaxValue, setNewVaultMaxValue] = useState('');
  const [newVaultMaxValueIsValid, setNewVaultMaxValueIsValid] = useState(true);

  // New Vault Default Value
  const [newVaultFixedValue, setNewVaultFixedValue] = useState('');
  const [newVaultFixedValueIsValid, setNewVaultFixedValueIsValid] = useState(true);


  const handleNewVaultNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultName(value);
    if (value && !isEmpty(value)) {
      setNewVaultNameIsValid(true);
    }
  };

  // Only enable CreateVault button if all form entries are valid
  let createVaultFormDataIsValid =
    newVaultNameIsValid &&
    ((isRandomGive && newVaultMinValueIsValid && newVaultMaxValueIsValid) ||
      (!isRandomGive && newVaultFixedValueIsValid));

  const handleChangeIsRandomGive = (e: RadioChangeEvent) => {
    const { value } = e.target;
    setIsRandomGive(value);
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

  const handleSubmitCreateVault = () => {

    const generateVaultDto: GenerateVaultDto = {
      name: newVaultName,
      minValue: newVaultMinValue,
      maxValue: newVaultMaxValue,
      fixedValue: newVaultFixedValue,
      isRandomGive: isRandomGive,
      status: "active",
    };

    const createVaultModalProps: CreateVaultConfirmationModalProps = {
      isRandomGive,
      newVaultName,
      newVaultMinValue,
      newVaultMaxValue,
      newVaultFixedValue,
      onOkAction: generateVault(generateVaultDto)
    };
    dispatch(openModal('CreateVaultConfirmationModal', createVaultModalProps));
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
              <Form.Item>
                <Radio.Group value={isRandomGive} onChange={handleChangeIsRandomGive}>
                  <Radio value={true}>Random</Radio>
                  <Radio value={false}>Fixed</Radio>
                </Radio.Group>
              </Form.Item>
              {isRandomGive ?
                (
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
                        placeholder="Min value to give"
                        name="maxValue"
                        value={newVaultMaxValue}
                        onChange={e => handleChangeMaxValue(e)}
                      >
                      </Input>
                    </Form.Item>
                  </>
                ) : (
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
                )
              }
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