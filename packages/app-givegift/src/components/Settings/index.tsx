import { Alert, Collapse, Form, Input, Spin } from 'antd';
import { useState } from 'react';
import { generateAccount } from 'src/store/account/actions';
import { getAllAccounts, getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import styled from 'styled-components';

import { CashLoadingIcon } from '@abcpros/givegift-components/components/Common/CustomIcons';
import { Account } from '@abcpros/givegift-models';
import {
  CopyOutlined, ImportOutlined, LockOutlined, PlusSquareOutlined, WalletOutlined
} from '@ant-design/icons';
import { ReactComponent as Edit } from '@assets/icons/edit.svg';
import { ReactComponent as Trashcan } from '@assets/icons/trashcan.svg';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import PrimaryButton, { SecondaryButton, SmartButton } from '@components/Common/PrimaryButton';
import { StyledCollapse } from '@components/Common/StyledCollapse';
import { StyledSpacer } from '@components/Common/StyledSpacer';

const { Panel } = Collapse

export const ThemedCopyOutlined = styled(CopyOutlined)`
  color: ${props => props.theme.icons.outlined} !important;
`;

export const ThemedWalletOutlined = styled(WalletOutlined)`
  color: ${props => props.theme.icons.outlined} !important;
`;

const SWRow = styled.div`
    border-radius: 3px;
    padding: 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    @media (max-width: 500px) {
        flex-direction: column;
        margin-bottom: 12px;
    }
`;

const SWName = styled.div`
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    word-wrap: break-word;
    hyphens: auto;

    @media (max-width: 500px) {
        width: 100%;
        justify-content: center;
        margin-bottom: 15px;
    }

    h3 {
        font-size: 16px;
        color: ${props => props.theme.wallet.text.secondary};
        margin: 0;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const SWButtonCtn = styled.div`
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    @media (max-width: 500px) {
        width: 100%;
        justify-content: center;
    }

    button {
        cursor: pointer;

        @media (max-width: 768px) {
            font-size: 14px;
        }
    }

    svg {
        stroke: ${props => props.theme.wallet.text.secondary};
        fill: ${props => props.theme.wallet.text.secondary};
        width: 25px;
        height: 25px;
        margin-right: 20px;
        cursor: pointer;

        :first-child:hover {
            stroke: ${props => props.theme.primary};
            fill: ${props => props.theme.primary};
        }
        :hover {
            stroke: ${props => props.theme.settings.delete};
            fill: ${props => props.theme.settings.delete};
        }
    }
`;

const AWRow = styled.div`
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  h3 {
    font-size: 16px;
    display: inline-block;
    color: ${props => props.theme.wallet.text.secondary};
    margin: 0;
    text-align: left;
    font-weight: bold;
    @media (max-width: 500px) {
      font-size: 14px;
    }
  }
  h4 {
    font-size: 16px;
    display: inline-block;
    color: ${props => props.theme.primary} !important;
    margin: 0;
    text-align: right;
  }
  @media (max-width: 500px) {
    flex-direction: column;
    margin-bottom: 12px;
  }
`;

const Settings: React.FC = () => {
  const isLoading = useAppSelector(getIsGlobalLoading);
  const [seedInput, openSeedInput] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState(null);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: '',
  });

  const dispatch = useAppDispatch();
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const selectedAccount: Account | undefined = useAppSelector(getSelectedAccount);

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
            <p className="notranslate">
              {selectedAccount && selectedAccount.mnemonic
                ? selectedAccount.mnemonic
                : ''}
            </p>
          </Panel>
        </StyledCollapse>
        <StyledSpacer />
        <h2 style={{ color: '#6f2dbd' }}>
          <ThemedWalletOutlined /> Manage Accounts
        </h2>
        <PrimaryButton onClick={() => dispatch(generateAccount())}>
          <PlusSquareOutlined /> New Account
        </PrimaryButton>
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

        {savedAccounts && savedAccounts.length > 0 && (
          <>
            <StyledCollapse>
              <Panel header="Saved accounts" key="2">
                <AWRow>
                  <h3>{selectedAccount?.name}</h3>
                  <h4>Currently active</h4>
                </AWRow>
                <div>
                  {savedAccounts.map(acc => (
                    <SWRow key={acc.name}>
                      <SWName>
                        <h3>{acc.name}</h3>
                      </SWName>

                      <SWButtonCtn>
                        <Edit
                          onClick={() => { }
                            // showPopulatedRenameWalletModal(
                            //   sw,
                            // )
                          }
                        />
                        <Trashcan
                          onClick={() => { }
                            // showPopulatedDeleteWalletModal(
                            //   sw,
                            // )
                          }
                        />
                        <button
                          onClick={() => { }
                            // updateSavedWalletsOnLoad(sw)
                          }
                        >
                          Activate
                        </button>
                      </SWButtonCtn>
                    </SWRow>
                  ))}
                </div>
              </Panel>
            </StyledCollapse>
          </>
        )}
      </Spin>
    </>
  )
};

export default Settings;