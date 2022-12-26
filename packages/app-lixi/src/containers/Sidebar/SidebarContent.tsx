import styled from 'styled-components';
import SidebarLogo from './SidebarLogo';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getNavCollapsed } from '@store/settings/selectors';
import { toggleCollapsedSideNav } from '@store/settings/actions';
import {
  EditOutlined,
  GiftOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  SendOutlined,
  SettingOutlined,
  ShopOutlined,
  WalletOutlined,
  BarcodeOutlined,
  TagOutlined
} from '@ant-design/icons';
import { CointainerAccess, ItemAccess, ItemAccessBarcode } from './SideBarShortcut';
import { useRouter } from 'next/router';
import { openModal } from '@store/modal/actions';
import { getSelectedAccount } from '@store/account/selectors';
import ScanBarcode from '@bcpros/lixi-components/components/Common/ScanBarcode';
import axiosClient from '@utils/axiosClient';
import { Button, message, Space } from 'antd';
import intl from 'react-intl-universal';
import { CreateLixiFormModal } from '@components/Lixi/CreateLixiFormModal';

type SidebarContentProps = {
  className?: string;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Function;
};

const StyledCointainerAccess = styled(CointainerAccess)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SidebarContent = ({ className, sidebarCollapsed, setSidebarCollapsed }: SidebarContentProps) => {
  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);
  const router = useRouter();
  const selectedKey = router.pathname ?? '';
  const selectedAccount = useAppSelector(getSelectedAccount);
  let pastScan;

  const handleOnClick = () => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  };

  const onScan = async (result: string) => {
    if (pastScan !== result) {
      pastScan = result;

      await axiosClient
        .post('api/lixies/check-valid', { lixiBarcode: result })
        .then(res => {
          message.success(res.data);
        })
        .catch(err => {
          const { response } = err;
          message.error(response.data ? response.data.message : intl.get('lixi.unableGetLixi'));
        });
    }
  };

  return (
    <>
      <SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
      <div className="lixi-sidebar-content">
        <StyledCointainerAccess className={className} onClick={handleOnClick}>
          <ItemAccess
            icon={'/images/ico-home.svg'}
            text={intl.get('general.home')}
            active={selectedKey === '/'}
            key="home"
            href={'/'}
          />
          <ItemAccess
            icon={'/images/ico-page.svg'}
            text={intl.get('general.page')}
            active={selectedKey.includes('/page')}
            key="page-feed"
            href={'/page/feed'}
          />
          <ItemAccess
            icon={'/images/ico-tokens.svg'}
            text={intl.get('general.tokens')}
            active={selectedKey.includes('/token')}
            key="tokens-feed"
            href={'/token/listing'}
          />
          <ItemAccess
            icon={'/images/ico-account.svg'}
            text={intl.get('general.accounts')}
            active={selectedKey === '/wallet'}
            key="wallet-lotus"
            href={'/wallet'}
          />
          <ItemAccess
            icon={'/images/ico-lixi.svg'}
            text={intl.get('general.lixi')}
            active={selectedKey === '/lixi'}
            key="lixi"
            href={'/lixi'}
          />
          <ItemAccess
            icon={'/images/ico-setting.svg'}
            text={intl.get('general.settings')}
            active={selectedKey === '/settings'}
            key="settings"
            href={'/settings'}
          />
        </StyledCointainerAccess>
      </div>
    </>
  );
};

export default SidebarContent;
