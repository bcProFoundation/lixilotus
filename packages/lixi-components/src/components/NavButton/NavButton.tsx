import styled, { DefaultTheme } from 'styled-components';

type INavButtonProps = React.PropsWithChildren<{
  active?: boolean;
  theme?: DefaultTheme;
  onClick?: Function;
}>;

export const NavButton: React.FC<INavButtonProps> = styled.button<INavButtonProps>`
  :focus,
  :active {
    outline: none;
  }
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
