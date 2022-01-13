import styled from "styled-components";
import React from "react";
import LixiLogo from '@assets/images/lixi_logo.svg';
import LixiText from '@assets/images/lixi_logo_text.svg';
import PrimaryButton, { SecondaryButton, SmartButton } from "@components/Common/PrimaryButton";
import { ExclamationCircleOutlined, ImportOutlined, LockOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Form, Input, Modal } from "antd";
import { useState } from "react";
import { AntdFormWrapper } from "@components/Common/EnhancedInputs";
import { AppContext } from "src/store/store";
import { useAppDispatch } from "src/store/hooks";
import { generateAccount, importAccount } from "src/store/account/actions";

export const LotusLogo = styled.img`
  width: 70px;
  @media (max-width: 768px) {
    width: 50px;
  }
`;

export const LixiTextLogo = styled.img`
  width: 250px;
  margin-left: 40px;
  @media (max-width: 768px) {
    width: 190px;
    margin-left: 20px;
  }
`;

export const WelcomeText = styled.p`
  color: ${props => props.theme.wallet.text.secondary};
  width: 100%;
  font-size: 16px;
  margin-bottom: 60px;
  text-align: center;
`;

export const WelcomeLink = styled.a`
  text-decoration: underline;
  color: ${props => props.theme.primary};
`;

export const Onboarding = styled.div`
  position: relative;
  width: 500px;
  min-height: 100vh;
  padding: 10px 30px 20px 30px;
  background: #fff;
  -webkit-box-shadow: 0px 0px 24px 1px rgb(0 0 0);
  -moz-box-shadow: 0px 0px 24px 1px rgba(0,0,0,1);
  box-shadow: 0px 0px 24px 1px rgb(0 0 0);
`;

const OnboardingComponent: React.FC = () => {
  const ContextValue = React.useContext(AppContext);
  const { /*createWallet*/ Wallet } = ContextValue;
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: '',
  });
  const [seedInput, openSeedInput] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(false);
  const { confirm } = Modal;

  const dispatch = useAppDispatch();

  async function showBackupConfirmModal() {
    confirm({
      title: "Don't forget to back up your account",
      icon: <ExclamationCircleOutlined />,
      content: `Once your account is created you can back it up by writing down your 12-word seed. You can find your seed on the Settings page. If you are browsing in Incognito mode or if you clear your browser history, you will lose any funds that are not backed up!`,
      okText: 'Okay, make me a account!',
      centered: true,
      onOk() {
        dispatch(generateAccount())
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

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
          <LotusLogo src={LixiLogo} alt="lixi" />
          <LixiTextLogo src={LixiText} alt="lixi" />
        </div>

        <h2 style={{ marginTop: '50px' }}>Welcome to LixiLotus!</h2>
        <WelcomeText>
          LixiLotus is an open source, non-custodial web wallet for Lotus.
          LixiLotus allow you to giveaway your Lotus effortlessly.
          <br />
          To start, install LixiLotus to your device follow {' '}
          <WelcomeLink
            href="https://gitlab.com/abcpros/givegift/-/wikis/home"
            target="_blank"
            rel="noreferrer"
          >
            the guide
          </WelcomeLink>
        </WelcomeText>
        <PrimaryButton
          style={{ marginTop: '100px' }}
          onClick={() => showBackupConfirmModal()}
        >
          <PlusSquareOutlined /> New Account
        </PrimaryButton>

        <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
          <ImportOutlined /> Import Account
        </SecondaryButton>
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
      </Onboarding>
    </>
  )
};

export default OnboardingComponent;