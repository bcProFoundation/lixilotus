import styled, { DefaultTheme } from 'styled-components';

type INavButtonProps = {
  active?: boolean;
  theme?: DefaultTheme;
}

export const NavButton: React.FC<INavButtonProps> = styled.button<INavButtonProps>`
    :focus,
    :active {
      outline: none;
    }
    cursor: pointer;
    padding: 24px 12px 12px 12px;
    margin: 0 28px;
    @media (max-width: 475px) {
      margin: 0 20px;
    }
    @media (max-width: 420px) {
      margin: 0 12px;
    }
    @media (max-width: 350px) {
      margin: 0 8px;
    }
    background-color: ${props => props.theme.footer.background};
    border: none;
    font-size: 12px;
    font-weight: bold;
    .anticon {
      display: block;
      color: ${props => props.theme.footer.navIconInactive};
      font-size: 24px;
      margin-bottom: 6px;
    }
    ${({ active, ...props }) =>
    active &&
    `    
        color: ${props.theme.primary};
        .anticon {
            color: ${props.theme.primary};
        }
  `}
`;