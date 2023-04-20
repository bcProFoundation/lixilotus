import React, { useState } from 'react';
import { Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getNavCollapsed } from '@store/settings/selectors';
import SidebarShortcut from './SideBarShortcut';
import styled from 'styled-components';

export type SidebarProps = {
  className?: string;
};

const StyledDrawer = styled(Drawer)`
  width: 320px !important;

  .ant-drawer-body {
    padding: 0px !important;
  }

  @media (max-width: 600px) {
    width: 100vw !important;
  }
`;

const Sidebar = ({ className }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);

  const onToggleCollapsedNav = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  return (
    <StyledDrawer
      style={{ position: 'absolute' }}
      className={`${className} lixi-drawer-sidebar`}
      placement="right"
      closable={false}
      onClose={onToggleCollapsedNav}
      getContainer={false}
      open={!navCollapsed}
    >
      <SidebarShortcut sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
    </StyledDrawer>
  );
};

export default Sidebar;
