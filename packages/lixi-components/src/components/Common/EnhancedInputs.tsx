import * as React from 'react';
import intl from 'react-intl-universal';
import { Form, FormItemProps, Input, InputProps, Modal, Select } from 'antd';
import { ThemedDollarOutlined, ThemedQuerstionCircleOutlinedFaded, ThemedWalletOutlined } from './CustomIcons';
import styled, { css } from 'styled-components';
import ScanQRCode from './ScanQRCode';
// import useBCH from '@hooks/useBCH';
import { currency } from './Ticker';
import { HeartOutlined, LockOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import UploadQRCode from './UploadQRCode';

export const AntdFormCss = css`
  .ant-input-group-addon {
    background-color: ${props => props.theme.forms.addonBackground} !important;
    border: 1px solid ${props => props.theme.forms.border};
    color: ${props => props.theme.forms.addonForeground} !important;
    width: 100px;
  }
  input.ant-input,
  textarea.ant-input,
  .ant-select-selection,
  .ant-select-item-option-active .ant-select-item {
    background-color: ${props => props.theme.forms.selectionBackground} !important;
    box-shadow: none !important;
    border-radius: 4px;
    font-weight: bold;
    color: ${props => props.theme.forms.text};
    opacity: 1;
    padding: 8px;
  }
  .ant-input-prefix {
    margin-inline-end: 0;
  }
  .ant-input-affix-wrapper {
    padding: 8px 1rem;
    background-color: ${props => props.theme.forms.selectionBackground};
    border: 1px solid ${props => props.theme.wallet.borders.color} !important;
  }
  .ant-select-selector {
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
  }

  .ant-form-item-has-error .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
    background-color: ${props => props.theme.forms.selectionBackground};
  }
  .ant-select-single .ant-select-selector .ant-select-selection-item,
  .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
    text-align: left;
    color: ${props => props.theme.forms.text};
    font-weight: bold;
    padding-left: 10px;
  }
  .ant-form-item-has-error .ant-input-group-addon {
    color: ${props => props.theme.forms.error} !important;
    border-color: ${props => props.theme.forms.error} !important;
  }
  .ant-form-item-explain,
  .ant-form-item-explain-error {
    color: ${props => props.theme.forms.error} !important;
    text-align: left;
    font-size: 12px;
    margin-left: 8px;
  }
  .ant-input-group {
    display: flex;
  }
`;

export const AntdFormWrapper = styled.div`
  ${AntdFormCss}
`;

type InputAddonTextProps = {} & React.HTMLProps<HTMLSpanElement> & React.HTMLAttributes<HTMLElement>;

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

type InputNumberAddonTextProps = {} & React.HTMLProps<HTMLElement> & React.HTMLAttributes<HTMLElement>;

export const InputNumberAddonText = styled.span<InputNumberAddonTextProps>`
  background-color: ${props => props.theme.forms.addonBackground} !important;
  border: 1px solid ${props => props.theme.forms.border};
  color: ${props => props.theme.forms.addonForeground} !important;

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
  help: string;
} & InputProps &
  FormItemProps;

export const SendXpiInput = ({ onMax, inputProps, selectProps, activeFiatCode, ...otherProps }: SendXpiInputProps) => {
  const { Option } = Select;
  const currencies = [
    {
      value: currency.ticker,
      label: currency.ticker
    }
  ];
  const currencyOptions = currencies.map(currency => {
    return (
      <Option key={currency.value} value={currency.value} className="selectedCurrencyOption">
        {currency.label}
      </Option>
    );
  });

  const CurrencySelect = (
    <Select
      defaultValue={currency.ticker}
      className="select-after"
      style={{ width: '25%', padding: '0', border: '0' }}
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
            step={inputProps.dollar === 1 ? 0.01 : 1 / 10 ** currency.cashDecimals}
            prefix={
              inputProps.dollar === 1 ? (
                <ThemedDollarOutlined width={20} height={20} />
              ) : (
                <img src={currency.logo} alt="" width={20} height={20} />
              )
            }
            {...inputProps}
          />
          {CurrencySelect}
          <InputNumberAddonText
            className="input-number-addon"
            style={{
              width: '17%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: '0'
            }}
            disabled={!!(inputProps || {}).disabled}
            onClick={() => onMax()}
          >
            Max
          </InputNumberAddonText>
        </Input.Group>
      </Form.Item>
    </AntdFormWrapper>
  );
};

type FormItemWithMaxAddonProps = {
  onMax: Function;
  inputProps: {
    disabled?: boolean | undefined;
  };
};

export const FormItemWithMaxAddon = ({ onMax, inputProps, ...otherProps }: FormItemWithMaxAddonProps) => {
  return (
    <AntdFormWrapper>
      <Form.Item {...otherProps}>
        <Input
          type="number"
          prefix={<img src={currency.logo} alt="" width={16} height={16} />}
          addonAfter={
            <InputAddonText disabled={!!(inputProps || {}).disabled} onClick={!(inputProps || {}).disabled && onMax()}>
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
  const { onScan, loadWithCameraOpen, inputProps, ...otherProps } = props;
  return (
    <AntdFormWrapper>
      <Form.Item {...otherProps}>
        <Input
          prefix={<ThemedWalletOutlined />}
          autoComplete="off"
          addonAfter={
            <>
              <StyledScanQRCode loadWithCameraOpen={loadWithCameraOpen} onScan={onScan} id={Date.now().toString()} />
              <UploadQRCode onScan={onScan} codeType="address" />
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
              <StyledScanQRCode loadWithCameraOpen={loadWithCameraOpen} onScan={onScan} id={Date.now().toString()} />
              <UploadQRCode onScan={onScan} codeType="claimCode" />
            </>
          }
          required
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
};

type FormItemStaffAddressInputProps = {
  onScan: Function;
  loadWithCameraOpen: boolean;
  inputProps: InputProps;
} & FormItemProps;

export const FormItemStaffAddressInput = (props: FormItemStaffAddressInputProps) => {
  const { onScan, loadWithCameraOpen, inputProps, ...otherProps } = props;
  return (
    <AntdFormWrapper {...otherProps}>
      <Form.Item {...otherProps}>
        <Input
          prefix={<TeamOutlined width={20} height={20} />}
          placeholder={intl.get('lixi.staffAddress')}
          name="staffAddress"
          autoComplete="off"
          addonAfter={
            <>
              <StyledScanQRCode loadWithCameraOpen={loadWithCameraOpen} onScan={onScan} id={Date.now().toString()} />
              <UploadQRCode onScan={onScan} codeType="staffAddress" />
            </>
          }
          required
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
};

type FormItemCharityAddressInputProps = {
  onScan: Function;
  loadWithCameraOpen: boolean;
  inputProps: InputProps;
} & FormItemProps;

export const FormItemCharityAddressInput = (props: FormItemCharityAddressInputProps) => {
  const { onScan, loadWithCameraOpen, inputProps, ...otherProps } = props;
  return (
    <AntdFormWrapper {...otherProps}>
      <Form.Item {...otherProps}>
        <Input
          prefix={<HeartOutlined />}
          placeholder={intl.get('lixi.charityAddress')}
          name="charityAddress"
          autoComplete="off"
          addonAfter={
            <>
              <StyledScanQRCode loadWithCameraOpen={loadWithCameraOpen} onScan={onScan} id={Date.now().toString()} />
              <UploadQRCode onScan={onScan} codeType="charityAddress" />
            </>
          }
          required
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
};

type FormItemRegistrantAddressInputProps = {
  onScan: Function;
  loadWithCameraOpen: boolean;
  inputProps: InputProps;
} & FormItemProps;

export const FormItemRegistrantAddressInput = (props: FormItemRegistrantAddressInputProps) => {
  const { onScan, loadWithCameraOpen, inputProps, ...otherProps } = props;
  return (
    <AntdFormWrapper {...otherProps}>
      <Form.Item {...otherProps}>
        <Input
          prefix={<UserOutlined />}
          placeholder={intl.get('lixi.registrantAddress')}
          name="registrantAddress"
          autoComplete="off"
          addonAfter={
            <>
              <StyledScanQRCode loadWithCameraOpen={loadWithCameraOpen} onScan={onScan} id={Date.now().toString()} />
              <UploadQRCode onScan={onScan} codeType="registrantAddress" />
            </>
          }
          required
          {...inputProps}
        />
      </Form.Item>
    </AntdFormWrapper>
  );
};

// OP_RETURN message related component
const OpReturnMessageHelp = styled.div`
  margin-top: 20px;
  font-size: 12px;

  .heading {
    margin-left: -20px;
    margin-bottom: 5px;
    font-weight: bold;
  }

  ul {
    padding-left: 0;
  }

  em {
    color: ${props => props.theme.primary} !important;
  }
`;

export const OpReturnMessageInput = ({ value, onChange, maxByteLength, labelTop, labelBottom, ...otherProps }) => {
  // in order to access the theme object provided by styled-component ThemeProvider
  // we need to use Modal.useModal() hook
  // see https://ant.design/components/modal/#FAQ
  const [modal, contextHolder] = Modal.useModal();

  // Help (?) Icon that shows the OP_RETURN info
  const helpInfoIcon = (
    <ThemedQuerstionCircleOutlinedFaded
      onClick={() => {
        // console.log(contextHolder);
        modal.info({
          centered: true,
          okText: 'Got It',
          title: 'Optional Message',
          maskClosable: true,
          content: (
            <OpReturnMessageHelp>
              <div className="heading">Higher Fee</div>
              <ul>
                <li>
                  Transaction with attached message will incur <em>higher fee.</em>
                </li>
              </ul>
              <div className="heading">Encryption</div>
              <ul>
                <li>Message is encrypted and only readable to the intended recipient.</li>
                <li>
                  Encrypted message can only be sent to <em>wallets with at least 1 outgoing transaction.</em>
                </li>
              </ul>
              <div className="heading">Message Length</div>
              <ul>
                <li>
                  Depending on your language, <em>each character may occupy from 1 to 4 bytes.</em>
                </li>
                <li>Encrypted message max length is 206 bytes.</li>
              </ul>
            </OpReturnMessageHelp>
          )
        });
      }}
    />
  );

  const trimMessage = msg => {
    // keep trimming the message one character at time
    // until the length in bytes < maxByteLength
    let trim = msg;
    while (Buffer.from(trim).length > maxByteLength) {
      trim = trim.substring(0, trim.length - 1);
    }
    return trim;
  };

  const handleInputChange = event => {
    // trim the input value against to maxByteLength
    let msg = trimMessage(event.target.value);
    // pass the value back up to parent component
    onChange(msg);
  };

  return (
    <AntdFormWrapper>
      <Form.Item {...otherProps}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-end'
          }}
        >
          <div style={{ flexGrow: 1 }}>{labelTop}</div>
          <div className="hint">
            {contextHolder}
            {Buffer.from(value).length} / {maxByteLength} bytes {helpInfoIcon}
          </div>
        </div>

        <Input.TextArea {...otherProps} onChange={handleInputChange} value={value} />
        {labelBottom && (
          <div
            css={`
              color: ${props => props.theme.greyLight};
            `}
            style={{ textAlign: 'right' }}
          >
            {labelBottom}
          </div>
        )}
      </Form.Item>
    </AntdFormWrapper>
  );
};
