import styled, { DefaultTheme } from 'styled-components';

export const Footer = styled.div`
  z-index: 2;
  background-color: ${props => props.theme.footer.background};
  border-radius: 20px;
  position: fixed;
  bottom: 0;
  width: 500px;
  @media (max-width: 768px) {
      width: 100%;
  }
  border-top: 1px solid ${props => props.theme.wallet.borders.color};
`;