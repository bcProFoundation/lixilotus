import styled from 'styled-components';

export const GeneralSettingsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4em 0;
  .title {
    color: ${props => props.theme.generalSettings.item.title};
  }
  .anticon {
    color: ${props => props.theme.generalSettings.item.icon};
    svg {
      width: 18px;
      height: 18px;
    }
  }
  .ant-switch {
    background-color: ${props => props.theme.generalSettings.item.icon};
    .anticon {
      color: ${props => props.theme.generalSettings.background};
    }
  }
  .ant-switch-checked {
    background-color: ${props => props.theme.primary};
  }
`;
