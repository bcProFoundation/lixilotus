import styled from 'styled-components';
import { Collapse, CollapseProps } from 'antd';

export const StyledCollapse = styled(Collapse)`
  background: ${props => props.theme.collapses.background} !important;
  border: 1px solid ${props => props.theme.collapses.border} !important;

  .ant-collapse-content {
    border: 1px solid ${props => props.theme.collapses.border};
    border-top: none;
  }

  .ant-collapse-item {
    border-bottom: none !important;
  }

  *:not(button) {
    color: ${props => props.theme.collapses.color} !important;
  }
`;

type VaultCollapseProps = {
} & React.HTMLProps<HTMLElement> & CollapseProps

export const VaultCollapse = styled(Collapse) <VaultCollapseProps>`
    ${({ disabled = false, ...props }) =>
    disabled === true
      ? `
          background: ${props.theme.buttons.secondary.background} !important;
        .ant-collapse-header {
          font-size: 18px;
          font-weight: bold;
          color: ${props.theme.buttons.secondary.color} !important;
          svg {
            color: ${props.theme.buttons.secondary.color} !important;
          }
        }
        .ant-collapse-arrow {
          font-size: 18px;
        }
        `
      : `
          background: ${props.theme.primary} !important;
        .ant-collapse-header {
          font-size: 18px;
          font-weight: bold;
          color: ${props.theme.contrast} !important;
          svg {
            color: ${props.theme.contrast} !important;
          }
        }
        .ant-collapse-arrow {
          font-size: 18px;
        }
        .ant-input-group-addon:first-child {
          width: 70px;
        }
          `}
`;

export const AdvancedCollapse = styled(Collapse)`
  background: ${props => props.theme.collapses.background} !important;
  border: 1px solid ${props => props.theme.collapses.border} !important;

  .ant-collapse-content {
    border: 1px solid ${props => props.theme.collapses.border};
    border-top: none;
  }

  .ant-collapse-item {
    border-bottom: none !important;
  }

  .ant-collapse-header {
    font-weight: normal;
    color: ${props => props.theme.buttons.secondary.color} !important;
  }

  *:not(button) {
    color: ${props => props.theme.collapses.color} !important;
  }
`;