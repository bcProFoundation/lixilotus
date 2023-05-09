import { Account } from '@bcpros/lixi-models';
import { getAllAccounts, getSelectedAccount, getSelectedAccountId } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Layout, message, Space, Modal, Popover, Button, Badge } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axiosClient from '@utils/axiosClient';
import intl from 'react-intl-universal';
import { getAllNotifications } from '@store/notification/selectors';
import NotificationPopup from '@components/NotificationPopup';
import { fetchNotifications } from '@store/notification/actions';
import { AvatarUser } from '@components/Common/AvatarUser';
import { getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';
import SidebarListItem from './SidebarListItem';
import { useWorshipedPeopleByUserIdQuery } from '@store/worship/worshipedPerson.generated';
import { getRecentVisitedPeople } from '@store/account/selectors';

const { Sider } = Layout;

export const ItemAccess = ({
  icon,
  text,
  href,
  active,
  direction,
  onClickItem
}: {
  icon: string;
  text: string;
  href?: string;
  active: boolean;
  direction?: string;
  onClickItem?: () => void;
}) => (
  <Link onClick={onClickItem} href={href}>
    <a>
      <Space direction={direction === 'horizontal' ? 'horizontal' : 'vertical'} className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>
          <img src={icon} />
        </div>
        <span className="text-item">{text}</span>
      </Space>
    </a>
  </Link>
);

export const ItemAccessBarcode = ({
  icon,
  component,
  active
}: {
  icon: React.FC;
  component: JSX.Element;
  active: boolean;
}) => (
  <Link href="">
    <a>
      <Space direction="vertical" className={'item-access'}>
        <div className={classNames('icon-item', { 'active-item-access': active })}>{React.createElement(icon)}</div>
        <span className="text-item">{component}</span>
      </Space>
    </a>
  </Link>
);

export const ContainerAccess = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  border-right: 1px solid #f4e3f4;
`;

const StyledLogo = styled.div`
  margin: 2rem 0;
  cursor: pointer;
  background: linear-gradient(0deg, rgba(158, 42, 156, 0.08), rgba(158, 42, 156, 0.08)), #fffbff;
  @media (max-height: 768px) {
    margin: 0.8rem 0;
  }
`;

const StyledSidebar = styled(Sider)`
  position: sticky !important;
  top: 0px;
  height: 100vh;
  overflow: auto;
  background: var(--bg-color-sidebar-light-theme) !important ;
  .wrapper {
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (min-width: 768px) and (max-width: 1000px) {
      padding: 0 1rem 1rem 1rem !important;
    }
  }
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
  @media (max-width: 960px) {
    display: none;
  }
  @media (min-width: 960px) and (max-width: 1400px) {
    min-width: 320px !important;
    max-width: 320px !important;
  }
  @media (min-width: 1400px) {
    min-width: 350px !important;
    max-width: 350px !important;
  }
`;

const StyledWrapper = styled.div`
  margin-top: 10px;
  margin-bottom: 5px;
  background: #e0e0e0;
  border-radius: 15px;
  min-height: 60px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 16px;

  @media (min-width: 960px) and (max-width: 1400px) {
    min-width: 300px !important;
    max-width: 300px !important;
  }
  @media (min-width: 1400px) {
    min-width: 320px !important;
    max-width: 320px !important;
  }
`;

const StyledLogoText = styled.p`
  font-size: 20px;
  margin-bottom: 0px;
  font-family: fantasy;
  margin-left: 20px;
`;

const StyledText = styled.p`
  font-size: 16px;
  margin-bottom: 0px;
  font-weight: bold;
`;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px;
`;

const StyledHeaderText = styled.p`
  margin: 0px;
  font-weight: 700;
  font-size: 18px;
  line-height: 32px;
`;

const StyledWalletContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 7px;
  cursor: pointer;
  border-radius: 15px;
  padding: 5px;
  transition: 0.5s;

  &:hover {
    background-color: #ceccca;
  }
`;

const StyledSpace = styled(Space)`
  width: 100%;
  cursor: pointer;
  border-radius: 15px;
  padding: 5px;
  transition: 0.5s;

  &:hover {
    background-color: #ceccca;
  }
`;

const StyledCopyOutlined = styled(CopyOutlined)`
  margin-left: 5px;
  cursor: pointer;
`;
const SidebarContent = () => {
  const refSidebarShortcut = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const walletStatus = useAppSelector(getWalletStatus);
  const worshipedPeople = useWorshipedPeopleByUserIdQuery();
  const recentVisitedPeople = useAppSelector(getRecentVisitedPeople);
  const history = useRouter();

  const triggerSrollbar = e => {
    const sidebarShortcutNode = refSidebarShortcut.current;
    sidebarShortcutNode.classList.add('show-scroll');
    setTimeout(() => {
      sidebarShortcutNode.classList.remove('show-scroll');
    }, 700);
  };

  const handleOnCopy = e => {
    message.info(intl.get('lixi.addressCopied'));
  };

  const WorshipedPlaceholder = () => {
    return (
      <StyledWrapper style={{ flexDirection: 'column' }}>
        <StyledContainer>
          <picture>
            <img alt="you-worshiped-placeholder" src="/images/you-worshiped-placeholder.svg" width="150px" />
          </picture>
          <StyledHeaderText>Ban thờ</StyledHeaderText>
          <p style={{ fontSize: 13 }}>
            You are responsible for operations, service, or customer support and face challenges trying to
          </p>
        </StyledContainer>
      </StyledWrapper>
    );
  };

  const RecentVisitedPlaceholder = () => {
    return (
      <StyledWrapper style={{ flexDirection: 'column' }}>
        <StyledContainer>
          <picture>
            <img alt="recent-visited-placeholder" src="/images/recent-visited-placeholder.svg" width="150px" />
          </picture>
          <StyledHeaderText>Thăm viếng gần đây</StyledHeaderText>
          <p style={{ fontSize: 13 }}>
            You are responsible for operations, service, or customer support and face challenges trying to
          </p>
        </StyledContainer>
      </StyledWrapper>
    );
  };

  return (
    <StyledSidebar id="short-cut-sidebar" ref={refSidebarShortcut} onScroll={e => triggerSrollbar(e)}>
      <div className="wrapper">
        <StyledWrapper style={{ justifyContent: 'center', cursor: 'pointer' }} onClick={() => history.push('/')}>
          <picture>
            <img width="35px" src="/images/lotus_logo.png" alt="lixilotus" />
          </picture>
          <StyledLogoText>Lotus Temple</StyledLogoText>
        </StyledWrapper>
        {selectedAccount && (
          <StyledWrapper style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <StyledSpace onClick={() => history.push('/settings')}>
              <AvatarUser name={selectedAccount.name} />
              <StyledText>{selectedAccount.name}</StyledText>
            </StyledSpace>
            <StyledWalletContainer onClick={() => history.push('/wallet')}>
              <picture>
                <img alt="wallet-placeholder" src="/images/wallet-placeholder.svg" />
              </picture>
              <Space direction="vertical" style={{ width: '100%' }}>
                <StyledText style={{ textAlign: 'left' }}>Tài khoản của bạn</StyledText>
                <div style={{ display: 'flex', justifyContent: 'space-between' }} onClick={e => e.stopPropagation()}>
                  <CopyToClipboard text={selectedAccount.address} onCopy={handleOnCopy}>
                    <div>
                      <span>{selectedAccount.address.substring(selectedAccount.address.length - 7)}</span>
                      <StyledCopyOutlined />
                    </div>
                  </CopyToClipboard>
                  <p style={{ margin: 0 }}>
                    {fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis).toLocaleString('vi')} XPI
                  </p>
                </div>
              </Space>
            </StyledWalletContainer>
          </StyledWrapper>
        )}
        {worshipedPeople.currentData ? (
          <StyledWrapper style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <StyledContainer>
              <StyledHeader>
                <StyledHeaderText>Ban thờ</StyledHeaderText>
                <p style={{ marginBottom: '0', color: '#004B74' }}>Xem tất cả</p>
              </StyledHeader>
              {worshipedPeople.currentData.allWorshipedPersonByUserId.edges.map((person, index) => {
                return (
                  <SidebarListItem
                    key={index}
                    id={person.node.id}
                    name={person.node.name}
                    totalWorshipAmount={person.node.totalWorshipAmount}
                  />
                );
              })}
            </StyledContainer>
          </StyledWrapper>
        ) : (
          WorshipedPlaceholder()
        )}

        {recentVisitedPeople && recentVisitedPeople.length > 0 ? (
          <StyledWrapper style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <StyledContainer>
              <StyledHeader>
                <StyledHeaderText>Thăm viếng gần đây</StyledHeaderText>
              </StyledHeader>
              {recentVisitedPeople.map((person, index) => {
                return (
                  <SidebarListItem
                    key={index}
                    id={person.id}
                    name={person.name}
                    totalWorshipAmount={person.totalWorshipAmount}
                  />
                );
              })}
            </StyledContainer>
          </StyledWrapper>
        ) : (
          RecentVisitedPlaceholder()
        )}
      </div>
    </StyledSidebar>
  );
};
export default SidebarContent;
