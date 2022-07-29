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

  .ant-collapse-header {
    justify-content: center !important;
    align-items: center !important;
  }

  *:not(button) {
    color: ${props => props.theme.collapses.color} !important;
  }
`;

type LixiCollapseProps = {} & React.HTMLProps<HTMLElement> & CollapseProps;

export const LixiCollapse = styled(Collapse)<LixiCollapseProps>`
  ${({ disabled = false, ...props }) =>
    disabled === true
      ? `
        background: ${props.theme.buttons.secondary.background} !important;
        .ant-collapse-header {
          font-size: 18px;
          font-weight: bold;
          justify-content: center !important;
          align-items: center !important;
          color: ${props.theme.buttons.secondary.color} !important;
          svg {
            color: ${props.theme.buttons.secondary.color} !important;
          }
        }
        .ant-collapse-arrow {
          font-size: 18px;
        }
        .ant-select-single.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector .ant-select-selection-item {
          line-height: 60px;
          text-align: left;
          padding-left: 10px;
        }
        `
      : `
        background: ${props.theme.primary} !important;
        .ant-collapse-header {
          font-size: 18px;
          font-weight: bold;
          justify-content: center !important;
          align-items: center !important;
          color: ${props.theme.contrast} !important;
          svg {
            color: ${props.theme.contrast} !important;
          }
        }
        .ant-collapse-arrow {
          font-size: 18px;
        }
        .ant-input-group-addon:first-child {
          width: 90px;
        }
        .ant-select-single.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector .ant-select-selection-item {
          line-height: 60px;
          text-align: left;
          padding-left: 10px;
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
    justify-content: center !important;
    align-items: center !important;
    color: ${props => props.theme.buttons.secondary.color} !important;
  }

  .ant-select-single.ant-select-sm:not(.ant-select-customize-input) .ant-select-selector .ant-select-selection-item {
    line-height: 60px;
    text-align: left;
    padding-left: 10px;
  }
  .ant-checkbox-inner {
    background-color: #fbfcfd;
  }

  *:not(button) {
    color: ${props => props.theme.collapses.color} !important;
  }
`;
