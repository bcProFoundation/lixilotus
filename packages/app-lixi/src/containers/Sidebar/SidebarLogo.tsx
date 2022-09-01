import Link from 'next/link';

type SidebarLogoProps = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function;
};

const SidebarLogo = ({ sidebarCollapsed, setSidebarCollapsed }: SidebarLogoProps) => {
  return (
    <div className="lixi-layout-sider-header">
      <Link href="/">
        <a className="lixi-site-logo">
          <img width="120px" alt="sidebar-logo" src="/images/lixilotus-logo.svg" />
        </a>
      </Link>
    </div>
  );
};

export default SidebarLogo;
