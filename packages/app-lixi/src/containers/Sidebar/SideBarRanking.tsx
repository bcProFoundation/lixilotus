import { BellTwoTone, LockOutlined, NumberOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import { Account } from '@bcpros/lixi-models';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import InfoCardUser from '@components/Common/InfoCardUser';
import { SmartButton } from '@components/Common/PrimaryButton';
import { WalletContext } from '@context/index';
import { generateAccount, getLeaderboard, importAccount, selectAccount } from '@store/account/actions';
import { getAllAccounts, getSelectedAccount, getLeaderBoard } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchNotifications } from '@store/notification/actions';
import { getAllNotifications } from '@store/notification/selectors';
import { Badge, Button, Space, Form, Input, Layout, Modal, Tabs, Collapse } from 'antd';
import * as _ from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import { AvatarUser } from '@components/Common/AvatarUser';
import CollapsePanel from 'antd/es/collapse/CollapsePanel';
import { BorderRadius } from 'styled-icons/boxicons-regular';
const { Sider } = Layout;

export const ShortcutItemAccess = ({
  icon,
  text,
  href,
  burnValue,
  onClickItem
}: {
  icon: string;
  text: string;
  burnValue?: number;
  href?: string;
  onClickItem?: () => void;
}) => (
  <Link onClick={onClickItem} href={href}>
    <a>
      <Space className={'item-access'}>
        <AvatarUser name={text} isMarginRight={false} />
        <div>
          {text}
          <span style={{ display: 'block', paddingTop: '4px', fontSize: '14px', color: 'rgba(30, 26, 29, 0.38)' }}>
            Burned:{burnValue} XPI
          </span>
        </div>
      </Space>
    </a>
  </Link>
);

const RankingSideBar = styled(Sider)`
  margin-top: 1rem;
  height: 100vh;
  overflow: auto;
  flex: auto !important;
  background: var(--bg-color-light-theme) !important;
  &::-webkit-scrollbar {
    width: 5px;
  } 
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  &.show-scroll {
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background-image: linear-gradient(180deg, #d0368a 0%, #708ad4 99%) !important;
      box-shadow: inset 2px 2px 5px 0 rgba(#fff, 0.5);
      border-radius: 100px;
    }
  }
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  @media (max-width: 960px) {
    display: none;
  }
  @media (min-width: 960px) and (max-width: 1400px) {
    max-width: 270px !important;
    min-width: 270px !important;
  }
  @media (min-width: 1400px) {
    max-width: 330px !important;
    min-width: 330px !important;
  }

  .login-session {
    background: #fff;
    width: 100%;
    padding: 2rem 2rem 1rem 2rem;
    border-radius: 20px;
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
    .container-right-bar {
      background: white;
      border-radius: 24px;
      padding: 24px 16px 1rem 24px;
      border: 1px solid var(--boder-item-light);
      &.your-shortcuts {
        margin-bottom: 1rem;
        padding: 24px;
        .item-access {
          gap: 1rem !important;
          margin-bottom: 1rem;

          div {
            margin: 0;
            color: #1e1a1d;
            font-size: 16px;
            letter-spacing: 0.5px span {
              display: 'block';
              padding-top: '4px';
              font-size: '14px';
              color: rgba(30, 26, 29, 0.38);
            }
          }
        }
        .content {
          h3 {
            margin-bottom: 24px;
          }
        }
      }
      .content {
        text-align: left;
        display: flex;
        flex-direction: column;
        h3 {
          font-weight: 400;
          font-size: 22px;
          line-height: 28px;
          color: var(--text-color-on-background);
        }
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
  background: white;
  border: 1px solid var(--boder-item-light);
  h2 {
    font-weight: 400;
    font-size: 22px;
    line-height: 28px;
    color: #1e1a1d;
    text-align: left;
  }
  .sub-account {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--boder-item-light);
    padding: 1rem 0;
    .sub-account-info {
      text-align: left;
      .name {
        font-size: 14px;
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

const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding: 24px 24px 0 24px !important;
  }
  .ant-modal-body {
    p {
      color: rgba(30, 26, 29, 0.38);
    }
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
  }
`;

const StyledTabs = styled(Tabs)`
  .ant-tabs-nav {
    .ant-tabs-nav-wrap {
      justify-content: center;
      .ant-tabs-nav-list {
        gap: 2rem;
        @media (max-width: 1400px) {
          gap: 1rem;
        }
      }
    }
    &::before {
      content: none;
    }
  }

  .anticon {
    color: rgba(30, 26, 29, 0.38);
    margin: 0;
    font-size: 28px;
  }

  .ant-tabs-tab {
    background: none !important;
    border: 0 !important;
    padding: 8px 16px;
    @media (max-width: 1400px) {
      padding: 8px;
    }
    &.ant-tabs-tab-active {
      border-bottom: 2px solid !important;
      .ant-tabs-tab-btn .anticon {
        color: #12130f;
      }
    }
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
  const refSidebarRanking = useRef<HTMLDivElement | null>(null);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const [isShowNotification, setIsShowNotification] = useState<boolean>(false);
  const [isCollapse, setIsCollapse] = useState(false);
  const leaderboard = useAppSelector(getLeaderBoard);
  const { Panel } = Collapse;
  const onChange = (key: string | string[]) => {
    console.log(key);
  }
  const [open, setOpen] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });
  const { validateMnemonic } = Wallet;

  useEffect(() => dispatch(getLeaderboard()), []);

  const [form] = Form.useForm();

  const { data } = useInfinitePagesQuery(
    {
      first: 10
    },
    false
  );

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
    setOtherAccounts(_.filter(savedAccounts, acc => acc && acc.id !== selectedAccount?.id));
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

  const triggerSrollbar = e => {
    const sidebarRankingNode = refSidebarRanking.current;
    sidebarRankingNode.classList.add('show-scroll');
    setTimeout(() => {
      sidebarRankingNode.classList.remove('show-scroll');
    }, 700);
  };

  return (
    <RankingSideBar id="ranking-sidebar" ref={refSidebarRanking} onScroll={e => triggerSrollbar(e)}>
      {/* TODO: loggin-session */}
      {/* <div className="login-session">
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
      </div> */}
      {router?.pathname == '/wallet' && (
        <div className="right-bar">
          <div className="container-right-bar your-shortcuts">
            <div className="content">
              <h3>Leader Board</h3>
              <Collapse defaultActiveKey={['1']} onChange={onChange}>
                <Panel header="Show top leader board" key="1">
                  {leaderboard.map((item, index) => {
                    return (
                      <h4 className="distance">
                        <ShortcutItemAccess
                          burnValue={item.totalBurned}
                          icon={item?.page ? item?.page?.avatar : ''}
                          text={item.name}
                          href={`/profile/${item.address}`}
                        />
                      </h4>
                    );
                  })}
                </Panel>
              </Collapse>
            </div>
          </div>
        </div>
      )}

      {router?.pathname !== '/wallet' && (
        <div className="right-bar">
          <div className="container-right-bar">
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

      <StyledModal title="Import account" open={open} footer={null} onCancel={() => setOpen(false)}>
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
