import { Badge, Button, Comment, Form, Input, Layout, Modal, Space } from 'antd';
import styled from 'styled-components';
import InfoCardUser from '@components/Common/InfoCardUser';
import { SmartButton } from '@components/Common/PrimaryButton';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllAccounts, getSelectedAccount } from '@store/account/selectors';
import { BellTwoTone, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';
import { getAllNotifications } from '@store/notification/selectors';
import { deleteNotification, fetchNotifications, readNotification } from '@store/notification/actions';
import Link from 'next/link';
import SwipeToDelete from 'react-swipe-to-delete-ios';
import { downloadExportedLixi } from '@store/lixi/actions';
import { Account, NotificationDto as Notification } from '@bcpros/lixi-models';
import moment from 'moment';
import * as _ from 'lodash';
import intl from 'react-intl-universal';
import { generateAccount, importAccount, selectAccount } from '@store/account/actions';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { WalletContext } from '@store/store';
import { useRouter } from 'next/router';

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
  }

  .right-bar {
    width: 100%;
    .menu {
      display: flex;
      .menu-item {
        margin-right: 1rem;
        padding: 5px;
        img {
          width: 24px;
        }
        &.active-item {
          background-color: rgb(255, 210, 77);
          border-radius: 8px;
        }
      }
    }
    .content {
      margin-top: 2rem;
      > div {
        background: #fff;
        padding: 20px;
        margin-bottom: 8px;
        border-radius: 20px;
        box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
        display: flex;
        justify-content: space-between;
        img {
          width: 24px;
        }
      }
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
`;

const StyledBell = styled(BellTwoTone)`
  font-size: 25px;
  position: relative;
  top: 7px;
  cursor: pointer;
`;

const StyledBadge = styled(Badge)`
  position: absolute;
  top: 2rem;
  right: 2rem;
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

// const StyledBell = styled(BellTwoTone)`
//   font-size: 22px;
//   position: relative;
//   top: 7px;
//   cursor: pointer;
// `;

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

const SidebarRanking = () => {
  const ContextValue = React.useContext(WalletContext);
  const { Wallet } = ContextValue;
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  const handleDelete = (account: Account, notificationId: string) => {
    dispatch(deleteNotification({ mnemonichHash: account.mnemonicHash, notificationId }));
  };

  const handleRead = (account: Account, notification: Notification) => {
    dispatch(readNotification({ mnemonichHash: account.mnemonicHash, notificationId: notification.id }));
    if (notification.notificationTypeId === 3) {
      const { parentId, mnemonicHash, fileName } = notification.additionalData as any;
      dispatch(downloadExportedLixi({ lixiId: parentId, mnemonicHash, fileName }));
    }
  };

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
    setIsValidMnemonic(Wallet.validateMnemonic(value));

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
          <div
            onClick={() => {
              setIsShowNotification(!isShowNotification);
            }}
          >
            <StyledBadge
              count={notifications.length}
              overflowCount={9}
              offset={[notifications.length < 10 ? 0 : 5, 25]}
              color="var(--color-primary)"
            >
              <StyledBell twoToneColor="#6f2dbd" />
            </StyledBadge>
          </div>
        )}
      </div>

      {router?.pathname !== '/wallet' && (
        <div className="right-bar">
          {!isShowNotification && (
            <div>
              <div className="menu">
                <div className="menu-item active-item">
                  <img src="/images/trend-ico.svg" alt="" />
                </div>
                <div className="menu-item">
                  <img src="/images/x-ico.svg" alt="" />
                </div>
                <div className="menu-item">
                  <img src="/images/tag-ico.svg" alt="" />
                </div>
              </div>
              <div className="content">
                <h3>Trending Experience</h3>
                <div>
                  <InfoCardUser imgUrl={null} name={'Nguyen Tanh'} title={'@ericson'}></InfoCardUser>
                  <img src="/images/three-dot-ico.svg" alt="" />
                </div>
                <div>
                  <InfoCardUser imgUrl={null} name={'Binh Vo'} title={'@kensaurús'}></InfoCardUser>
                  <img src="/images/three-dot-ico.svg" alt="" />
                </div>
                <div>
                  <InfoCardUser imgUrl={null} name={'Tan Vu'} title={'@talkyorn'}></InfoCardUser>
                  <img src="/images/three-dot-ico.svg" alt="" />
                </div>
                <div>
                  <InfoCardUser imgUrl={null} name={'Viet Tran'} title={'@vince8x'}></InfoCardUser>
                  <img src="/images/three-dot-ico.svg" alt="" />
                </div>
                <div>
                  <InfoCardUser imgUrl={null} name={'Nghia Cao'} title={'@nghiacc'}></InfoCardUser>
                  <img src="/images/three-dot-ico.svg" alt="" />
                </div>
              </div>
            </div>
          )}

          {isShowNotification && (
            <div className="notification-container">
              {notifications && notifications.length > 0 && (
                <>
                  {notifications.map(notification => (
                    <>
                      {isShowNotification ? (
                        <div onClick={() => handleRead(selectedAccount, notification)}>
                          <StyledSwipeToDelete
                            key={notification.id}
                            onDelete={() => handleDelete(selectedAccount, notification.id)}
                            deleteColor="var(--color-primary)"
                          >
                            <StyledComment
                              key={notification.id}
                              style={{
                                backgroundColor: notification.readAt == null ? '#eceff5' : '#fff',
                                borderRadius: '0px'
                              }}
                              author={
                                <StyledAuthor>
                                  <StyledTextLeft></StyledTextLeft>
                                  <StyledTextRight>
                                    {moment(notification.createdAt).local().format('MMMM Do YYYY, h:mm a')}
                                  </StyledTextRight>
                                </StyledAuthor>
                              }
                              content={
                                <div style={{ fontWeight: notification.readAt != null ? 'normal' : 'bold' }}>
                                  {notification.message}
                                </div>
                              }
                            />
                          </StyledSwipeToDelete>
                        </div>
                      ) : (
                        <StyledComment
                          key={notification.id}
                          style={{
                            borderRadius: '10px',
                            backgroundColor: notification.readAt == null ? '#eceff5' : '#fff',
                            marginBottom: '5px'
                          }}
                          author={
                            <StyledAuthor>
                              <StyledTextLeft></StyledTextLeft>
                              <StyledTextRight>
                                {moment(notification.createdAt).local().format('MMMM Do YYYY, h:mm a')}
                              </StyledTextRight>
                            </StyledAuthor>
                          }
                          content={
                            <Space>
                              <div
                                style={{
                                  fontWeight: notification.readAt != null ? 'normal' : 'bold',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleRead(selectedAccount, notification)}
                              >
                                {notification.message}
                              </div>
                              <CloseCircleOutlined onClick={() => handleDelete(selectedAccount, notification.id)} />
                            </Space>
                          }
                        />
                      )}
                    </>
                  ))}
                </>
              )}
            </div>
          )}
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
