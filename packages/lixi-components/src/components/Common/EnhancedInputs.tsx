import * as React from 'react';
import intl from 'react-intl-universal';
import { Form, FormItemProps, Input, InputProps, Select } from 'antd';
import {
  ThemedDollarOutlined,
  ThemedWalletOutlined,
} from './CustomIcons';
import styled, { css } from 'styled-components';
import ScanQRCode from './ScanQRCode';
// import useBCH from '@hooks/useBCH';
import { currency } from './Ticker';
import { LockOutlined } from '@ant-design/icons';
import UploadQRCode from './UploadQRCode';

export const AntdFormCss = css`
  .ant-input-group-addon {
    background-color: ${props => props.theme.forms.addonBackground} !important;
    border: 1px solid ${props => props.theme.forms.border};
    color: ${props => props.theme.forms.addonForeground} !important;
    width: 99px;
  }
  input.ant-input,
  textarea.ant-input,
  .ant-select-selection,
  .ant-select-item-option-active
  .ant-select-item {
      background-color: ${props =>
  props.theme.forms.selectionBackground} !important;
    box-shadow: none !important;
    border-radius: 4px;
    font-weight: bold;
    color: ${props => props.theme.forms.text};
    opacity: 1;
    height: 50px;
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
  .ant-form-item-has-error
    > div
    > div.ant-form-item-control-input
    > div
    > span
    > span
    > span.ant-input-affix-wrapper {
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

  .ant-form-item-has-error
    .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input)
    .ant-select-selector {
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

type InputAddonTextProps = {
} & React.HTMLProps<HTMLSpanElement> & React.HTMLAttributes<HTMLElement>

export const InputAddonText = styled.span<InputAddonTextProps>`
  width: 100%;
  height: 100%;
  display: block;

  ${props =>
  props.disabled
    ? `
    cursor: not-allowed;
    `
    : `cursor: pointer;`}
`;

type InputNumberAddonTextProps = {
} & React.HTMLProps<HTMLElement> & React.HTMLAttributes<HTMLElement>;

export const InputNumberAddonText = styled.span<InputNumberAddonTextProps>`
  background-color: ${props => props.theme.forms.addonBackground} !important;
  border: 1px solid ${props => props.theme.forms.border};
  color: ${props => props.theme.forms.addonForeground} !important;
  height: 50px;
  line-height: 47px;

  * {
      color: ${props => props.theme.forms.addonForeground} !important;
  }
  ${props =>
  props.disabled
    ? `
    cursor: not-allowed;
    `
    : `cursor: pointer;`}
`;

export const StyledScanQRCode = styled(ScanQRCode)`
  width: 50%;
  font-size: 20px;
  display: inline-flex;
  border-right: 1px solid rgb(207, 199, 192);
  height: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  align-items: center;
  justify-content: center;
`;

type SendXpiInputProps = {
  onMax: Function;
  inputProps: any;
  selectProps: Object;
  activeFiatCode: string;
  validateStatus: string;
  help: string;
} & InputProps

export const SendXpiInput = ({
  onMax,
  inputProps,
  selectProps,
  activeFiatCode,
  ...otherProps
}: SendXpiInputProps) => {
  const { Option } = Select;
  const currencies = [
    {
      value: currency.ticker,
      label: currency.ticker,
    }
  ];
  const currencyOptions = currencies.map(currency => {
    return (
      <Option
        key={currency.value}
        value={currency.value}
        className="selectedCurrencyOption"
      >
        {currency.label}
      </Option>
    );
  });

  const CurrencySelect = (
    <Select
      defaultValue={currency.ticker}
      className="select-after"
      style={{ width: '25%' }}
      {...selectProps}
    >
      {currencyOptions}
    </Select>
  );
  return (
    <AntdFormWrapper>
      <Form.Item {...otherProps}>
        <Input.Group compact>
          <Input
            style={{ width: '58%', textAlign: 'left' }}
            type="number"
            step={
              inputProps.dollar === 1
                ? 0.01
                : 1 / 10 ** currency.cashDecimals
            }
            prefix={
              inputProps.dollar === 1 ? (
                <ThemedDollarOutlined />
              ) : (
                <img
                  src={currency.logo}
                  alt=""
                  width={16}
                  height={16}
                />
              )
            }
            {...inputProps}
          />
          {CurrencySelect}
          <InputNumberAddonText
            style={{
              width: '17%',
              height: '60px',
              lineHeight: '60px',
            }}
            disabled={!!(inputProps || {}).disabled}
            onClick={() => onMax()}
          >
            max
          </InputNumberAddonText>
        </Input.Group>
      </Form.Item>
    </AntdFormWrapper>
  );
};



type FormItemWithMaxAddonProps = {
  onMax: Function,
  inputProps: {
    disabled?: boolean | undefined
  },
}

export const FormItemWithMaxAddon = ({ onMax, inputProps, ...otherProps }: FormItemWithMaxAddonProps) => {
  return (
    <AntdFormWrapper>
      <Form.Item {...otherProps}>
        <Input
          type="number"
          prefix={
            <img
              src={currency.logo}
              alt=""
              width={16}
              height={16}
            />
          }
          addonAfter={
            <InputAddonText
              disabled={!!(inputProps || {}).disabled}
              onClick={!(inputProps || {}).disabled && onMax()}
            >
              max
            </InputAddonText>
          }
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
};


type FormItemWithQRCodeAddonProps = {
  onScan: Function;
  loadWithCameraOpen: boolean;
  inputProps: InputProps;
  style?: React.CSSProperties;
} & FormItemProps;

// loadWithCameraOpen prop: if true, load page with camera scanning open
export const FormItemWithQRCodeAddon = (props: FormItemWithQRCodeAddonProps) => {
  const { onScan, loadWithCameraOpen, inputProps, ...otherProps } = props
  return (
    <AntdFormWrapper>
      <Form.Item {...otherProps}>
        <Input
          prefix={<ThemedWalletOutlined />}
          autoComplete="off"
          addonAfter={
            <>
              <StyledScanQRCode
                loadWithCameraOpen={loadWithCameraOpen}
                onScan={onScan}
                id={Date.now().toString()}
              />
              <UploadQRCode
                onScan={onScan}
                codeType='address'
              />
            </>
          }
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
};

type FormItemClaimCodeXpiInputProps = {
  onScan: Function;
  loadWithCameraOpen: boolean;
  inputProps: InputProps;
} & FormItemProps;

export const FormItemClaimCodeXpiInput = (props: FormItemClaimCodeXpiInputProps) => {

  const { onScan, loadWithCameraOpen, inputProps, ...otherProps } = props;
  return (
    <AntdFormWrapper {...otherProps}>
      <Form.Item {...otherProps}>
        <Input
          prefix={<LockOutlined />}
          placeholder={intl.get('claim.claimCode')}
          name="claimCode"
          autoComplete="off"
          addonAfter={
            <>
              <StyledScanQRCode
                loadWithCameraOpen={loadWithCameraOpen}
                onScan={onScan}
                id={Date.now().toString()}
              />
              <UploadQRCode
                onScan={onScan}
                codeType='claimCode'
              />
            </>
          }
          required
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
}
