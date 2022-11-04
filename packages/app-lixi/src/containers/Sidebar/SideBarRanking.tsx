import { BellTwoTone, LockOutlined, NumberOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { Account } from '@bcpros/lixi-models';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import InfoCardUser from '@components/Common/InfoCardUser';
import { SmartButton } from '@components/Common/PrimaryButton';
import NotificationPopup, { StyledPopover } from '@components/NotificationPopup';
import { WalletContext } from '@context/index';
import { generateAccount, importAccount, selectAccount } from '@store/account/actions';
import { getAllAccounts, getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchNotifications } from '@store/notification/actions';
import { getAllNotifications } from '@store/notification/selectors';
import { Badge, Button, Comment, Form, Input, Layout, Modal, Tabs } from 'antd';
import * as _ from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import SwipeToDelete from 'react-swipe-to-delete-ios';
import styled from 'styled-components';

const { Sider } = Layout;

const RankingSideBar = styled(Sider)`
  height: 50vh;
  right: 2rem;
  max-width: inherit !important;
  background: var(--bg-color-light-theme);
  border-radius: 20px;
  padding-bottom: 2rem;
  position: relative;
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  @media (max-width: 768px) {
    display: none;
  }
  @media (min-width: 1001px) {
    flex: none;
    min-width: 290px !important;
    width: 290px !important;
  }
  @media (min-width: 1366px) {
    flex: none;
    min-width: 312px !important;
    width: 312px !important;
  }

  .login-session {
    background: #fff;
    width: 100%;
    padding: 2rem 2rem 1rem 2rem;
    border-radius: 20px;
    box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
    margin-bottom: 2rem;
    &::before {
      top: 35px;
      left: 0;
      width: 8px;
      height: 40px;
      content: '';
      position: absolute;
      background: #7342cc;
      border-radius: 0px 10px 10px 0px;
    }
    button {
      margin-top: 1rem;
      padding: 5px;
      font-size: 14px;
    }
    @media (max-width: 1000px) {
      padding: 2rem 1rem 1rem 1rem !important;
    }
  }

  .right-bar {
    width: 100%;
    .content {
      text-align: left;
      h3 {
        font-size: 18px;
        text-align: left;
        font-weight: 600;
      }
    }
  }
`;

export const Logged = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .account-logged {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--bg-color-light-theme);
    border-radius: 20px;
    img {
      width: 20px;
      margin-right: 8px;
    }
  }
  .address-logged {
    padding: 0.5rem 1rem;
    background: var(--bg-color-light-theme);
    border-radius: 20px;
  }
  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`;

const StyledBell = styled(BellTwoTone)`
  font-size: 25px;
  position: relative;
  top: 7px;
  cursor: pointer;
`;

const StyledBadge = styled(Badge)`
  position: absolute;
  top: 26px;
  right: 2rem;
  @media (max-width: 1000px) {
    right: 1rem;
  }
