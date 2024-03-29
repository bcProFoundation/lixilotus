import React, { CSSProperties, useState } from 'react';
import styled from 'styled-components';
import * as qrcode from 'qrcode.react';
import RawQRCode from 'qrcode.react';
import Icon from '@ant-design/icons';
import { currency } from './Ticker';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type StyledRawQRCodeProps = {
  level?: 'L' | 'M' | 'Q' | 'H' | undefined;
  id: string;
  value: string;
  xpi: number;
  size: number;
  renderAs: string;
  includeMargin: boolean | null;
  imageSettings?: any;
};

export const StyledRawQRCode: React.FC<StyledRawQRCodeProps> = styled(RawQRCode)<StyledRawQRCodeProps>`
  cursor: pointer;
  background: ${props => props.theme.qr.background};
  path:first-child {
    fill: ${props => props.theme.qr.background};
  }
  :hover {
    border-color: ${({ xpi = 0, ...props }) => (xpi === 1 ? props.theme.primary : props.theme.qr.token)};
  }
  @media (max-width: 768px) {
    border-radius: 18px;
    width: 170px;
    height: 170px;
  }
`;

type CopiedProps = {
  xpi: number;
  style?: React.CSSProperties;
};

const Copied = styled.div<CopiedProps>`
  font-size: 18px;
  width: 100%;
  text-align: center;
  background-color: ${({ xpi = 0, ...props }) => (xpi === 1 ? props.theme.primary : props.theme.qr.token)};
  border: 1px solid;
  border-color: ${({ xpi = 0, ...props }) =>
    xpi === 1 ? props.theme.qr.copyBorderCash : props.theme.qr.copyBorderToken};
  color: ${props => props.theme.contrast};
  position: absolute;
  top: 65px;
  padding: 30px 0;
  @media (max-width: 768px) {
    top: 52px;
    padding: 20px 0;
  }
  .copied-header,
  .copied-content {
    color: #fff !important;
  }
`;
const PrefixLabel = styled.span`
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 12px;
  }
  @media (max-width: 400px) {
    font-size: 10px;
  }
`;
const codeHighlightTrim = styled.span`
  font-weight: bold;
  font-size: 14px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
  @media (max-width: 400px) {
    font-size: 10px;
  }
`;

type CustomInputProps = {
  xpi: number;
};

const CustomInput = styled.div<CustomInputProps>`
  font-size: 15px;
  color: ${props => props.theme.wallet.text.secondary};
  text-align: center;
  cursor: pointer;
  margin-bottom: 0px;
  padding: 6px 0;
  font-family: 'Roboto Mono', monospace;
  border-radius: var(--border-radius-primary);

  span {
    color: ${props => props.theme.wallet.text.primary};
    font-size: 14px;
  }
  input {
    border: none;
    width: 100%;
    text-align: center;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: pointer;
    color: ${props => props.theme.wallet.text.primary};
    padding: 10px 0;
    background: transparent;
    margin-bottom: 15px;
    display: none;
  }
  input:focus {
    outline: none;
  }
  input::selection {
    background: transparent;
    color: ${props => props.theme.wallet.text.primary};
  }
  @media (max-width: 768px) {
    font-size: 11px;
    span {
      font-size: 12px;
    }
    input {
      font-size: 11px;
      margin-bottom: 6px;
    }
  }
  @media (max-width: 340px) {
    font-size: 10px;
    span {
      font-size: 11px;
    }
    input {
      font-size: 11px;
      margin-bottom: 6px;
    }
  }
`;

type QRClaimCodeProps = {
  code: string;
  size?: number;
  onClick?: Function;
  logoImage?: string;
};

export const QRClaimCode = ({ code, size = 210, onClick = () => null, logoImage, ...otherProps }: QRClaimCodeProps) => {
  const [visible, setVisible] = useState(false);

  const txtRef = React.useRef<HTMLInputElement>(null);

  const handleOnClick = evt => {
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 1500);
    onClick(evt);
  };

  const handleOnCopy = () => {
    setVisible(true);
    setTimeout(() => {
      if (txtRef.current) {
        txtRef.current.select();
      }
    }, 100);
  };

  return (
    <CopyToClipboard
      style={{
        display: 'inline-block',
        width: '100%',
        position: 'relative'
      }}
      text={code}
      onCopy={handleOnCopy}
    >
      <div style={{ position: 'relative' }} onClick={handleOnClick}>
        <Copied className="copied-header" xpi={code ? 1 : 0} style={{ display: visible ? undefined : 'none' }}>
          Copied <br />
          <span className="copied-content" style={{ fontSize: '12px' }}>
            {code}
          </span>
        </Copied>

        <StyledRawQRCode
          {...otherProps}
          id="borderedQRCode"
          value={code || ''}
          size={size}
          xpi={code ? 1 : 0}
          renderAs={'svg'}
          includeMargin
          level={'H'}
          imageSettings={{
            src: logoImage ?? currency.logo,
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true
          }}
        />

        {code && (
          <CustomInput xpi={code ? 1 : 0}>
            <input ref={txtRef} readOnly value={code} spellCheck="false" type="text" />
            <span>{code}</span>
          </CustomInput>
        )}
      </div>
    </CopyToClipboard>
  );
};
