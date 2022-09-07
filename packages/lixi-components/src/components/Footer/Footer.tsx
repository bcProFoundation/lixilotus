import styled, { DefaultTheme } from 'styled-components';

const Footer = styled.div`
  z-index: 2;
  background-color: ${props => props.theme.footer.background};
  border-radius: 20px;
  position: fixed;
  bottom: 0;
  width: 500px;
  @media (max-width: 768px) {
    width: 100%;
  }
  @media (min-width: 768px) {
    top: 0;
    bottom: auto;
    border: 0;
    position: absolute;
    transform: translate(0, 20%);
    z-index: 999;
    position: fixed;
  }
  border-top: 1px solid ${props => props.theme.wallet.borders.color};
`;

export default Footer;
