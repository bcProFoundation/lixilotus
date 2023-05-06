import {
  BellFilled,
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  ImportOutlined,
  LockFilled,
  LockOutlined,
  PlusSquareOutlined,
  WalletOutlined
} from '@ant-design/icons';
import Edit from '@assets/icons/edit.svg';
import Trashcan from '@assets/icons/trashcan.svg';
import {
  CashLoadingIcon,
  ThemedQuerstionCircleOutlinedFaded,
  ThemedSettingOutlined
} from '@bcpros/lixi-components/components/Common/CustomIcons';
import { Account, DeleteAccountCommand, RenameAccountCommand } from '@bcpros/lixi-models';
import { AntdFormWrapper, LanguageSelectDropdown } from '@components/Common/EnhancedInputs';
import PrimaryButton, { SecondaryButton, SmartButton } from '@components/Common/PrimaryButton';
import { StyledCollapse } from '@components/Common/StyledCollapse';
import { AuthenticationContext, WalletContext } from '@context/index';
import { deleteAccount, generateAccount, importAccount, renameAccount, selectAccount } from '@store/account/actions';
import { getAllAccounts, getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getIsGlobalLoading } from '@store/loading/selectors';
import { openModal } from '@store/modal/actions';
import { setInitIntlStatus, updateLocale } from '@store/settings/actions';
import { getCurrentLocale } from '@store/settings/selectors';
import {
  askPermission,
  subscribeAllWalletsToPushNotification,
  unsubscribeAllWalletsFromPushNotification
} from '@utils/pushNotification';
import { Alert, Collapse, Form, Input, Modal, Spin, Switch, Tag } from 'antd';
import axios from 'axios';
import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { ServiceWorkerContext } from 'src/context/serviceWorkerProvider';
import styled from 'styled-components';
import { DeleteAccountModalProps } from './DeleteAccountModal';
import LockAppSetting from './LockAppSetting';
import PushNotificationSetting from './PushNotificationSetting';
import { RenameAccountModalProps } from './RenameAccountModal';

const { Panel } = Collapse;

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
    font-size: 14px;
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
    font-size: 14px;
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
    font-size: 14px;
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

export const WrapperPage = styled.div`
  width: 100%;
  max-width: 816px;
  margin: 1rem auto;
  padding: 20px 30px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--boder-item-light);
  height: max-content;
  display: block;
  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 8rem;
  }
`;

export const WrapperPost = styled.div`
  padding: 20px 30px;
  background: #fff;
  border-radius: 20px;
`;

const SettingBar = styled.div`
  padding: 1rem;
  border: 1px solid rgba(128, 116, 124, 0.12);
  border-radius: 24px;
  margin-bottom: 2rem;
  &.language-bar {
    margin-top: 2rem;
  }
  .ant-collapse-content {
    border: none;
  }
  @media (min-width: 960px) {
    .notranslate {
      font-weight: 500;
      color: transparent !important;
      text-shadow: 0 0 5px rgb(0 0 0 / 50%);
      &:hover {
        color: var(--color-primary) !important;
        text-shadow: none;
      }
    }
  }
  @media (max-width: 960px) {
    .notranslate {
      font-weight: 500;
      color: var(--color-primary) !important;
    }
  }
`;

const helpInfoIcon = (
  <ThemedQuerstionCircleOutlinedFaded
    onClick={() => {
      Modal.info({
        centered: true,
        okText: intl.get('settings.gotIt'),
        title: intl.get('settings.howEnableNotification'),
        maskClosable: true,
        content: (
          <div>
            <p>{intl.get('settings.deviceSupport')}</p>
            <p>{intl.get('settings.notSupportIos')}</p>
            <div className="heading">{intl.get('settings.twoStepEnableNotification')}</div>
            <ul>
              <li>
                {intl.get('settings.allowNotification')}
                <em>{intl.get('settings.forBrowser')}</em>.
              </li>
              <li>
                {intl.get('settings.thenAllowNotification')}
                <em>{intl.get('settings.sendlotusOnBrower')}</em>.
              </li>
            </ul>
          </div>
        )
      });
    }}
  />
);

