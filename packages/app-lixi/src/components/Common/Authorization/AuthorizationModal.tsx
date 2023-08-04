import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ImportOutlined,
  LockOutlined,
  LoginOutlined,
  PlusSquareOutlined
} from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import PrimaryButton, { SecondaryButton, SmartButton } from '@components/Common/PrimaryButton';
import { WalletContext } from '@context/index';
import { generateAccount, importAccount } from '@store/account/actions';
import { useAppDispatch } from '@store/hooks';
import { closeModal } from '@store/modal/actions';
import { Button, Form, Input, Modal } from 'antd';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { AuthorizationOptions } from './Authorization.interface';

export const MaybeLaterLink = styled.a`
  width: 100%;
  margin-bottom: 60px;
  font-size: 16px;
  color: ${props => props.theme.wallet.text.secondary};
  text-decoration: underline;
  color: ${props => props.theme.primary};
  text-align: center;
`;

const AuthorizationButton = styled(Button)`
  background: rgb(158, 42, 156);
  color: white;
  display: flex;
  align-items: center;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  width: 49%;
  height: 40px;
  border-radius: var(--border-radius-primary) !important;
  justify-content: center;

  &.cancel {
    &:hover {
      color: #fff;
    }
  }
  &.registration {
    &:hover {
      color: #fff;
    }
    margin-left: 8px !important;
  }
`;

interface AuthorizationModalProps {
  options?: AuthorizationOptions;
  classStyle?: string;
}

export const AuthorizationModal = ({ classStyle }: AuthorizationModalProps) => {
  const Wallet = React.useContext(WalletContext);

  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });
  const [seedInput, openSeedInput] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const dispatch = useAppDispatch();

  const { confirm } = Modal;

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  const handleChange = e => {
    const { value, name } = e.target;

    // Validate mnemonic on change
    // Import button should be disabled unless mnemonic is valid
    setIsValidMnemonic(Wallet.validateMnemonic(value));

    setFormData(p => ({ ...p, [name]: value }));
  };

  async function showBackupConfirmModal() {
    confirm({
      title: intl.get('onboarding.dontForgetBackup'),
      icon: <ExclamationCircleOutlined />,
      content: intl.get('onboarding.dontForgetBackupDescription'),
      okText: intl.get('onboarding.dontForgetBackupConfirm'),
      cancelText: intl.get('onboarding.cancel'),
      centered: true,
      onOk() {
        dispatch(generateAccount());
        dispatch(closeModal());
      },
      onCancel() { }
    });
  }

  async function submit() {
    setFormData({
      ...formData,
      dirty: false
    });

    if (!formData.mnemonic) {
      return;
    }

    // Exit if mnemonic is invalid
    if (!isValidMnemonic) {
      return;
    }

    dispatch(importAccount(formData.mnemonic));
    dispatch(closeModal());
  }

  return (
    <Modal
      width={450}
      className={`${classStyle} authorixation-modal`}
      open={true}
      transitionName=""
      onCancel={handleOnCancel}
      style={{ textAlign: 'center' }}
      footer={null}
    >
      <>
        <h2>{intl.get('onboarding.createAccountToJoin')}</h2>
        <PrimaryButton style={{ marginTop: '20px' }} onClick={() => showBackupConfirmModal()}>
          <PlusSquareOutlined /> {intl.get('onboarding.newAccount')}
        </PrimaryButton>
        <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
          <ImportOutlined /> {intl.get('onboarding.importAccount')}
        </SecondaryButton>
        {seedInput && (
          <>
            <p>{intl.get('settings.backupAccountHint')}</p>
            <AntdFormWrapper>
              <Form style={{ width: 'auto' }}>
                <Form.Item
                  validateStatus={!formData.dirty && !formData.mnemonic ? 'error' : ''}
                  help={!formData.mnemonic || !isValidMnemonic ? intl.get('account.mnemonicRequired') : ''}
                >
                  <Input
                    prefix={<LockOutlined />}
                    placeholder={intl.get('account.mnemonic')}
                    name="mnemonic"
                    autoComplete="off"
                    onChange={e => handleChange(e)}
                    required
                  />
                </Form.Item>
                <SmartButton disabled={!isValidMnemonic} onClick={() => submit()}>
                  {intl.get('onboarding.import')}
                </SmartButton>
              </Form>
            </AntdFormWrapper>
          </>
        )}
        <p style={{ textAlign: 'center' }}>
          <MaybeLaterLink onClick={() => handleOnCancel()}>{intl.get('onboarding.maybeLater')}</MaybeLaterLink>
        </p>
      </>
    </Modal>
  );
};
