import styled from 'styled-components';
import { ItemAccess } from './SideBarShortcut';
import intl from 'react-intl-universal';
import { useState } from 'react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { push } from 'connected-next-router';
import { useRouter } from 'next/router';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: Function;
};

const ContainerSideBarContent = styled.div`
  height: 100%;
  text-align: left;
  margin: 1rem 0;
`;

const StyledContainerAccess = styled.div`
  display: flex;
  flex-direction: column;
  .item-access {
    gap: 1rem !important;
    padding: 1rem 0;
    .text-item {
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.5px;
      color: #1e1a1d;
    }
  }
`;

const SidebarContent = ({ className }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isCollapse, setIsCollapse] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);
  const currentPathName = router.pathname ?? '';

  const handleOnClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  const handleIconClick = (newPath?: string) => {
    dispatch(push(newPath));
  };

  return (
    <>
      <ContainerSideBarContent onClick={handleOnClick}>
        <StyledContainerAccess>
          {/* TODO: remove to footer mobile */}
          <ItemAccess
            icon={'/images/ico-home.svg'}
            text={intl.get('general.home')}
            active={false}
            key="home-lixi"
            onClickItem={() => handleIconClick('/')}
            direction={'horizontal'}
          />
          <ItemAccess
            icon={'/images/ico-account.svg'}
            text={intl.get('general.accounts')}
            active={false}
            key="account"
            onClickItem={() => handleIconClick('/wallet')}
            direction={'horizontal'}
          />
          <ItemAccess
            icon={'/images/ico-lixi.svg'}
            text={intl.get('general.lixi')}
            active={false}
            key="lixi"
            onClickItem={() => handleIconClick('/lixi')}
            direction={'horizontal'}
          />
          <ItemAccess
            icon={'/images/ico-setting.svg'}
            text={intl.get('general.settings')}
            active={false}
            key="settings"
            onClickItem={() => handleIconClick('/settings')}
            direction={'horizontal'}
          />
        </StyledContainerAccess>
      </ContainerSideBarContent>
    </>
  );
};

export default SidebarContent;
