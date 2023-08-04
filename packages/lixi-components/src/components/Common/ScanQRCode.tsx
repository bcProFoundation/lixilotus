import React, { useState, useEffect } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { Alert, Modal } from 'antd';
import { BrowserQRCodeReader } from '@zxing/browser';
import { ThemedQrcodeOutlined } from './CustomIcons';

import { isValidLotusPrefix } from './Ticker';
import { Result } from '@zxing/library';
import _ from 'lodash';

const StyledScanQRCode = styled.span`
  display: block;
`;

const StyledModal = styled(Modal)`
  width: 400px !important;
  height: 400px !important;

  .ant-modal-close {
    top: 20px !important;
    right: 20px !important;
  }
  .ant-modal-body {
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
  }
`;

const QRPreview = styled.video`
  width: 100%;
`;

type ScanQRCodeProps = {
  loadWithCameraOpen: boolean;
  onScan: Function;
  id: string;
};
const ScanQRCode = (props: ScanQRCodeProps) => {
  const { loadWithCameraOpen, onScan, id, ...otherProps } = props;
  const [visible, setVisible] = useState(loadWithCameraOpen);
  const [error, setError] = useState(false);
  // Use these states to debug video errors on mobile
  // Note: iOS chrome/brave/firefox does not support accessing camera, will throw error
  // iOS users can use safari
  // todo only show scanner with safari
  //const [mobileError, setMobileError] = useState(false);
  //const [mobileErrorMsg, setMobileErrorMsg] = useState(false);
  const [activeCodeReader, setActiveCodeReader] = useState<BrowserQRCodeReader | null>(null);
  const [controls, setControls] = useState<any>(null);

  const teardownCodeReader = (codeReader: BrowserQRCodeReader) => {
    if (codeReader !== null) {
      controls && controls.stop();
      setActiveCodeReader(null);
    }
  };

  const parseContent = (content: string) => {
    let type = 'unknown';
    let values: { address?: string; lixi?: string } = {};

    // If what scanner reads from QR code begins with 'bitcoincash:' or 'simpleledger:' or their successor prefixes
    if (isValidLotusPrefix(content)) {
      type = 'address';
      values = { address: content };
    } else {
      type = 'claimCode';
      values = { lixi: content };
    }
    return { type, values };
  };

  const scanForQrCode = async () => {
    const codeReader = new BrowserQRCodeReader();
    setActiveCodeReader(codeReader);

    try {
      // Need to execute this before you can decode input
      // eslint-disable-next-line no-unused-vars
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      //setMobileError(JSON.stringify(videoInputDevices));

      // choose your media device (webcam, frontal camera, back camera, etc.)
      // TODO implement if necessary
      //const selectedDeviceId = videoInputDevices[0].deviceId;

      //const previewElem = document.querySelector("#test-area-qr-code-webcam");
      const selectedDeviceId = videoInputDevices[0].deviceId;

      const previewElem = document.querySelector('#test-area-qr-code-webcam-' + id);
      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        previewElem as any,
        (content, error, controls) => {
          // use the result and error values to choose your actions
          // you can also use controls API in this scope like the controls
          // returned from the method.
          if (!_.isNil(content) && content.getText()) {
            const result = parseContent(content.getText());
            // stop scanning and fill form if it's an address
            if (result.type === 'address') {
              // Hide the scanner
              controls.stop();
              setVisible(false);
              onScan(result.values.address);
              return teardownCodeReader(codeReader);
            } else if (result.type === 'claimCode') {
              // Hide the scanner
              controls.stop();
              setVisible(false);
              onScan(result.values.lixi);
              return teardownCodeReader(codeReader);
            }
          }
        }
      );
      setControls(controls);
    } catch (err) {
      console.log(intl.get('general.QRScannerError'));
      console.log(err);
      console.log(JSON.stringify((err as any).message));
      //setMobileErrorMsg(JSON.stringify(err.message));
      setError(err as any);
      teardownCodeReader(codeReader);
    }
  };

  useEffect(() => {
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
      <StyledScanQRCode {...otherProps} onClick={() => setVisible(!visible)}>
        <ThemedQrcodeOutlined />
      </StyledScanQRCode>
      <StyledModal
        title={intl.get('general.scanQRCode')}
        open={visible}
        transitionName=''
        onCancel={() => setVisible(false)}
        destroyOnClose={true}
        footer={null}
      >
        {visible ? (
          <div>
            {error ? (
              <>
                <Alert
                  message="Error"
                  description={intl.get('general.scanQRCodeError')}
                  type="error"
                  showIcon
                  style={{ textAlign: 'left' }}
                />
              </>
            ) : (
              <QRPreview id={`test-area-qr-code-webcam-${id}`} />
            )}
          </div>
        ) : null}
      </StyledModal>
    </>
  );
};

export default ScanQRCode;