const Settings: React.FC = () => {
  const Wallet = React.useContext(WalletContext);

  const isLoading = useAppSelector(getIsGlobalLoading);
  const [seedInput, openSeedInput] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });

  const [form] = Form.useForm();
  const [otherAccounts, setOtherAccounts] = useState<Account[]>([]);

  const serviceWorkerContext = React.useContext(ServiceWorkerContext);
  const [permission, setPermission] = useState(false);

  const dispatch = useAppDispatch();
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const selectedAccount: Account | undefined = useAppSelector(getSelectedAccount);

  useEffect(() => {
    setOtherAccounts(_.filter(savedAccounts, acc => acc.id !== selectedAccount?.id));
  }, [savedAccounts]);

  useEffect(() => {
    if (otherAccounts.length <= 0 && !selectedAccount) {
      localLogout();
    }
  }, [otherAccounts, selectedAccount]);

  const localLogout = async () => {
    const url = '/_api/local-logout';
    await axios.post(url);
  };

  const currentLocale = useAppSelector(getCurrentLocale);

  const showPopulatedRenameAccountModal = (account: Account) => {
    const command: RenameAccountCommand = {
      id: account.id,
      mnemonic: account.mnemonic,
      name: account.name
    };
    const renameAcountModalProps: RenameAccountModalProps = {
      account: account,
      onOkAction: renameAccount(command)
    };
    dispatch(openModal('RenameAccountModal', renameAcountModalProps));
  };

  const showPopulatedDeleteAccountModal = (account: Account) => {
    const command: DeleteAccountCommand = {
      id: account.id,
      mnemonic: account.mnemonic
    };
    const deleteAcountModalProps: DeleteAccountModalProps = {
      account: account,
      remainingAccounts: account == selectedAccount ? otherAccounts : [],
      onOkAction: deleteAccount(command)
    };
    dispatch(openModal('DeleteAccountModal', deleteAcountModalProps));
  };

  const handleChange = e => {
    const { value, name } = e.target;

    // Validate mnemonic on change
    // Import button should be disabled unless mnemonic is valid
    setIsValidMnemonic(Wallet.validateMnemonic(value));

    setFormData(p => ({ ...p, [name]: value }));
  };

  function setLocale(locales: any) {
    dispatch(setInitIntlStatus(false));
    dispatch(updateLocale(locales));
  }

  async function submit() {
    setFormData({
      ...formData,
      dirty: false
    });

    // Exit if no user input
    if (!formData.mnemonic) {
      return;
    }

    // Exit if mnemonic is invalid
    if (!isValidMnemonic) {
      return;
    }

    dispatch(importAccount(formData.mnemonic));

    form.setFieldsValue({
      mnemonic: ''
    });
  }

  return (
    <>
      <WrapperPage>
        <Spin spinning={isLoading} indicator={CashLoadingIcon}>
          <SettingBar>
            <h2 style={{ color: 'var(--color-primary)' }}>
              <ThemedCopyOutlined /> {intl.get('settings.backupAccount')}
            </h2>
            <Alert
              style={{ marginBottom: '12px' }}
              description={intl.get('settings.backupAccountWarning')}
              type="warning"
              showIcon
              message
            />
            <StyledCollapse>
              <Panel header={intl.get('settings.revealPhrase')} key="1">
                <p className="notranslate">
                  {selectedAccount && selectedAccount.mnemonic ? selectedAccount.mnemonic : ''}
                </p>
              </Panel>
            </StyledCollapse>
          </SettingBar>
          <SettingBar>
            <h2 style={{ color: 'var(--color-primary)' }}>
              <ThemedWalletOutlined /> {intl.get('settings.manageAccounts')}
            </h2>
            <PrimaryButton onClick={() => dispatch(generateAccount())}>
              <PlusSquareOutlined /> {intl.get('settings.newAccount')}
            </PrimaryButton>
            <SecondaryButton onClick={() => openSeedInput(!seedInput)}>
              <ImportOutlined /> {intl.get('settings.importAccount')}
            </SecondaryButton>
            {seedInput && (
              <>
                <p>{intl.get('settings.backupAccountHint')}</p>
                <AntdFormWrapper>
                  <Form style={{ width: 'auto' }} form={form}>
                    <Form.Item
                      name="mnemonic"
                      validateStatus={isValidMnemonic === null || isValidMnemonic ? '' : 'error'}
                      help={isValidMnemonic === null || isValidMnemonic ? '' : intl.get('account.mnemonicRequired')}
                    >
                      <Input
                        prefix={<LockOutlined />}
                        placeholder={intl.get('account.mnemonic')}
                        name="mnemonic"
                        autoComplete="off"
                        onChange={e => handleChange(e)}
                      />
                    </Form.Item>
                    <SmartButton disabled={!isValidMnemonic} onClick={() => submit()}>
                      Import
                    </SmartButton>
                  </Form>
                </AntdFormWrapper>
              </>
            )}

            {(selectedAccount || (otherAccounts && otherAccounts.length > 0)) && (
              <>
                <StyledCollapse>
                  <Panel header={intl.get('settings.savedAccount')} key="2">
                    {
                      <AWRow>
                        <SWName>
                          <h3>{selectedAccount?.name}</h3>
                        </SWName>
                        <SWButtonCtn>
                          <span onClick={() => showPopulatedRenameAccountModal(selectedAccount as Account)}>
                            <Edit />
                          </span>
                          <span onClick={() => showPopulatedDeleteAccountModal(selectedAccount as Account)}>
                            <Trashcan />
                          </span>
                          <h4>{intl.get('settings.activated')}</h4>
                        </SWButtonCtn>
                      </AWRow>
                    }
                    <div>
                      {otherAccounts &&
                        otherAccounts.map(acc => (
                          <SWRow key={acc.id}>
                            <SWName>
                              <h3>{acc.name}</h3>
                            </SWName>

                            <SWButtonCtn>
                              <span onClick={() => showPopulatedRenameAccountModal(acc)}>
                                <Edit />
                              </span>
                              <span onClick={() => showPopulatedDeleteAccountModal(acc)}>
                                <Trashcan />
                              </span>
                              <button onClick={() => dispatch(selectAccount(acc.id))}>Activate</button>
                            </SWButtonCtn>
                          </SWRow>
                        ))}
                    </div>
                  </Panel>
                </StyledCollapse>
                <SettingBar className="language-bar">
                  <h2 style={{ color: 'var(--color-primary)' }}>
                    <ThemedSettingOutlined /> {intl.get('settings.languages')}
                  </h2>
                  <AntdFormWrapper>
                    <LanguageSelectDropdown
                      defaultValue={currentLocale}
                      onChange={(locale: any) => {
                        setLocale(locale);
                      }}
                    />
                  </AntdFormWrapper>
                </SettingBar>
                <SettingBar>
                  <h2 style={{ color: 'var(--color-primary)' }}>
                    <ThemedSettingOutlined /> {intl.get('settings.general')}
                  </h2>
                  <LockAppSetting />
                  <PushNotificationSetting />
                </SettingBar>
                {/* TODO: Implement in the future */}
                {/* <Button href={getOauth2URL()}>Login</Button> */}
              </>
            )}
          </SettingBar>
        </Spin>
      </WrapperPage>
    </>
  );
};

export default Settings;
