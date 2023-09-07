import { LockOutlined } from '@ant-design/icons';
import { Account } from '@bcpros/lixi-models';
import { AntdFormWrapper } from '@components/Common/EnhancedInputs';
import { SmartButton } from '@components/Common/PrimaryButton';
import { WalletContext } from '@context/index';
import { generateAccount, getLeaderboard, importAccount, selectAccount } from '@store/account/actions';
import { getAllAccounts, getSelectedAccount, getLeaderBoard } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Button, Space, Form, Input, Layout, Modal, Skeleton } from 'antd';
import * as _ from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import { OrderDirection, PageOrderField } from '@generated/types.generated';
import AvatarUser from '@components/Common/AvatarUser';
import { getCurrentThemes } from '@store/settings';
const { Sider } = Layout;

export const ShortcutItemAccess = ({
  icon,
  text,
  href,
  burnValue,
  icoRanking,
  isPage,
  onClickItem
}: {
  icon: string;
  text: string;
  burnValue?: number;
  icoRanking?: string;
  isPage?: boolean;
  href?: string;
  onClickItem?: () => void;
}) => (
  <Link onClick={onClickItem} href={href}>
    <a>
      <Space className={`${isPage ? 'avatar-page' : ''} item-access`}>
        <AvatarUser icon={icon} name={text} isMarginRight={false} />
        <div>
          {text}
          <span style={{ display: 'block', paddingTop: '4px', fontSize: '12px', color: 'rgba(30, 26, 29, 0.38)' }}>
            {burnValue}
            {intl.get('general.dana')}
          </span>
        </div>
        {icoRanking && <img className="ranking-img" src={icoRanking} />}
      </Space>
    </a>
  </Link>
);

const RankingSideBar = styled(Sider)`
  margin-top: 1rem;
  flex: auto !important;
  background: var(--bg-color-light-theme) !important;
  max-width: 250px !important;
  min-width: 250px !important;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
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

  .right-bar {
    width: 100%;
    position: relative;
    .container-right-bar {
      background: white;
      border: 1px solid var(--border-item-light);
      &.your-shortcuts {
        .ant-tabs-tab-active {
          color: var(--color-primary) !important;
        }
        margin-bottom: 1rem;
        .item-access {
          position: relative;
          gap: 1rem !important;
          margin-bottom: 0;

          div {
            margin: 0;
            color: #1e1a1d;
            font-size: 14px;
          }
          .ranking-img {
            width: 25px;
            position: absolute;
            top: 0px;
            left: -5px;
          }
          &:hover {
            div {
              color: var(--color-primary);
            }
          }
        }
        .animation-top-ranking {
          position: absolute;
          top: 0px;
          right: 0;
          width: 25px;
        }
      }
      .content {
        text-align: left;
        display: flex;
        flex-direction: column;
        .distance {
          padding: 1rem 1rem 0 1rem;
          &:last-child {
            padding-bottom: 1rem;
          }
        }
      }
    }
    .avatar-page {
      .ant-avatar {
        border-radius: var(--border-radius-primary);
        img {
          border-radius: var(--border-radius-primary);
        }
      }
    }
  }
`;

const SkeletonStyled = styled(Skeleton)`
  padding: 1rem;
  margin-bottom: 0.5rem;

  .ant-skeleton-header {
    .ant-skeleton-avatar {
      width: 48px;
      height: 48px;
    }
  }

  .ant-skeleton-title {
    margin-bottom: 0px !important;
  }
  .ant-skeleton-paragraph {
    margin-top: 0.6rem !important;
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
    border-radius: var(--border-radius-primary);
    img {
      width: 20px;
      margin-right: 8px;
    }
  }
  .address-logged {
    padding: 0.5rem 1rem;
    background: var(--bg-color-light-theme);
    border-radius: var(--border-radius-primary);
  }
  @media (max-width: 1000px) {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
`;

