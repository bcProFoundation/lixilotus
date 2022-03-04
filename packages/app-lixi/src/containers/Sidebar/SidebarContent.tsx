import { ShopOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import Link from "next/link";
import SidebarLogo from "./SidebarLogo";

type SidebarContentProps = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function
};

const SidebarContent = ({
  sidebarCollapsed,
  setSidebarCollapsed
}: SidebarContentProps) => {

  return (
    <>
      <SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <div className='lixi-sidebar-content'>
        <Menu
          // defaultOpenKeys={[defaultOpenKeys]}
          // selectedKeys={[selectedKeys]}
          mode="inline">
          <Menu.Item key='main/market'>
            <Link href='/'>
              <a>
                <ShopOutlined />
                <span>Market</span>
              </a>
            </Link>
          </Menu.Item>
        </Menu>
      </div>
    </>
  );
}

export default SidebarContent;
