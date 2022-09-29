import React, { useState, useEffect } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { Alert, Select, Modal } from 'antd';
import { BrowserCodeReader } from '@zxing/browser';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { Result } from '@zxing/library';
import _ from 'lodash';
import { InfoCircleTwoTone } from '@ant-design/icons';

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

type ScanBarcodeProps = {
  loadWithCameraOpen: boolean;
  onScan: Function;
  id: string;
};
const ScanBarcode = (props: ScanBarcodeProps) => {
  const { loadWithCameraOpen, onScan, id, ...otherProps } = props;
  const [visible, setVisible] = useState(loadWithCameraOpen);
  const [error, setError] = useState(false);
  // Use these states to debug video errors on mobile
  // Note: iOS chrome/brave/firefox does not support accessing camera, will throw error
  // iOS users can use safari
  // todo only show scanner with safari
  //const [mobileError, setMobileError] = useState(false);
  //const [mobileErrorMsg, setMobileErrorMsg] = useState(false);
  const [activeCodeReader, setActiveCodeReader] = useState<BrowserMultiFormatReader>();
  const [lixiValue, setLixiValue] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [videoInputDevices, setVideoInputDevices] = useState<any[]>();

  const setupCodeReader = () => {
    var hints = new Map();
    const formats = [BarcodeFormat.UPC_A];
    hints.set(DecodeHintType.ASSUME_GS1, true);
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    const codeReader = new BrowserMultiFormatReader(hints);
    setActiveCodeReader(codeReader);
  };

  const setupVideoSource = () => {
    BrowserCodeReader.listVideoInputDevices().then(videoInputDevices => {
      if (videoInputDevices.length >= 1) {
        setVideoInputDevices(videoInputDevices);
      }
    });
  };

  const scanForBarcode = async videoSource => {
    try {
      activeCodeReader?.reset();

      const previewElem = document.querySelector('#test-area-qr-code-webcam-' + id);
      await activeCodeReader!.decodeFromVideoDevice(videoSource, previewElem as any, (content: Result, controls) => {
        if (!_.isNil(content) && content.getText()) {
          const result = content.getText();
          setLixiValue(result);
          onScan(result);
        }
      });
    } catch (err) {
      console.log(intl.get('general.QRScannerError'));
      console.log(err);
      console.log(JSON.stringify((err as any).message));
      setErrorMsg(JSON.stringify((err as any).message));
      //setMobileErrorMsg(JSON.stringify(err.message));
      setError(err as any);
      activeCodeReader?.reset();
    }
  };

  useEffect(() => {
    setupCodeReader();
    setupVideoSource();
  }, []);

  useEffect(() => {
    if (!visible) {
      setError(false);
      // Stop the camera if user closes modal
      activeCodeReader && activeCodeReader.reset();
      setLixiValue(undefined);
    }
  }, [visible]);

  const onChangeVideoSource = value => {
    scanForBarcode(value);
  };

  return (
    <>
      <StyledScanQRCode {...otherProps} onClick={() => setVisible(!visible)}>
        <span>{intl.get('general.scanBarcode')}</span>
      </StyledScanQRCode>
      <StyledModal
        title={
          <>
            <h3>{intl.get('general.scanBarcode')}</h3>
            <Select
              id="videoSourceSelect"
              onChange={onChangeVideoSource}
              placeholder={intl.get('general.chooseCamera')}
            >
              {videoInputDevices &&
                videoInputDevices.map(input => {
                  return (
                    <Select.Option key={input.deviceId} value={input.deviceId}>
                      {input.label}
                    </Select.Option>
                  );
                })}
            </Select>
            <div>
              <InfoCircleTwoTone style={{ fontSize: '13px', marginRight: '5px' }} />
              <span style={{ fontSize: '13px' }}>{intl.get('general.chooseCameraTip')}</span>
            </div>
          </>
        }
        visible={visible}
        onCancel={() => setVisible(false)}
        destroyOnClose={true}
        footer={
          <>
            <h2>{lixiValue}</h2>
          </>
        }
      >
        {visible ? (
          <div>
            {error ? (
              <>
                <Alert
                  message="Error"
                  description={errorMsg ? errorMsg : intl.get('general.scanBarcodeError')}
                  type="error"
                  showIcon
                  style={{ textAlign: 'left' }}
                />
              </>
            ) : (
              <>
                <QRPreview id={`test-area-qr-code-webcam-${id}`} />
              </>
            )}
          </div>
        ) : null}
      </StyledModal>
    </>
  );
};

export default ScanBarcode;
