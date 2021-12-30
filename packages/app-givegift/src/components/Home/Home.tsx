import React, { useState } from "react";
import { Form, Input, Spin, Modal } from "antd";
import { ExclamationCircleOutlined, ImportOutlined, LockOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { useAppSelector } from "src/store/hooks";
import { AntdFormWrapper } from "@components/Common/EnhancedInputs";
import AccountList from "@components/Account/AccountList";
import { getAllAccounts } from "src/store/account/selectors";
import { CashLoadingIcon } from "@abcpros/givegift-components/components/Common/CustomIcons";
import PrimaryButton, { SecondaryButton, SmartButton } from "@components/Common/PrimaryButton";
import { getIsGlobalLoading } from "src/store/loading/selectors";
import ModalManager from "@components/Common/ModalManager";
import { AppContext } from "src/store/store";
import { useAppDispatch } from "src/store/hooks";
import { generateAccount } from "src/store/account/actions";



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
  const accounts = useAppSelector(getAllAccounts);

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
    dispatch(generateAccount())
  }

  return (
    <>
      <ModalManager />
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
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
                  type="email"
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
        <AccountList accounts={accounts} />
      </Spin>
    </>
  )
};

export default Home;