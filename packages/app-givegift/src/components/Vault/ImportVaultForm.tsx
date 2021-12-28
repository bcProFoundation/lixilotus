import React, { useState } from 'react';
import { Collapse, Form, Input, Modal, notification } from 'antd';
import { ImportOutlined } from '@ant-design/icons';
import { VaultCollapse } from "@abcpros/givegift-components/components/Common/StyledCollapse";
import { AntdFormWrapper } from '@abcpros/givegift-components/components/Common/EnhancedInputs';
import { SmartButton } from '@abcpros/givegift-components/components/Common/PrimaryButton';
import { AppContext } from 'src/store/store';
import { useAppDispatch } from 'src/store/hooks';
import { importVault } from 'src/store/vault/actions';
import { ImportVaultDto } from '@abcpros/givegift-models/lib/vault';
const { Panel } = Collapse;

type ImportVaultFormProps = {
  createVault: Function;
} & React.HTMLProps<HTMLElement>;

const ImportVaultForm = ({
  disabled
}: ImportVaultFormProps) => {

  const { Wallet } = React.useContext(AppContext);

  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: '',
    redeemCode: ''
  });
  const [mnemonicIsValid, setMnemonicIsValid] = useState<boolean | null>(null);
  const [redeemCodeIsValid, setRedeemCodeIsValid] = useState<boolean | null>(null);

  // Only enable ImportVault button if all entries are valid
  let importVaultFormDataIsValid = mnemonicIsValid && redeemCodeIsValid;

  const handleChangeMnemonicInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setMnemonicIsValid(Wallet.validateMnemonic(value));
    setFormData(p => ({ ...p, [name]: value }));
  };

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

    if (!formData.mnemonic || !formData.redeemCode) {
      return;
    }

    const importVaultDto: ImportVaultDto = {
      encryptedPrivKey: formData.mnemonic,
      redeemCode: formData.redeemCode
    };
    dispatch(importVault(importVaultDto));
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
                  !formData.dirty && !formData.mnemonic
                    ? 'error'
                    : ''
                }
              >
                <Input
                  addonBefore="Mnemonic Phrase"
                  autoComplete="off"
                  placeholder="mnemonic (seed phrase)"
                  name="mnemonic"
                  onChange={e => handleChangeMnemonicInput(e)}
                />
              </Form.Item>
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