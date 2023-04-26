import styled from 'styled-components';
import intl from 'react-intl-universal';
import { useState } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { useInfinitePagesQuery } from '@store/page/useInfinitePagesQuery';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { useRouter } from 'next/router';
import { getRecentVisitedPeople, getSelectedAccount } from '@store/account/selectors';
import { AvatarUser } from '@components/Common/AvatarUser';
import { message, Space } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getWalletStatus } from '@store/wallet';
import SidebarListItem from './SidebarListItem';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { useWorshipedPeopleByUserIdQuery } from '@store/worship/worshipedPerson.generated';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: Function;
};

const StyledSidebar = styled.div`
  height: 100vh;
  height: auto;
  text-align: left;
  max-width: 320px;
  background: var(--bg-color-sidebar-light-theme) !important ;
  padding: 10px;
  .wrapper {
    padding: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1rem 1rem 1rem !important;
  }

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const StyledWrapper = styled.div`
  margin-top: 10px;
  width: 100%;
  margin-bottom: 5px;
  background: #e0e0e0;
  border-radius: 15px;
  min-height: 60px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 16px;
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
`;

const SidebarShortcut = ({ className }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const history = useRouter();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const walletStatus = useAppSelector(getWalletStatus);
  const worshipedPeople = useWorshipedPeopleByUserIdQuery();
  const recentVisitedPeople = useAppSelector(getRecentVisitedPeople);

  const handleOnClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  const handleOnCopy = () => {
    message.info(intl.get('lixi.addressCopied'));
  };

  const WorshipedPlaceholder = () => {
    return (
      <StyledWrapper style={{ flexDirection: 'column' }}>
        <StyledContainer>
          <picture>
            <img alt="you-worshiped-placeholder" src="/images/you-worshiped-placeholder.svg" width="150px" />
          </picture>
          <StyledHeaderText>Bàn thờ</StyledHeaderText>
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

  const handleMenuClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  return (
    <StyledSidebar onClick={handleOnClick}>
      <div className="wrapper">
        <div style={{ width: '100%', textAlign: 'right', marginTop: 10 }}>
          <picture>
            <img alt="x-icon" src="/images/x-icon.svg" width={25} onClick={() => handleMenuClick()} />
          </picture>
        </div>
        {selectedAccount && (
          <StyledWrapper style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <Space>
              <AvatarUser name={selectedAccount.name} />
              <StyledText>{selectedAccount.name}</StyledText>
            </Space>
            <StyledWalletContainer>
              <picture>
                <img alt="wallet-placeholder" src="/images/wallet-placeholder.svg" />
              </picture>
              <Space direction="vertical" style={{ width: '100%' }}>
                <StyledText style={{ textAlign: 'left' }}>Tài khoản của bạn</StyledText>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <CopyToClipboard text={selectedAccount.address} onCopy={handleOnCopy}>
                    <div>
                      <span>{selectedAccount.address.substring(selectedAccount.address.length - 7)}</span>
                      <CopyOutlined style={{ marginLeft: 5, cursor: 'pointer' }} />
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
                <StyledHeaderText>Bàn thờ</StyledHeaderText>
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

export default SidebarShortcut;