`;

const ManageAccounts = styled.div`
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 20px;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  background: white;
  h2 {
    text-align: left;
  }
  .sub-account {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(128, 116, 124, 0.12);
    padding: 1rem 0;
    .sub-account-info {
      text-align: left;
      .name {
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      .address {
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: rgba(30, 26, 29, 0.38);
        margin-bottom: 0;
      }
    }
  }
  .action-manage-accounts {
    .ant-btn {
      width: 100%;
      height: 40px;
    }
  }
`;

const StyledComment = styled(Comment)`
  border-radius: 5px;
  border-bottom: 1px solid #e8e8e8;
  padding: 5px;

  &:hover {
    background-color: #eceff5;
  }

  .ant-comment-inner {
    padding: 0px;
    color: black;
  }
`;

const StyledAuthor = styled.div`
  font-size: 14px;
  color: black;
  display: inline-block;
  width: 310px;

  &:hover {
    color: black;
  }
`;

const StyledTextLeft = styled.span`
  float: left;
  font-size: 16px;
  font-weight: bold;
`;

const StyledTextRight = styled.span`
  float: right;
  font-size: 10px;
  font-style: italic;
`;

const StyledSwipeToDelete = styled(SwipeToDelete)`
  --rstdiHeight: 100% !important;
`;

const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding: 24px 24px 0 24px !important;
  }
  .ant-modal-body {
    p {
      color: rgba(30, 26, 29, 0.38);
    }
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    .ant-tabs-nav-wrap {
      justify-content: center;
      .ant-tabs-nav-list {
        gap: 1rem;
      }
    }
    &::before {
      content: none;
    }
  }
  .ant-tabs-tab {
    background: none !important;
    border: 0 !important;
    .ant-tabs-tab-btn {
      color: #12130f;
    }
    &.ant-tabs-tab-active {
      background: #ffd24d !important;
      border-radius: 16px !important;
    }
  }
  .anticon {
    color: #12130f;
    margin: 0;
    font-size: 22px;
  }
`;

const SidebarRanking = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Wallet = React.useContext(WalletContext);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const notifications = useAppSelector(getAllNotifications);
  const [isSeemore, setIsSeemore] = useState<boolean>(false);
  const [otherAccounts, setOtherAccounts] = useState<Account[]>([]);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isShowNotification, setIsShowNotification] = useState<boolean>(false);

  const [open, setOpen] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });
  const { validateMnemonic } = Wallet;

  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedAccount) {
      dispatch(
        fetchNotifications({
          accountId: selectedAccount.id,
          mnemonichHash: selectedAccount.mnemonicHash
        })
      );
    }
  }, []);

  useEffect(() => {
    setOtherAccounts(_.filter(savedAccounts, acc => acc.id !== selectedAccount?.id));
  }, [savedAccounts]);

  const showModal = () => {
    setOpen(true);
  };

  const handleSubmit = () => {
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
  };

  const handleChange = e => {
    const { value, name } = e.target;

    // Validate mnemonic on change
    // Import button should be disabled unless mnemonic is valid
    setIsValidMnemonic(validateMnemonic(value));

    setFormData(p => ({ ...p, [name]: value }));
  };

  return (
    <RankingSideBar>
      <div className="login-session">
        <InfoCardUser imgUrl={null} name={'Anonymous'} title={'@anonymous'}></InfoCardUser>
        {!selectedAccount && (
          <Link href="/admin/register-account" passHref>
            <SmartButton>Sign in to connect wallet</SmartButton>
          </Link>
        )}
        {selectedAccount && (
          <Logged>
            <div className="account-logged">
              <img src="/images/xpi.svg" alt="" />
              <span>{selectedAccount?.name || ''}</span>
            </div>
            <div className="address-logged">
              {selectedAccount?.address.slice(6, 11) + '...' + selectedAccount?.address.slice(-5)}
            </div>
          </Logged>
        )}
        {selectedAccount && (
          <StyledPopover
            content={NotificationPopup(notifications, selectedAccount)}
            placement="bottomRight"
            getPopupContainer={trigger => trigger}
            trigger={notifications.length != 0 && router.pathname !== '/notifications' ? 'click' : ''}
            title={intl.get('general.notifications')}
          >
            <StyledBadge
              count={notifications.length}
              overflowCount={9}
              offset={[notifications.length < 10 ? 0 : 5, 25]}
              color="var(--color-primary)"
            >
              <StyledBell twoToneColor="#6f2dbd" />
            </StyledBadge>
          </StyledPopover>
        )}
      </div>

      {router?.pathname !== '/wallet' && (
        <div className="right-bar">
          <div>
            <StyledTabs type="card">
              <Tabs.TabPane tab={<UserOutlined />} key="people">
                <div className="content">
                  <h3>Trending Experience</h3>
                  <InfoCardUser type="card" imgUrl={null} name={'Nghia Cao'} title={'@nghiacc'}></InfoCardUser>
                  <InfoCardUser type="card" imgUrl={null} name={'Binh Vo'} title={'@kensaurus'}></InfoCardUser>
                  <InfoCardUser type="card" imgUrl={null} name={'Viet Tran'} title={'@vince8x'}></InfoCardUser>
                  <InfoCardUser type="card" imgUrl={null} name={'Tan Vu'} title={'@talkyorn'}></InfoCardUser>
                  <InfoCardUser type="card" imgUrl={null} name={'Nguyen Tanh'} title={'@ericson'}></InfoCardUser>
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab={<ShopOutlined />} key="page">
                <div className="content">
                  <h3>Top Pages</h3>
                  <InfoCardUser
                    type="card"
                    imgUrl={'/images/default-avatar.jpg'}
                    name={'LotusiaShop'}
                    title={'@lotusia'}
                  ></InfoCardUser>
                  <InfoCardUser
                    type="card"
                    imgUrl={'/images/default-avatar.jpg'}
                    name={'GrammaLu'}
                    title={'@grammalu'}
                  ></InfoCardUser>
                  <InfoCardUser
                    type="card"
                    imgUrl={'/images/default-avatar.jpg'}
                    name={'Mabustore'}
                    title={'@mabu'}
                  ></InfoCardUser>
                  <InfoCardUser
                    type="card"
                    imgUrl={'/images/default-avatar.jpg'}
                    name={'Minminstore'}
                    title={'@minmin'}
                  ></InfoCardUser>
                  <InfoCardUser
                    type="card"
                    imgUrl={'/images/default-avatar.jpg'}
                    name={'Apple'}
                    title={'@apple'}
                  ></InfoCardUser>
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab={<NumberOutlined />} key="tag">
                <div className="content">
                  <h3>Trending HashTag</h3>
                  <p>#GiveLotus</p>
                  <p>#LixiLotus</p>
                  <p>#Love</p>
                  <p>#Heart</p>
                </div>
              </Tabs.TabPane>
            </StyledTabs>
          </div>
        </div>
      )}

      {router?.pathname === '/wallet' && (
        <ManageAccounts>
          <h2>Manage accounts</h2>
          <div className="sub-account">
            <div className="sub-account-info">
              <p className="name">{selectedAccount?.name}</p>
              <p className="address">{selectedAccount?.address.slice(-10)}</p>
            </div>
            <Button type="primary" className="no-border-btn">
              Activated
            </Button>
          </div>
          {otherAccounts &&
            otherAccounts.map((acc, index) => {
              if (!isSeemore && index <= 2) {
                return (
                  <div>
                    <div className="sub-account">
                      <div className="sub-account-info">
                        <p className="name">{acc?.name}</p>
                        <p className="address">{acc?.address.slice(-10)}</p>
                      </div>
                      <Button
                        type="primary"
                        className="outline-btn"
                        style={{ color: '#000' }}
                        onClick={() => {
                          dispatch(selectAccount(acc.id));
                        }}
                      >
                        Activate
                      </Button>
                    </div>
                  </div>
                );
              } else if (isSeemore) {
                return (
                  <div>
                    <div className="sub-account">
                      <div className="sub-account-info">
                        <p className="name">{acc?.name}</p>
                        <p className="address">{acc?.address.slice(-10)}</p>
                      </div>
                      <Button
                        type="primary"
                        className="outline-btn"
                        style={{ color: '#000' }}
                        onClick={() => {
                          dispatch(selectAccount(acc.id));
                        }}
                      >
                        Activate
                      </Button>
                    </div>
                  </div>
                );
              }
            })}
          {otherAccounts && otherAccounts.length > 2 && (
            <div style={{ marginTop: '1rem' }}>
              {isSeemore && (
                <Button type="primary" className="no-border-btn" onClick={() => setIsSeemore(!isSeemore)}>
                  See less
                </Button>
              )}
              {!isSeemore && (
                <Button type="primary" className="no-border-btn" onClick={() => setIsSeemore(!isSeemore)}>
                  See more
                </Button>
              )}
            </div>
          )}
          <div className="action-manage-accounts">
            <Button
              type="primary"
              className="outline-btn"
              style={{ margin: '1rem 0' }}
              onClick={() => dispatch(generateAccount())}
            >
              New account
            </Button>
            <Button type="primary" className="outline-btn" onClick={showModal}>
              Import account
            </Button>
          </div>
        </ManageAccounts>
      )}

      <StyledModal title="Import account" visible={open} footer={null} onCancel={() => setOpen(false)}>
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
            <SmartButton disabled={!isValidMnemonic} onClick={() => handleSubmit()} style={{ marginTop: '1rem' }}>
              Import
            </SmartButton>
          </Form>
        </AntdFormWrapper>
      </StyledModal>
    </RankingSideBar>
  );
};

export default SidebarRanking;
