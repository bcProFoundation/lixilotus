import React, { useState, useEffect } from 'react';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { Alert, Modal } from 'antd';
import { BrowserCodeReader } from '@zxing/browser';
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';
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

   const teardownCodeReader = (codeReader: BrowserMultiFormatReader) => {
      if (codeReader !== undefined) {
         codeReader.reset();
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

   const setupCodeReader = () => {
      var hints = new Map();
      hints.set(DecodeHintType.ASSUME_GS1, true)
      hints.set(DecodeHintType.TRY_HARDER, true)
      const codeReader = new BrowserMultiFormatReader(hints);
      setActiveCodeReader(codeReader);
   }

   const scanForBarcode = async () => {
      try {
         // Need to execute this before you can decode input
         const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
         //setMobileError(JSON.stringify(videoInputDevices));

         // choose your media device (webcam, frontal camera, back camera, etc.)
         // TODO implement if necessary
         // const selectedDeviceId = videoInputDevices[0].deviceId;

         //const previewElem = document.querySelector("#test-area-qr-code-webcam");
         const selectedDeviceId = videoInputDevices[0].deviceId;

         const previewElem = document.querySelector('#test-area-qr-code-webcam-' + id);
         await activeCodeReader!.decodeFromVideoDevice(
            selectedDeviceId,
            previewElem as any,
            (content: Result, controls) => {
               if (!_.isNil(content) && content.getText()) {
                  const result = parseContent(content.getText());
                  setLixiValue(result.values.lixi);
                  onScan(result.values.lixi);
               }
            },
         );
      } catch (err) {
         console.log(intl.get('general.QRScannerError'));
         console.log(err);
         console.log(JSON.stringify((err as any).message));
         //setMobileErrorMsg(JSON.stringify(err.message));
         setError(err as any);
         teardownCodeReader(activeCodeReader!);
      }
   };

   useEffect(() => {
      setupCodeReader();
   }, []);

   useEffect(() => {
      if (!visible) {
         setError(false);
         // Stop the camera if user closes modal
         if (activeCodeReader !== undefined) {
            teardownCodeReader(activeCodeReader!);
         }
      } else {
         scanForBarcode();
      }
   }, [visible])

   return (
      <>
         <StyledScanQRCode {...otherProps} onClick={() => setVisible(!visible)}>
            <ThemedQrcodeOutlined />
         </StyledScanQRCode>
         <StyledModal
            title={intl.get('general.scanBarcode')}
            visible={visible}
            onCancel={() => {
               setVisible(false);
               teardownCodeReader(activeCodeReader!);
            }}
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
                           description={intl.get('general.scanBarcodeError')}
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
