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
import { Vault } from '@abcpros/givegift-models/lib/vault';
const { Panel } = Collapse;

type CreateVaultFormProps = {
  XPI: any;
  getRestUrl: Function;
  disabled?: boolean | undefined;
  createVault: Function;
  // passLoadingStatus: Function;
};

const CreateVaultForm = ({
  XPI,
  getRestUrl,
  disabled,
  createVault,
  // passLoadingStatus
}: CreateVaultFormProps) => {

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
  const [newVaultDefaultValue, setNewVaultDefaultValue] = useState('');
  const [newVaultDefaultValueIsValid, setNewVaultDefaultValueIsValid] = useState(true);


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
      (!isRandomGive && newVaultDefaultValueIsValid));

  // Modal settings
  const [showConfirmCreateVault, setShowConfirmCreateVault] = useState(false);

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

  const handleChangeDefaultValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultDefaultValueIsValid(isValidAmountInput(value));
    setNewVaultDefaultValue(value);
  }

  const createPreviewedVault = async () => {
    // Start the spinner
    // passLoadingStatus(true);

    if (!createVaultFormDataIsValid) {
      // If for some reason, the data is invalid then cancel
      return;
    }

    // Create vault
    try {
      const vaultData: Vault = {
        name: newVaultName,
        minValue: newVaultMinValue,
        maxValue: newVaultMaxValue,
        defaultValue: newVaultDefaultValue,
        isRandomGive: isRandomGive
      };

      const vault = await createVault(vaultData);
    } catch (e: any) {
      // Set loading to false here as well, as balance may not change depending on where error occured in try loop
      // passLoadingStatus(false);
      let message;

      if (!e.error && !e.message) {
        message = `Transaction failed: no response from ${getRestUrl()}.`;
      } else if (
        /Could not communicate with full node or other external service/.test(
          e.error,
        )
      ) {
        message = 'Could not communicate with API. Please try again.';
      } else if (
        e.error &&
        e.error.includes(
          'too-long-mempool-chain, too many unconfirmed ancestors [limit: 50] (code 64)',
        )
      ) {
        message = `The ${currency.ticker} you are trying to send has too many unconfirmed ancestors to send (limit 50). Sending will be possible after a block confirmation. Try again in about 10 minutes.`;
      } else {
        message = e.message || e.error || JSON.stringify(e);
      }

      notification.error({
        message: 'Error',
        description: message,
        duration: 5,
      });
      console.error(e);
    }
    // Hide the modal
    setShowConfirmCreateVault(false);
    // Stop spinner
    // passLoadingStatus(false);
  }


  return (
    <>
      <Modal
        title={`Please confirm your vault settings.`}
        visible={showConfirmCreateVault}
        onOk={createPreviewedVault}
        onCancel={() => setShowConfirmCreateVault(false)}
      >
        <VaultParamLabel>Name:</VaultParamLabel> {newVaultName}
        <br />
        {isRandomGive ?
          (
            <>
              <VaultParamLabel>The fund giving is randomized</VaultParamLabel>
              <br />
              <VaultParamLabel>Min:</VaultParamLabel> {newVaultMinValue}
              <br />
              <VaultParamLabel>Max:</VaultParamLabel> {newVaultMaxValue}
            </>
          ) :
          (
            <>
              <VaultParamLabel>The default fund:</VaultParamLabel> {newVaultDefaultValue}
            </>
          )}
        <br />
      </Modal>
      <>
        <VaultCollapse
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
                    <Radio value={false}>Default</Radio>
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
                          addonBefore="Default"
                          type="number"
                          step={1 / 10 ** currency.cashDecimals}
                          value={newVaultDefaultValue}
                          placeholder="Default value to give"
                          name="defaultValue"
                          onChange={e => handleChangeDefaultValue(e)}
                        >
                        </Input>
                      </Input.Group>
                    </Form.Item>
                  )
                }
              </Form>
            </AntdFormWrapper>
            <SmartButton
              onClick={() => setShowConfirmCreateVault(true)}
              disabled={!createVaultFormDataIsValid}
            >
              <PlusSquareOutlined />
              &nbsp;Create Vault
            </SmartButton>
          </Panel>
        </VaultCollapse>
      </>
    </>
  );
}

export default CreateVaultForm;