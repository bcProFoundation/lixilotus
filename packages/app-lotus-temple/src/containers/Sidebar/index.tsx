import React, { useState } from 'react';
import { Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getNavCollapsed } from '@store/settings/selectors';
import SidebarShortcut from './SidebarShortcut';

export type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navCollapsed = useAppSelector(getNavCollapsed);

  const onToggleCollapsedNav = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  return (
    <Drawer
      style={{ position: 'absolute' }}
      className={`${className} lixi-drawer-sidebar`}
      placement="left"
      closable={false}
      onClose={onToggleCollapsedNav}
      getContainer={false}
      open={!navCollapsed}
    >
      <SidebarShortcut sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
    </Drawer>
  );
};

export default Sidebar;
