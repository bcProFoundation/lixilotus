import { Menu } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import SidebarLogo from './SidebarLogo';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';

type SidebarContentProps = {
  className?: string,
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function
};

const MenuCustom = styled(Menu)`
  border-right: none !important;

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

const dispatch = useAppDispatch();
const navCollapsed = useAppSelector(getNavCollapsed);

const handleOnClick = () => {
  dispatch(toggleCollapsedSideNav(!navCollapsed));
};

  return (
    <>
      <SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <div className='lixi-sidebar-content'>
        <MenuCustom className={className}
          // defaultOpenKeys={[defaultOpenKeys]}
          // selectedKeys={[selectedKeys]}
          mode="inline">
          {/* <Menu.Item key='main/mobile-card'>
            <Link href='/mobile-card' passHref>
              <a>
                <ShopOutlined />
                <span>Mobile Card</span>
              </a>
            </Link>
          </Menu.Item> */}
          <Menu.Item key='main/mobile-card'>
            <Link href='https://sendlotus.com' >
              <a target="_blank">
                <img src='/images/lotus-logo-small.png' alt='lotus'
                  style={{width: "20px", marginBottom: "5px", marginRight: "10px"}}
                />
                <span>Send Lotus</span>
              </a>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href='/admin/pack-register' >
              <a onClick={handleOnClick}>
                <img src='/images/lotus-logo-small.png' alt='lotus'
                  style={{width: "20px", marginBottom: "5px", marginRight: "10px"}}
                />
                <span>{intl.get('general.registerPack')}</span>
              </a>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href='/wallet'>
              <a onClick={handleOnClick}>
                <img src='/images/lotus-logo-small.png' alt='lotus'
                  style={{width: "20px", marginBottom: "5px", marginRight: "10px"}}
                />
                <span>Wallet</span>
              </a>
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href='/send' >
              <a onClick={handleOnClick}>
                <img src='/images/lotus-logo-small.png' alt='lotus'
                  style={{width: "20px", marginBottom: "5px", marginRight: "10px"}}
                />
                <span>Send</span>
              </a>
            </Link>
          </Menu.Item>
        </MenuCustom>
      </div>
    </>
  );
}

export default SidebarContent;
