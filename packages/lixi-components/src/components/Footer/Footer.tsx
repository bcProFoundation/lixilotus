import Link from 'next/link';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import { NavButton } from '../NavButton';
import { useRouter } from 'next/router';
import { Badge } from 'antd';
import { useEffect } from 'react';
import _ from 'lodash';

const StyledFooter = styled.div`
  position: fixed;
  z-index: 9;
  bottom: -1px;
  width: 100%;
  padding: 0;
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  justify-content: space-around;
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
  const currentPathName = router.pathname ?? '';

  return (
    <>
      <StyledFooter className={`footer-component ${classList}`}>
        <Link href="/" passHref>
          <NavButton active={currentPathName == '/'}>
            <img
              className="ico-img"
              src={currentPathName == '/' ? '/images/ico-home-active.svg' : '/images/ico-home.svg'}
              alt=""
            />
          </NavButton>
        </Link>
        <Link href="/page-message" passHref>
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
        {/* <Link href="/token/listing" passHref>
          <NavButton active={currentPathName.includes('/token/listing')}>
            <img
              className="ico-img"
              src={
                currentPathName.includes('/token/listing') ? '/images/ico-tokens-active.svg' : '/images/ico-tokens.svg'
              }
              alt=""
            />
          </NavButton>
        </Link> */}
        <Link href="/notifications" passHref>
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
        </Link>
      </StyledFooter>
    </>
  );
};

export default Footer;
