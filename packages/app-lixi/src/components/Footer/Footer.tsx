import styled from 'styled-components';
import intl from 'react-intl-universal';
import { useRouter } from 'next/router';
import { Badge, Popover } from 'antd';
import { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { PopoverStyled } from '@containers/Topbar';
import { ItemAccess } from '@containers/Sidebar/SideBarShortcut';
import { getCurrentThemes } from '@store/settings';
import useAuthorization from '@components/Common/Authorization/use-authorization.hooks';
import { AuthorizationContext } from '@context/index';
import { getModals } from '@store/modal';
import { ReactSVG } from 'react-svg';
import { openActionSheet } from '@store/action-sheet/actions';
import { DefaultTheme } from 'styled-components';
import { push } from 'connected-next-router';

type INavButtonProps = React.PropsWithChildren<{
  active?: boolean;
  theme?: DefaultTheme;
  onClick?: Function;
}>;

const NavButton: React.FC<INavButtonProps> = styled.button<INavButtonProps>`
  :focus,
  :active {
    outline: none;
  }
  min-width: 62px;
  max-width: 62px;
  cursor: pointer;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.footer.color};
  background: transparent !important;
  border: none;
  font-size: 12px;
  font-weight: bold;
  line-height: 16px;
  letter-spacing: 0.4px;
  .ico-img {
    width: 30px;
    height: 30px;
    &.ico-messenger {
      width: 32px;
      height: 32px;
    }
    &.ico-more {
      width: 26px;
      height: 26px;
    }
  }
  ${({ active, ...props }) =>
    active &&
    `
        color: ${props.theme.primary};
        border-top: 3px solid ${props.theme.primary};
        .ico-img {
          &:path {
            color: ${props.theme.primary};
          }
        }
  `}
`;

const StyledFooter = styled.div`
  position: fixed;
  z-index: 9;
  bottom: -1px;
  width: 100%;
  padding: 0;
  background: #fff;
  justify-content: space-around;
  align-items: center;
  display: none;
  max-height: 60px;
  .ant-badge {
    .ant-badge-count {
      margin-top: 4px !important;
      right: 0 !important;
      box-shadow: none;
    }
  }
  @media (max-width: 968px) {
    max-height: fit-content;
    display: flex;
    left: 0;
  }
  @media (max-width: 526px) {
    &.hide-footer {
      display: none;
    }
  }
`;

const Footer = ({ notifications, classList }: { notifications?: any; classList?: any }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentPathName = router.pathname ?? '';
  const currentAbsolutePathName = router.asPath ?? '';
  const [openMoreOption, setOpenMoreOption] = useState(false);
  const currentTheme = useAppSelector(getCurrentThemes);
  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();
  const currentModal = useAppSelector(getModals);

  const handleIconClick = (newPath?: string) => {
    dispatch(push(newPath));
    setOpenMoreOption(false);
  };

  const handleClickInstall = () => {
    setOpenMoreOption(false);
    dispatch(openActionSheet('InstallPwaGuide', {}));
  };

  const contentMoreAction = (
    <PopoverStyled>
      <div className="social-menu">
        <h3>Social</h3>
        <ItemAccess
          icon={'/images/ico-message-heart-circle.svg'}
          text={'Messenger'}
          active={currentPathName === '/page-message'}
          direction="horizontal"
          key="support"
          onClickItem={() => {
            if (authorization.authorized) {
              handleIconClick('/page-message');
            } else {
              askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-page.svg'}
          text={intl.get('general.page')}
          active={
            currentPathName.includes('/page') &&
            !currentAbsolutePathName.includes('page/clbm6r1v91486308n7w6za1qcu') &&
            !currentAbsolutePathName.includes('/page-message')
          }
          direction="horizontal"
          key="page-feed"
          onClickItem={() => handleIconClick('/page/feed')}
        />
        <ItemAccess
          icon={'/images/ico-notifications.svg'}
          text={intl.get('general.notifications')}
          active={currentPathName === '/notifications'}
          direction="horizontal"
          key="notifications"
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/notifications');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-support.png'}
          text={intl.get('general.support')}
          active={currentAbsolutePathName.includes('page/clbm6r1v91486308n7w6za1qcu')}
          direction="horizontal"
          key="support"
          onClickItem={() => handleIconClick('/page/clbm6r1v91486308n7w6za1qcu')}
        />
        <ItemAccess
          icon={'/images/ico-download.svg'}
          text={intl.get('general.installApp')}
          active={null}
          direction="horizontal"
          key="support"
          onClickItem={handleClickInstall}
        />
      </div>
      <div className="social-feature">
        <h3>Feature</h3>
        <ItemAccess
          icon={'/images/ico-tokens.svg'}
          text={intl.get('general.tokens')}
          active={currentPathName.includes('/token')}
          direction="horizontal"
          key="tokens-feed"
          onClickItem={() => handleIconClick('/token/listing')}
        />
        <ItemAccess
          icon={'/images/ico-account.svg'}
          text={intl.get('general.accounts')}
          active={currentPathName === '/wallet'}
          direction="horizontal"
          key="wallet-lotus"
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/wallet');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-lixi.svg'}
          text={intl.get('general.lixi')}
          active={currentPathName.includes('/lixi')}
          direction="horizontal"
          key="lixi"
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/lixi');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
        <ItemAccess
          icon={'/images/ico-setting.svg'}
          text={intl.get('general.settings')}
          active={currentPathName === '/settings'}
          direction="horizontal"
          key="settings"
          onClickItem={() => {
            if (authorization.authorized) handleIconClick('/settings');
            else {
              currentModal.length === 0 && askAuthorization();
            }
          }}
        />
      </div>
    </PopoverStyled>
  );

  return (
    <>
      <StyledFooter className={`footer-component ${classList}`}>
        <div onClick={() => router.push('/')}>
          <NavButton active={currentPathName == '/'}>
            <img
              className="ico-img"
              src={currentPathName == '/' ? '/images/ico-home-active.svg' : '/images/ico-home.svg'}
              alt=""
            />
          </NavButton>
        </div>
        <div onClick={() => router.push('/page-message')}>
          <NavButton active={currentPathName.includes('/page-message')}>
            <img
              className="ico-img ico-messenger"
              src={
                currentPathName.includes('/page-message')
                  ? '/images/ico-message-heart-circle-active.svg'
                  : '/images/ico-message-heart-circle.svg'
              }
              alt=""
            />
          </NavButton>
        </div>
        <div onClick={() => router.push('/notifications')}>
          <NavButton active={currentPathName == '/notifications'}>
            <Badge
              count={notifications.filter(item => item && _.isNil(item.readAt)).length}
              overflowCount={9}
              offset={[notifications?.length < 10 ? 0 : 5, 8]}
              color="var(--color-primary)"
            >
              <img
                className="ico-img"
                src={
                  currentPathName == '/notifications'
                    ? '/images/ico-notifications-active.svg'
                    : '/images/ico-notifications.svg'
                }
                alt=""
              />
            </Badge>
          </NavButton>
        </div>
        <Popover
          onOpenChange={visible => setOpenMoreOption(visible)}
          overlayClassName={`${currentTheme === 'dark' ? 'popover-dark' : ''} more-btn`}
          arrow={false}
          content={contentMoreAction}
          placement="bottom"
          open={openMoreOption}
        >
          <NavButton>
            <img className="ico-img ico-more" src={'/images/ico-category-footer.svg'} alt="" />
          </NavButton>
        </Popover>
      </StyledFooter>
    </>
  );
};

export default Footer;
