import styled from 'styled-components';
import SidebarLogo from './SidebarLogo';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import {
  EditOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  SendOutlined,
  SettingOutlined,
  ShopOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { CointainerAccess, ItemAccess } from './SideBarShortcut';
import { useRouter } from 'next/router';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function;
};

const StyledCointainerAccess = styled(CointainerAccess)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SidebarContent = ({ className, sidebarCollapsed, setSidebarCollapsed }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const router = useRouter();
  const selectedKey = router.pathname ?? '';

  const handleOnClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  return (
    <>
      <SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <div className="lixi-sidebar-content">
        <StyledCointainerAccess className={className} onClick={handleOnClick}>
          <ItemAccess icon={HomeOutlined} text={'Home'} active={selectedKey === '/'} key="send-lotus" href={'/'} />
          <ItemAccess
            icon={WalletOutlined}
            text={'Accounts'}
            active={selectedKey === '/wallet'}
            key="wallet-lotus"
            href={'/wallet'}
          />
          <ItemAccess icon={SendOutlined} text={'Send'} active={selectedKey === '/send'} key="send" href={'/send'} />
          <ItemAccess
            icon={EditOutlined}
            text={'Register Pack'}
            active={selectedKey === '/admin/pack-register'}
            key="register-pack"
            href={'/admin/pack-register'}
          />
          <ItemAccess
            icon={PlusCircleOutlined}
            text={'Create Page'}
            active={selectedKey === '/page/create'}
            key="create-page"
            href={'/page/create'}
          />
          <ItemAccess
            icon={SettingOutlined}
            text={'Setting'}
            active={selectedKey === '/admin/settings'}
            key="setting"
            href={'/admin/settings'}
          />
          <ItemAccess
            icon={SendOutlined}
            text={'Send Lotus'}
            active={false}
            key="send-lotus"
            href={'https://sendlotus.com'}
          />
          <ItemAccess
            icon={ShopOutlined}
            text={'Lotusia Shop'}
            active={false}
            key="send-lotus"
            href={'https://lotusia.shop/'}
          />
        </StyledCointainerAccess>
      </div>
    </>
  );
};

export default SidebarContent;
