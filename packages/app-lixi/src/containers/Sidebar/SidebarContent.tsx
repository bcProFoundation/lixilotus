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
  BarcodeOutlined
} from '@ant-design/icons';
import { CointainerAccess, ItemAccess, ItemAccessBarcode } from './SideBarShortcut';
import { useRouter } from 'next/router';
import { openModal } from '@store/modal/actions';
import { getSelectedAccount } from '@store/account/selectors';
import ScanBarcode from '@bcpros/lixi-components/components/Common/ScanBarcode';
import axiosClient from '@utils/axiosClient';
import { message } from 'antd';
import intl from 'react-intl-universal';

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
          <ItemAccess icon={HomeOutlined} text={'Home'} active={selectedKey === '/'} key="home" href={'/'} />
          <ItemAccess
            icon={WalletOutlined}
            text={'Accounts'}
            active={selectedKey === '/wallet'}
            key="wallet-lotus"
            href={'/wallet'}
          />
          <ItemAccess
            icon={GiftOutlined}
            text={'Lixi'}
            active={selectedKey === '/admin/lixies'}
            key="lixi"
            href={'/admin/lixies'}
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
            text={intl.get('account.createLixi')}
            active={false}
            key="create-lixi"
            onClickItem={() => {
              dispatch(openModal('CreateLixiFormModal', { account: selectedAccount }));
            }}
            href={'/admin/create'}
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
            key="lotusia-shop"
            href={'https://lotusia.shop/'}
          />
          <ItemAccessBarcode
            icon={BarcodeOutlined}
            key="scan-barcode"
            active={false}
            component={<ScanBarcode loadWithCameraOpen={false} onScan={onScan} id={Date.now().toString()} />}
          />
        </StyledCointainerAccess>
      </div>
    </>
  );
};

export default SidebarContent;
