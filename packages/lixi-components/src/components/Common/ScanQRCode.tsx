import React, { useState } from 'react';
import styled from 'styled-components';
import { Alert, Modal } from 'antd';
import { BrowserQRCodeReader } from '@zxing/library/esm5';
import { ThemedQrcodeOutlined } from './CustomIcons';

import {
  isValidLotusPrefix
} from './Ticker';

const StyledScanQRCode = styled.span`
  display: block;
`;

const StyledModal = styled(Modal)`
  width: 400px !important;
  height: 400px !important;

  .ant-modal-close {
    top: 0 !important;
    right: 0 !important;
  }
`;

const QRPreview = styled.video`
  width: 100%;
`;

type ScanQRCodeProps = {
  loadWithCameraOpen: boolean;
  onScan: Function;
}

const ScanQRCode = (props: ScanQRCodeProps) => {
  const { loadWithCameraOpen, onScan, ...otherProps } = props;
  const [visible, setVisible] = useState(loadWithCameraOpen);
  const [error, setError] = useState(false);
  // Use these states to debug video errors on mobile
  // Note: iOS chrome/brave/firefox does not support accessing camera, will throw error
  // iOS users can use safari
  // todo only show scanner with safari
  //const [mobileError, setMobileError] = useState(false);
  //const [mobileErrorMsg, setMobileErrorMsg] = useState(false);
  const [activeCodeReader, setActiveCodeReader] = useState<BrowserQRCodeReader | null>(null);

  const teardownCodeReader = codeReader => {
    if (codeReader !== null) {
      codeReader.reset();
      codeReader.stop();
      codeReader = null;
      setActiveCodeReader(codeReader);
    }
  };

  const parseContent = (content: string) => {
    let type = 'unknown';
    let values: { address?: string } = {};

    // If what scanner reads from QR code begins with 'bitcoincash:' or 'simpleledger:' or their successor prefixes
    if (isValidLotusPrefix(content)) {
      type = 'address';
      values = { address: content };
    }
    return { type, values };
  };

  const scanForQrCode = async () => {
    const codeReader = new BrowserQRCodeReader();
    setActiveCodeReader(codeReader);

    try {
      // Need to execute this before you can decode input
      // eslint-disable-next-line no-unused-vars
      const videoInputDevices = await codeReader.getVideoInputDevices();
      //console.log(`videoInputDevices`, videoInputDevices);
      //setMobileError(JSON.stringify(videoInputDevices));

      // choose your media device (webcam, frontal camera, back camera, etc.)
      // TODO implement if necessary
      //const selectedDeviceId = videoInputDevices[0].deviceId;

      //const previewElem = document.querySelector("#test-area-qr-code-webcam");

      const content = await codeReader.decodeFromInputVideoDevice(
        undefined,
        'test-area-qr-code-webcam',
      );
      const result = parseContent(content.getText());

      // stop scanning and fill form if it's an address
      if (result.type === 'address') {
        // Hide the scanner
        setVisible(false);
        onScan(result.values.address);
        return teardownCodeReader(codeReader);
      }
    } catch (err) {
      console.log(`Error in QR scanner:`);
      console.log(err);
      console.log(JSON.stringify((err as any).message));
      //setMobileErrorMsg(JSON.stringify(err.message));
      setError(err as any);
      teardownCodeReader(codeReader);
    }

    // stop scanning after 20s no matter what
  };

  React.useEffect(() => {
    if (!visible) {
      setError(false);
      // Stop the camera if user closes modal
      if (activeCodeReader !== null) {
        teardownCodeReader(activeCodeReader);
      }
    } else {
      scanForQrCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <>
      <StyledScanQRCode
        {...otherProps}
        onClick={() => setVisible(!visible)}
      >
        <ThemedQrcodeOutlined />
      </StyledScanQRCode>
      <StyledModal
        title="Scan QR code"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        {visible ? (
          <div>
            {error ? (
              <>
                <Alert
                  message="Error"
                  description="Error in QR scanner. Please ensure your camera is not in use. Due to Apple restrictions on third-party browsers, you must use Safari browser for QR code scanning on an iPhone."
                  type="error"
                  showIcon
                  style={{ textAlign: 'left' }}
                />
              </>
            ) : (
              <QRPreview id="test-area-qr-code-webcam"></QRPreview>
            )}
          </div>
        ) : null}
      </StyledModal>
    </>
  );
};

export default ScanQRCode;
