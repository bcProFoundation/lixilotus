import { useAppSelector } from "src/store/hooks";
import { CashLoadingIcon } from "@abcpros/givegift-components/components/Common/CustomIcons";
import { getIsGlobalLoading } from "src/store/loading/selectors";
import { Alert, Spin, Collapse, Form, Input } from "antd";
import { CopyOutlined, ImportOutlined, LockOutlined, WalletOutlined } from "@ant-design/icons";
import { StyledCollapse } from "@components/Common/StyledCollapse";
import styled from "styled-components";
import { SecondaryButton, SmartButton } from "@components/Common/PrimaryButton";
import { useState } from "react";
import { AntdFormWrapper } from "@components/Common/EnhancedInputs";

const { Panel } = Collapse

const StyledSpacer = styled.div`
    height: 1px;
    width: 100%;
    background-color: ${props => props.theme.wallet.borders.color};
    margin: 60px 0 50px;
`;

export const ThemedCopyOutlined = styled(CopyOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;

export const ThemedWalletOutlined = styled(WalletOutlined)`
    color: ${props => props.theme.icons.outlined} !important;
`;

const SettingsComponent: React.FC = () => {
  const isLoading = useAppSelector(getIsGlobalLoading);
  const [seedInput, openSeedInput] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(null);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: '',
  });

  // const handleChange = e => {
  //   const { value, name } = e.target;

  //   // Validate mnemonic on change
  //   // Import button should be disabled unless mnemonic is valid
  //   setIsValidMnemonic(validateMnemonic(value));

  //   setFormData(p => ({ ...p, [name]: value }));
  // };

  async function submit() {
    setFormData({
        ...formData,
        dirty: false,
    });

    // Exit if no user input
    if (!formData.mnemonic) {
        return;
    }

    // Exit if mnemonic is invalid
    if (!isValidMnemonic) {
        return;
    }
    // Event("Category", "Action", "Label")
    // Track number of times a different wallet is activated
    //updateSavedWalletsOnCreate(formData.mnemonic);
  }
    
  return (
    <>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
        <h2 style={{ color: '#6f2dbd' }}>
          <ThemedCopyOutlined /> Backup your account
        </h2>
        <Alert
          style={{ marginBottom: '12px' }}
          description="Your seed phrase is the only way to restore your account. Write it down. Keep it safe."
          type="warning"
          showIcon message
        />
        <StyledCollapse>
          <Panel header="Click to reveal seed phrase" key="1">
              <p className="notranslate">mnemonic
              </p>
          </Panel>
        </StyledCollapse>
        <StyledSpacer />
        <h2 style={{ color: '#6f2dbd' }}>
          <ThemedWalletOutlined /> Manage Accounts
        </h2>
        <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
            <ImportOutlined /> Import Account
        </SecondaryButton>
        {seedInput && (
          <>
              <p>
                  Copy and paste your mnemonic seed phrase below
                  to import an existing account
              </p>
              <AntdFormWrapper>
                <Form style={{ width: 'auto' }}>
                  <Form.Item
                    validateStatus={
                      isValidMnemonic === null ||
                      isValidMnemonic ? '' : 'error'
                    }
                    help={
                      isValidMnemonic === null ||
                      isValidMnemonic ? '' : 'Valid mnemonic seed phrase required'
                    }
                >
                    <Input
                        prefix={<LockOutlined />}
                        type="email"
                        placeholder="mnemonic (seed phrase)"
                        name="mnemonic"
                        autoComplete="off"
                        //onChange={e => handleChange(e)}
                        required
                    />
                  </Form.Item>
                  <SmartButton
                      disabled={!isValidMnemonic}
                      //onClick={() => submit()}
                  >
                      Import
                  </SmartButton>
                </Form>
              </AntdFormWrapper>
          </>
      )}
      </Spin>
    </>
  )
};

export default SettingsComponent;