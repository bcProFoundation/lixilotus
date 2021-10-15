import React, { useState } from 'react';
import { Collapse, Form, Input, Modal, notification } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import isEmpty from 'lodash.isempty';
import { VaultCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
const { Panel } = Collapse;

type CreateVaultFormProps = {
  XPI: any;
  getRestUrl: Function;
  disabled?: boolean | undefined;
  createVault: Function;
};

const CreateVaultForm = ({
  XPI,
  disabled
}: CreateVaultFormProps) => {

  // New Vault name
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultNameIsValid, setNewVaultNameIsValid] = useState<boolean | null>(null);
  const handleNewVaultNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewVaultName(value);
    if (value && !isEmpty(value)) {
      setNewVaultNameIsValid(true);
    }
  };

  // Modal settings
  const [showConfirmCreateVault, setShowConfirmCreateVault] = useState(false);

  return (
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
              >
                <Input
                  addonBefore="Name"
                  placeholder="Enter a name for your vault"
                  name="vaultName"
                  value={newVaultName}
                  onChange={e => handleNewVaultNameInput(e)}
                />
              </Form.Item>
            </Form>
          </AntdFormWrapper>
          <SmartButton
            onClick={() => setShowConfirmCreateVault(true)}
            disabled={!newVaultNameIsValid}
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