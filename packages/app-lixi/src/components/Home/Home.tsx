import { Form, Input, InputNumber, Modal, Spin } from 'antd';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { getAccount, importAccount, setAccountBalance } from 'src/store/account/actions';
import { getSelectedAccount } from 'src/store/account/selectors';
import { getEnvelopes } from 'src/store/envelope/actions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { AppContext } from 'src/store/store';
import { getVaultsBySelectedAccount } from 'src/store/vault/selectors';

import { LockOutlined } from '@ant-design/icons';
import BalanceHeader from '@bcpros/lixi-components/components/Common/BalanceHeader';
import { ThemedWalletOutlined } from '@bcpros/lixi-components/components/Common/CustomIcons';
import { currency } from '@bcpros/lixi-components/components/Common/Ticker';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
// import QRCode from '@components/Common/QRCode';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { StyledSpacer } from '@components/Common/StyledSpacer';
// import CreateVaultForm from '@components/Vault/CreateVaultForm';
import VaultList from '@components/Vault/VaultList';
import { fromSmallestDenomination } from '@utils/cashMethods';


const QRCode = dynamic(
  () => import('@bcpros/lixi-components/components/Common/QRCode'),
  { ssr: false }
);

const CreateVaultForm = dynamic(
  () => import('@components/Vault/CreateVaultForm'),
  { ssr: false }
);

const Home: React.FC = () => {

  const isServer = () => typeof window === 'undefined';
  const ContextValue = React.useContext(AppContext);
  const { XPI, Wallet } = ContextValue;
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
  const [isLoadBalanceError, setIsLoadBalanceError] = useState(false);


  useEffect(() => {
    dispatch(getEnvelopes());
    if (selectedAccount) {
      dispatch(getAccount(selectedAccount.id))
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      XPI.Electrumx.balance(selectedAccount?.address).then((result => {
        if (result && result.balance) {
          const balance = result.balance.confirmed + result.balance.unconfirmed;
          dispatch(setAccountBalance(balance ?? 0));
        }
      })).catch(e => {
        setIsLoadBalanceError(true);
      })
    }, 10000);
    return () => {
      return clearTimeout(id);
    }
  }, []);

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
      />
      <BalanceHeader
        balance={fromSmallestDenomination(selectedAccount?.balance ?? 0)}
        ticker={currency.ticker} />
      {!isServer() && selectedAccount?.address && <QRCode
        address={selectedAccount?.address}
      />}
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

      <CreateVaultForm account={selectedAccount} />
      <VaultList vaults={vaults} />
    </>
  )
};

export default Home;