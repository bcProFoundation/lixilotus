import React, { CSSProperties, useState } from 'react';
import styled from 'styled-components';
import * as qrcode from 'qrcode.react';
import RawQRCode from 'qrcode.react';
import {
  currency,
} from './Ticker';
import { CopyToClipboard } from 'react-copy-to-clipboard';

type StyledRawQRCodeProps = {
  id: string;
  value: string;
  xpi: number;
  size: number;
  renderAs: string;
  includeMargin: boolean | null;
  imageSettings: qrcode.ImageSettings;
};

export const StyledRawQRCode: React.FC<StyledRawQRCodeProps> = styled(RawQRCode) <StyledRawQRCodeProps>`
  cursor: pointer;
  border-radius: 23px;
  background: ${props => props.theme.qr.background};
  box-shadow: ${props => props.theme.qr.shadow};
  margin-bottom: 10px;
  border: 1px solid ${props => props.theme.wallet.borders.color};
  path:first-child {
    fill: ${props => props.theme.qr.background};
  }
  :hover {
    border-color: ${({ xpi = 0, ...props }) =>
    xpi === 1 ? props.theme.primary : props.theme.qr.token};
  }
  @media (max-width: 768px) {
    border-radius: 18px;
    width: 170px;
    height: 170px;
  }
`;

type CopiedProps = {
  xpi: number;
  style?: React.CSSProperties
};

const Copied = styled.div<CopiedProps>`
  font-size: 18px;
  font-weight: bold;
  width: 100%;
  text-align: center;
  background-color: ${({ xpi = 0, ...props }) =>
    xpi === 1 ? props.theme.primary : props.theme.qr.token};
  border: 1px solid;
  border-color: ${({ xpi = 0, ...props }) =>
    xpi === 1
      ? props.theme.qr.copyBorderCash
      : props.theme.qr.copyBorderToken};
  color: ${props => props.theme.contrast};
  position: absolute;
  top: 65px;
  padding: 30px 0;
  @media (max-width: 768px) {
    top: 52px;
    padding: 20px 0;
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
const AddressHighlightTrim = styled.span`
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
    border-radius: 5px;

    span {
      font-weight: bold;
      color: ${props => props.theme.wallet.text.primary};
      font-size: 16px;
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
        margin-bottom: 10px;
      }
    }
    @media (max-width: 340px) {
      font-size: 10px;
      span {
        font-size: 11px;
      }
      input {
        font-size: 11px;
        margin-bottom: 10px;
      }
    }
`;

type QRCodeProps = {
  address: string;
  size: number;
  onClick: Function;
}

export const QRCode = ({
  address,
  size = 210,
  onClick = () => null,
  ...otherProps
}: QRCodeProps) => {
  // address = address ? convertToEcashPrefix(address) : '';

  const [visible, setVisible] = useState(false);
  const trimAmount = 8;

  const address_trim = address ? address.length - trimAmount : '';

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
        position: 'relative',
      }}
      text={address}
      onCopy={handleOnCopy}
    >
      <div style={{ position: 'relative' }} onClick={handleOnClick}>
        <Copied
          xpi={address ? 1 : 0}
          style={{ display: visible ? undefined : 'none' }}
        >
          Copied <br />
          <span style={{ fontSize: '12px' }}>{address}</span>
        </Copied>

        <StyledRawQRCode
          id="borderedQRCode"
          value={address || ''}
          size={size}
          xpi={address ? 1 : 0}
          renderAs={'svg'}
          includeMargin
          imageSettings={{
            src: currency.logo,
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />

        {address && (
          <CustomInput xpi={address ? 1 : 0}>
            <input
              ref={txtRef}
              readOnly
              value={address}
              spellCheck="false"
              type="text"
            />
            <span>
              {address}
            </span>
          </CustomInput>
        )}
      </div>
    </CopyToClipboard>
  );
};
