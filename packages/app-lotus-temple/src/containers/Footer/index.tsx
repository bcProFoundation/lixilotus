import Link from 'next/link';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import { NavButton } from '@components/Common/NavButton';
import { useRouter } from 'next/router';
import { Badge } from 'antd';
import { useEffect } from 'react';
import _ from 'lodash';

const StyledFooter = styled.div`
  border-top: 1px solid ${props => props.theme.wallet.borders.color};
  position: fixed;
  bottom: 0;
  width: 100%;
  margin-top: 20px;
  padding: 0;
  background: ${props => props.theme.footer.background};
  justify-content: space-around;
  display: none;
  z-index: 9999;
  @media (max-width: 968px) {
    display: flex;
    left: 0;
  }
`;

const Footer = ({ notifications }: { notifications?: any }) => {
  const router = useRouter();
  const currentPathName = router.pathname ?? '';

  return (
    <>
      <StyledFooter>
        <Link href="/" passHref>
          <NavButton active={currentPathName == '/'}>
            <picture>
              <img
                className="ico-img"
                src={currentPathName == '/' ? '/images/ico-home-active.svg' : '/images/ico-home.svg'}
                alt=""
              />
            </picture>

            {intl.get('general.home')}
          </NavButton>
        </Link>
        <Link href="/wallet" passHref>
          <NavButton active={currentPathName.includes('/wallet')}>
            <picture>
              <img
                className="ico-img"
                src={currentPathName.includes('/wallet') ? '/images/ico-account-active.svg' : '/images/ico-account.svg'}
                alt=""
              />
            </picture>
            {intl.get('general.accounts')}
          </NavButton>
        </Link>
        <Link href="/settings" passHref>
          <NavButton active={currentPathName.includes('/token/listing')}>
            <picture>
              <img
                className="ico-img"
                src={currentPathName.includes('/settings') ? '/images/ico-tokens-active.svg' : '/images/ico-tokens.svg'}
                alt=""
              />
            </picture>
            {intl.get('general.settings')}
          </NavButton>
        </Link>
        <Link href="/notifications" passHref>
          <NavButton active={currentPathName == '/notifications'}>
            <Badge
              count={notifications.filter(item => _.isNil(item.readAt)).length}
              overflowCount={9}
              offset={[notifications?.length < 10 ? 0 : 5, 8]}
              color="var(--color-primary)"
            >
              <picture>
                {' '}
                <img
                  className="ico-img"
                  src={
                    currentPathName == '/notifications'
                      ? '/images/ico-notifications-active.svg'
                      : '/images/ico-notifications.svg'
                  }
                  alt=""
                />
              </picture>
            </Badge>
            {intl.get('general.notifications')}
          </NavButton>
        </Link>
      </StyledFooter>
    </>
  );
};

export default Footer;
