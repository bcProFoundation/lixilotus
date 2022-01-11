import { Form, Input, Modal, Spin, InputNumber } from 'antd';
import React, { useState } from 'react';
import { generateAccount, importAccount } from 'src/store/account/actions';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { AppContext } from 'src/store/store';
import { getVaultsBySelectedAccount } from 'src/store/vault/selectors';
import { ThemedWalletOutlined } from '@abcpros/givegift-components/components/Common/CustomIcons';
import WalletLabel from '@abcpros/givegift-components/components/Common/WalletLabel';
import { LockOutlined } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { StyledSpacer } from '@components/Common/StyledSpacer';
import CreateVaultForm from '@components/Vault/CreateVaultForm';
import VaultList from '@components/Vault/VaultList';

const Home: React.FC = () => {

  const ContextValue = React.useContext(AppContext);
  const { /*createWallet*/ Wallet } = ContextValue;
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: '',
  });
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const [seedInput, openSeedInput] = useState(false);
  const dispatch = useAppDispatch();
  const { confirm } = Modal;
  const isLoading = useAppSelector(getIsGlobalLoading);
  const vaults = useAppSelector(getVaultsBySelectedAccount);
  const selectedAccount = useAppSelector(getSelectedAccount);

  const handleChange = e => {
    const { value, name } = e.target;

    // Validate mnemonic on change
    // Import button should be disabled unless mnemonic is valid
    setIsValidMnemonic(Wallet.validateMnemonic(value));

    setFormData(p => ({ ...p, [name]: value }));
  };

  async function submit() {
    setFormData({
      ...formData,
      dirty: false,
    });

    if (!formData.mnemonic) {
      return;
    }
    dispatch(importAccount(formData.mnemonic));
  }

  return (
    <>
      <WalletLabel 
        name={selectedAccount?.name ?? ''} 
        address={selectedAccount?.address ?? ''} 
        balance={selectedAccount?.balance ?? 0} 
      />
      {seedInput && (
        <AntdFormWrapper>
          <Form style={{ width: 'auto' }}>
            <Form.Item
              validateStatus={
                !formData.dirty && !formData.mnemonic
                  ? 'error'
                  : ''
              }
              help={
                !formData.mnemonic || !isValidMnemonic
                  ? 'Valid mnemonic seed phrase required'
                  : ''
              }
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="mnemonic (seed phrase)"
                name="mnemonic"
                autoComplete="off"
                onChange={e => handleChange(e)}
                required
              />
            </Form.Item>

            <SmartButton
              disabled={!isValidMnemonic}
              onClick={() => submit()}
            >
              Import
            </SmartButton>
          </Form>
        </AntdFormWrapper>
      )}
      <StyledSpacer />
      <h2 style={{ color: '#6f2dbd' }}>
        <ThemedWalletOutlined /> Manage Vaults
      </h2>

      <CreateVaultForm account={selectedAccount}
      />
      <VaultList vaults={vaults} />
    </>
  )
};

export default Home;