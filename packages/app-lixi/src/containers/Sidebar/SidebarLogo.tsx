import Link from "next/link";

type SidebarLogoProps = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function
};

const SidebarLogo = ({
  sidebarCollapsed,
  setSidebarCollapsed
}: SidebarLogoProps) => {
  return (
    <div className="lixi-layout-sider-header">
      <Link href='/' >
        <a className='lixi-site-logo'>
          <img alt="sidebar-logo" src='/images/lixilotus-logo.png' />
        </a>
      </Link>
    </div>
  );
}

export default SidebarLogo;