export const ManageAccounts = styled.div`
  background: white;
  border: 1px solid var(--border-item-light);
  .sub-account {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-item-light);
    padding: 1rem 1rem 0;
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
    padding: 0 1rem 1rem;
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

const SidebarRanking = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const Wallet = React.useContext(WalletContext);
  const selectedAccount = useAppSelector(getSelectedAccount);
  const [isSeemore, setIsSeemore] = useState<boolean>(false);
  const savedAccounts: Account[] = useAppSelector(getAllAccounts);
  const leaderboard = useAppSelector(getLeaderBoard);
  const currentTheme = useAppSelector(getCurrentThemes);
  const [open, setOpen] = useState(false);
  const [isValidMnemonic, setIsValidMnemonic] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    dirty: true,
    mnemonic: ''
  });
  const { validateMnemonic } = Wallet;

  useEffect(() => dispatch(getLeaderboard()), []);

  const [form] = Form.useForm();

  const { data: topPagesData, isLoading: isLoadingPage } = useInfinitePagesQuery(
    {
      first: 5,
      orderBy: [
        {
          direction: OrderDirection.Desc,
          field: PageOrderField.DanaBurnScore
        },
        {
          direction: OrderDirection.Desc,
          field: PageOrderField.TotalPostsBurnScore
        }
      ]
    },
    false
  );

  const otherAccounts = useMemo(() => {
    return _.filter(savedAccounts, acc => acc && acc.id !== selectedAccount?.id) || [];
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

  const getTopAccountAvatar = (item: any) => {
    if (item.avatar) {
      const { upload } = item.avatar;
      return `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${upload.cfImageId}/public`;
    } else {
      return '';
    }
  };

  return (
    <RankingSideBar className="sidebar-ranking" id="ranking-sidebar">
      {router?.pathname == '/' && (
        <>
          <div className="right-bar">
            <div className="container-right-bar your-shortcuts card">
              <div className="content">
                <h3 className="title-card">{intl.get('general.topPages')}</h3>
                {isLoadingPage ? (
                  <SkeletonStyled active avatar paragraph={{ rows: 1 }} />
                ) : (
                  topPagesData.slice(0, 5).map((item, index) => {
                    return (
                      <>
                        {index === 0 && (
                          <h4 className="distance" key={`${item.id}`}>
                            <ShortcutItemAccess
                              burnValue={item.totalBurnForPage}
                              icon={item.avatar ? item.avatar : item.name}
                              text={item.name}
                              href={`/page/${item.id}`}
                              isPage={true}
                              icoRanking="/images/ico-circled-1-ranking.png"
                            />
                          </h4>
                        )}
                        {index === 1 && (
                          <h4 className="distance" key={`${item.id}`}>
                            <ShortcutItemAccess
                              burnValue={item.totalBurnForPage}
                              icon={item.avatar ? item.avatar : item.name}
                              text={item.name}
                              href={`/page/${item.id}`}
                              isPage={true}
                              icoRanking="/images/ico-circled-2-ranking.png"
                            />
                          </h4>
                        )}
                        {index === 2 && (
                          <h4 className="distance" key={`${item.id}`}>
                            <ShortcutItemAccess
                              burnValue={item.totalBurnForPage}
                              icon={item.avatar ? item.avatar : item.name}
                              text={item.name}
                              href={`/page/${item.id}`}
                              isPage={true}
                              icoRanking="/images/ico-circled-3-ranking.png"
                            />
                          </h4>
                        )}
                        {index > 2 && (
                          <h4 className="distance" key={`${item.id}`}>
                            <ShortcutItemAccess
                              burnValue={item.totalBurnForPage}
                              icon={item.avatar ? item.avatar : item.name}
                              text={item.name}
                              isPage={true}
                              href={`/page/${item.id}`}
                            />
                          </h4>
                        )}
                      </>
                    );
                  })
                )}
              </div>
              <img
                className="animation-top-ranking"
                src={`${currentTheme === 'dark' ? '/images/ico-fire-static.png' : '/images/ico-fire-animation.gif'}`}
                alt=""
              />
            </div>
          </div>

          <div className="right-bar">
            <div className="container-right-bar your-shortcuts card">
              <div className="content">
                <h3 className="title-card">{intl.get('general.topAccounts')}</h3>
                {isLoadingPage ? (
                  <SkeletonStyled active avatar paragraph={{ rows: 1 }} />
                ) : (
                  leaderboard.map((item, index) => {
                    return (
                      <>
                        {index === 0 && (
                          <h4 className="distance" key={`${item.id}-${item.address}`}>
                            <ShortcutItemAccess
                              burnValue={item.accountDana.danaGiven}
                              icon={getTopAccountAvatar(item)}
                              text={item.name}
                              href={`/profile/${item.address}`}
                              icoRanking="/images/ico-circled-1-ranking.png"
                            />
                          </h4>
                        )}
                        {index === 1 && (
                          <h4 className="distance" key={`${item.id}-${item.address}`}>
                            <ShortcutItemAccess
                              burnValue={item.accountDana.danaGiven}
                              icon={getTopAccountAvatar(item)}
                              text={item.name}
                              href={`/profile/${item.address}`}
                              icoRanking="/images/ico-circled-2-ranking.png"
                            />
                          </h4>
                        )}
                        {index === 2 && (
                          <h4 className="distance" key={`${item.id}-${item.address}`}>
                            <ShortcutItemAccess
                              burnValue={item.accountDana.danaGiven}
                              icon={getTopAccountAvatar(item)}
                              text={item.name}
                              href={`/profile/${item.address}`}
                              icoRanking="/images/ico-circled-3-ranking.png"
                            />
                          </h4>
                        )}
                        {index > 2 && (
                          <h4 className="distance" key={`${item.id}-${item.address}`}>
                            <ShortcutItemAccess
                              burnValue={item.accountDana.danaGiven}
                              icon={getTopAccountAvatar(item)}
                              text={item.name}
                              href={`/profile/${item.address}`}
                            />
                          </h4>
                        )}
                      </>
                    );
                  })
                )}
              </div>
              <img
                className="animation-top-ranking"
                src={`${
                  currentTheme === 'dark' ? '/images/ico-fire-heart-static.png' : '/images/ico-fire-heart-animation.gif'
                }`}
                alt=""
              />
            </div>
          </div>
        </>
      )}

      {router?.pathname === '/wallet' && (
        <ManageAccounts className="card">
          <h3 className="title-card">Manage accounts</h3>
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
                  <div className="sub-account" key={index}>
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
                );
              } else if (isSeemore) {
                return (
                  <div className="sub-account" key={index}>
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

      <StyledModal
        className={`${currentTheme === 'dark' ? 'ant-modal-dark' : ''}`}
        title="Import account"
        transitionName=""
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
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

export default React.memo(SidebarRanking);
