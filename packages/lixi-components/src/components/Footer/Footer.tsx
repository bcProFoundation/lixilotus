import Link from 'next/link';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import { NavButton } from '../NavButton';
import { useRouter } from 'next/router';
import { Badge } from 'antd';
import { useEffect } from 'react';
import _ from 'lodash';

const StyledFooter = styled.div`
  border-top: 1px solid ${props => props.theme.wallet.borders.color};
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 0;
  background: ${props => props.theme.footer.background};
  justify-content: space-around;
  display: none;
  z-index: 9999;
  max-height: 60px;
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
            <img
              className="ico-img"
              src={currentPathName == '/' ? '/images/ico-home-active.svg' : '/images/ico-home.svg'}
              alt=""
            />
          </NavButton>
        </Link>
        <Link href="/page/feed" passHref>
          <NavButton active={currentPathName.includes('/page/feed')}>
            <img
              className="ico-img"
              src={currentPathName.includes('/page/feed') ? '/images/ico-page-active.svg' : '/images/ico-page.svg'}
              alt=""
            />
          </NavButton>
        </Link>
        <Link href="/token/listing" passHref>
          <NavButton active={currentPathName.includes('/token/listing')}>
            <img
              className="ico-img"
              src={
                currentPathName.includes('/token/listing') ? '/images/ico-tokens-active.svg' : '/images/ico-tokens.svg'
              }
              alt=""
            />
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
        </Link>
      </StyledFooter>
    </>
  );
};

export default Footer;
