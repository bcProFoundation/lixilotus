import { Menu } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { ShopOutlined } from '@ant-design/icons';
import SidebarLogo from './SidebarLogo';

type SidebarContentProps = {
  className?: string,
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function
};

const MenuCustom = styled(Menu)`
  .ant-menu-title-content {
    font-size: 24px
  }

  .anticon {
    font-size: 28px
  }
`;

const SidebarContent = ({
  className,
  sidebarCollapsed,
  setSidebarCollapsed
}: SidebarContentProps) => {

  return (
    <>
      <SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <div className='lixi-sidebar-content'>
        <MenuCustom className={className}
          // defaultOpenKeys={[defaultOpenKeys]}
          // selectedKeys={[selectedKeys]}
          mode="inline">
          <Menu.Item key='main/mobile-card'>
            <Link href='/mobile-card' passHref>
              <a>
                <ShopOutlined />
                <span>Mobile Card</span>
              </a>
            </Link>
          </Menu.Item>
        </MenuCustom>
      </div>
    </>
  );
}

export default SidebarContent;
