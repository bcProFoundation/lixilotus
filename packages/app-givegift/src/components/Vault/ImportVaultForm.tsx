import { Collapse, Form, Input } from 'antd';
import React, { useState } from 'react';
import { useAppDispatch } from 'src/store/hooks';
import { importVault } from 'src/store/vault/actions';

import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { VaultCollapse } from '@abcpros/givegift-components/components/Common/StyledCollapse';
import { Account } from '@abcpros/givegift-models';
import { ImportVaultCommand } from '@abcpros/givegift-models/lib/vault';
import { ImportOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

type ImportVaultFormProps = {
  account?: Account;
} & React.HTMLProps<HTMLElement>;

const ImportVaultForm = ({
  account,
  disabled
}: ImportVaultFormProps) => {

  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    dirty: true,
    redeemCode: ''
  });
  const [redeemCodeIsValid, setRedeemCodeIsValid] = useState<boolean | null>(null);

  // Only enable ImportVault button if all entries are valid
  let importVaultFormDataIsValid = redeemCodeIsValid;

  const handleChangeRedeemCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setRedeemCodeIsValid(value.length > 8);
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleSubmitImportVault = () => {
    setFormData({
      ...formData,
      dirty: false,
    });

    if (!formData.redeemCode || !account) {
      return;
    }

    const ImportVaultCommand: ImportVaultCommand = {
      mnemonic: account?.mnemonic,
      redeemCode: formData.redeemCode
    };
    dispatch(importVault(ImportVaultCommand));
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
        <Panel header="Import Vault" key="2">
          <AntdFormWrapper>
            <Form
              size="small"
              style={{
                width: 'auto',
              }}
            >
              <Form.Item
                validateStatus={
                  !formData.dirty && !formData.redeemCode
                    ? 'error'
                    : ''
                }
              >
                <Input
                  addonBefore="Redeem Code"
                  autoComplete="off"
                  placeholder="The redeem code"
                  name="redeemCode"
                  onChange={e => handleChangeRedeemCodeInput(e)}
                />
              </Form.Item>
            </Form>
          </AntdFormWrapper>
          <SmartButton
            disabled={!importVaultFormDataIsValid}
            onClick={() => handleSubmitImportVault()}
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