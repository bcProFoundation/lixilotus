import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { BrowserQRCodeReader } from '@zxing/library';

import {
  isValidLotusPrefix
} from './Ticker';

const StyledUploadOutlined = styled(UploadOutlined)`
  color: ${props => props.theme.primary} !important;
  font-size: 20px;
`

const StyledSpan = styled.span`
  width: 50%;
  font-size: 15px;
  display: inline-flex;
  height: 100%;
  position: absolute;
  top: 0px;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.primary} !important;
`;

type UploadQRCodeProps = {
  codeType: String,
  onScan: Function;
}

const UploadQRCode = (props: UploadQRCodeProps) => {
  const { codeType, onScan, ...otherProps } = props;
  const [activeCodeReader, setActiveCodeReader] = useState(null);

  const [defaultFileList, setDefaultFileList] = useState([]);
  const [error, setError] = useState(false);

  const uploadProps = {
    accept: "image/*",
    showUploadList: false,
    defaultFileList: defaultFileList,
    className: "image-upload-grid",
    maxCount: 1,

    beforeUpload: file => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const imageUrl = e.target.result;
        scanQrFromImage(imageUrl);
      };
      reader.readAsDataURL(file);

      // Prevent upload
      return false;
    }
  };

  const teardownCodeReader = codeReader => {
    if (codeReader !== null) {
      codeReader.reset();
      codeReader.stop();
      codeReader = null;
      setActiveCodeReader(codeReader);
    }
  };

  const parseAddressContent = content => {
    let type = 'unknown';
    let values = {};
    let value = content;

    // If what scanner reads from QR code begins with 'bitcoincash:' or 'simpleledger:' or their successor prefixes
    if (isValidLotusPrefix(content)) {
      type = 'address';
      values = { address: content };
    }
    return { type, values };
  };

  // Have to apply logic parse redeem code
  const parseRedeemContent = content => {
    let type = 'claimCode';
    let values = {
      result: content
    };
    return { type, values };
  };

  const scanQrFromImage = async (imageUrl) => {
    const codeReader = new BrowserQRCodeReader();
    setActiveCodeReader(codeReader);

    try {
      const content = await codeReader.decodeFromImage(undefined, imageUrl);
      let result = null;

      switch (codeType) {
        case 'address': result = parseAddressContent(content.getText());
          break;
        case 'claimCode': result = parseRedeemContent(content.getText());
          break;

        default:
          break;
      }

      // stop scanning and fill form if it's an address
      if (result?.type === codeType) { // Hide the scanner
        onScan(result.values?.result);
        return teardownCodeReader(codeReader);
      }
    } catch (err) {
      console.log(`Error in QR scanner:`);
      console.log(err);
      console.log(JSON.stringify(err.message));
      // setMobileErrorMsg(JSON.stringify(err.message));
      message.error(`Couldn't scan QR code from uploaded image`);
      setError(err);
      teardownCodeReader(codeReader);
    }
  };

  return (
    <>
      <StyledSpan>
        <Upload {...uploadProps}>
          <StyledUploadOutlined />
        </Upload>
      </StyledSpan>
    </>
  )
};

export default UploadQRCode;
