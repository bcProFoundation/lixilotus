import Link from 'next/link';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import { NavButton } from '../NavButton';
import { useRouter } from 'next/router';

const StyledFooter = styled.div`
  border-top: 1px solid ${props => props.theme.wallet.borders.color};
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0;
  background: ${props => props.theme.footer.background};
  justify-content: space-around;
  display: none;
  @media (max-width: 968px) {
    display: flex;
  }
`;

const Footer: React.FC = () => {
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
            {intl.get('general.home')}
          </NavButton>
        </Link>
        <Link href="/page/feed" passHref>
          <NavButton active={currentPathName.includes('/page')}>
            <img
              className="ico-img"
              src={currentPathName.includes('/page') ? '/images/ico-page-active.svg' : '/images/ico-page.svg'}
              alt=""
            />
            {intl.get('general.page')}
          </NavButton>
        </Link>
        <Link href="/token/listing" passHref>
          <NavButton active={currentPathName.includes('/token')}>
            <img
              className="ico-img"
              src={currentPathName.includes('/token') ? '/images/ico-tokens-active.svg' : '/images/ico-tokens.svg'}
              alt=""
            />
            {intl.get('general.tokens')}
          </NavButton>
        </Link>
        <Link href="/settings" passHref>
          <NavButton active={currentPathName == '/settings'}>
            <img className="ico-img" src="/images/ico-setting.svg" alt="" />
            {intl.get('general.settings')}
          </NavButton>
        </Link>
      </StyledFooter>
    </>
  );
};

export default Footer;
