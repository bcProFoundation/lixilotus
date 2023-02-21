import React, { useState } from 'react';
import { Drawer } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import { getNavCollapsed } from '@store/settings/selectors';
import SidebarContent from './SidebarContent';

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
      <SidebarContent sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
    </Drawer>
  );
};

export default Sidebar;
