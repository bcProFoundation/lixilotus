import * as React from 'react';
import { Select } from 'antd';
import styled, { css } from 'styled-components';
import intl from 'react-intl-universal';
import AppLocale from '../../lang';
import _ from 'lodash';

export const AntdFormCss = css`
  .ant-input-group-addon {
    background-color: ${props => props.theme.forms.addonBackground} !important;
    border: 1px solid ${props => props.theme.forms.border};
    color: ${props => props.theme.forms.addonForeground} !important;
  }
  input.ant-input,
  textarea.ant-input,
  .ant-select-selection,
  .ant-select-item-option-active,
  .ant-select-item {
    margin: 3px;
  }
  .ant-input-affix-wrapper {
    background-color: ${props => props.theme.forms.selectionBackground};
    border: 1px solid ${props => props.theme.wallet.borders.color} !important;
  }
  .ant-select-selector {
    height: 60px !important;
    border: 1px solid ${props => props.theme.wallet.borders.color} !important;
    align-items: center;
  }
  .ant-form-item-has-error > div > div.ant-form-item-control-input > div > span > span > span.ant-input-affix-wrapper {
    background-color: ${props => props.theme.forms.selectionBackground};
    border-color: ${props => props.theme.forms.error} !important;
  }

  .ant-form-item-has-error .ant-input,
  .ant-form-item-has-error .ant-input-affix-wrapper,
  .ant-form-item-has-error .ant-input:hover,
  .ant-form-item-has-error .ant-input-affix-wrapper:hover {
    background-color: ${props => props.theme.forms.selectionBackground};
    border-color: ${props => props.theme.forms.error} !important;
  }

  .ant-form-item-has-error .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
    background-color: ${props => props.theme.forms.selectionBackground};
    border-color: ${props => props.theme.forms.error} !important;
  }
  .ant-select-single .ant-select-selector .ant-select-selection-item,
  .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
    line-height: 60px;
    text-align: left;
    color: ${props => props.theme.forms.text};
    font-weight: bold;
  }
  .ant-form-item-has-error .ant-input-group-addon {
    color: ${props => props.theme.forms.error} !important;
    border-color: ${props => props.theme.forms.error} !important;
  }
  .ant-form-item-explain.ant-form-item-explain-error {
    color: ${props => props.theme.forms.error} !important;
  }
`;

export const AntdFormWrapper = styled.div`
  ${AntdFormCss}
`;

export const LanguageSelectDropdown = selectProps => {
  const { Option } = Select;

  // Build select dropdown from currency.languages
  const languageMenuOptions: LanguageMenuOption[] = [];

  for (var key in AppLocale) {
    const languageMenuOption: LanguageMenuOption = {
      value: key,
      label: intl.formatMessage({
        id: key
      })
    };
    languageMenuOptions.push(languageMenuOption);
  }

  const languageOptions = languageMenuOptions.map(languageMenuOption => {
    return (
      <Option key={languageMenuOption.value} value={languageMenuOption.value} className="selectedLanguageOption">
        {languageMenuOption.label}
      </Option>
    );
  });
  return (
    <Select
      className="select-after"
      style={{
        width: '100%'
      }}
      getPopupContainer={trigger => trigger.parentNode}
      {...selectProps}
    >
      {languageOptions}
    </Select>
  );
};

interface LanguageMenuOption {
  value: string;
  label: string;
}
