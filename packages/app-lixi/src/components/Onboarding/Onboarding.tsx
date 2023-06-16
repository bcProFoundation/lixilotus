import { ExclamationCircleOutlined, ImportOutlined, LockOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import PrimaryButton, { SecondaryButton, SmartButton } from '@components/Common/PrimaryButton';
import { generateAccount, importAccount } from '@store/account/actions';
import { Form, Input, Modal } from 'antd';
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { useAppDispatch } from '@store/hooks';
import { WalletContext } from '@context/index';
import styled from 'styled-components';

export const LotusLogo = styled.img`
  width: 70px;
  @media (max-width: 768px) {
    width: 50px;
  }
`;

export const LixiTextLogo = styled.img`
  width: 250px;
  margin-left: 0;
  @media (max-width: 768px) {
    width: 190px;
    margin-left: 0;
  }
`;

export const WelcomeText = styled.p`
  color: ${props => props.theme.wallet.text.secondary};
  width: 100%;
  font-size: 14px;
  margin-bottom: 60px;
  text-align: center;
`;

export const WelcomeLink = styled.a`
  text-decoration: underline;
  color: ${props => props.theme.primary};
`;

export const Onboarding = styled.div`
  padding: 10px 30px 20px 30px;
  background: #fff;
  border-radius: var(--border-radius-primary);
`;

const OnboardingComponent: React.FC = () => {
  const Wallet = React.useContext(WalletContext);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });
  const [seedInput, openSeedInput] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const { confirm } = Modal;

  const dispatch = useAppDispatch();

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
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  }

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
  }

  return (
    <>
      <Onboarding>
        <div style={{ marginTop: '20px' }}>
          <LixiTextLogo src="/images/lixi_logo_text.png" alt="lixi" />
        </div>

        <h2 style={{ marginTop: '50px' }}>{intl.get('onboarding.welcomeToLotus')}</h2>
        <WelcomeText>
          {intl.get('onboarding.lixiLotusIntroduce1')}
          {intl.get('onboarding.lixiLotusIntroduce2')}
          <br />
          {intl.get('onboarding.lixiLotusIntroduce3')}{' '}
          <WelcomeLink href="https://gitlab.com/abcpros/givegift/-/wikis/home" target="_blank" rel="noreferrer">
            {intl.get('onboarding.lixiLotusIntroduce4')}
          </WelcomeLink>
        </WelcomeText>
        <PrimaryButton style={{ marginTop: '100px' }} onClick={() => showBackupConfirmModal()}>
          <PlusSquareOutlined /> {intl.get('onboarding.newAccount')}
        </PrimaryButton>

        <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
          <ImportOutlined /> {intl.get('onboarding.importAccount')}
        </SecondaryButton>
        {seedInput && (
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
        )}
      </Onboarding>
    </>
  );
};

export default OnboardingComponent;
