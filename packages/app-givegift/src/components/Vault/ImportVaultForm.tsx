import React, { useState } from 'react';
import { Collapse, Form, Input, Modal, notification } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { VaultCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
const { Panel } = Collapse;

type ImportVaultFormProps = {
  XPI: any;
  getRestUrl: Function;
  disabled?: boolean | undefined;
  createVault: Function;
};

const ImportVaultForm = ({
  XPI,
  disabled
}: ImportVaultFormProps) => {


  const [mnemonic, setMnemonic] = useState('');
  const [redeemCode, setRedeemCode] = useState('');

  const handleChangeMnemonicInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setMnemonic(value);
  };

  const handleChangeRedeemCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setRedeemCode(value);
  };

  // Modal settings
  const [showConfirmImportVault, setShowConfirmImportVault] = useState(false);

  return (
    <>
      <VaultCollapse
        collapsible={disabled ? 'disabled' : 'header'}
        disabled={disabled}
        style={{
          marginBottom: '24px'
        }}
      >
        <Panel header="Import Vault" key="1">
          <AntdFormWrapper>
            <Form
              size="small"
              style={{
                width: 'auto',
              }}
            >
              <Form.Item>
                <Input
                  addonBefore="Mnemonic Phrase"
                  autoComplete="off"
                  placeholder="mnemonic (seed phrase)"
                  name="mnemonic"
                  value={mnemonic}
                  onChange={e => handleChangeMnemonicInput(e)}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  addonBefore="Redeem Code"
                  autoComplete="off"
                  placeholder="The redeem code"
                  name="redeemCode"
                  value={redeemCode}
                  onChange={e => handleChangeRedeemCodeInput(e)}
                />
              </Form.Item>
            </Form>
          </AntdFormWrapper>
          <SmartButton
            onClick={() => setShowConfirmImportVault(true)}
          >
            <ImportOutlined />
            &nbsp;Import Vault
          </SmartButton>
        </Panel>
      </VaultCollapse>
    </>
  );
}

export default ImportVaultForm;