import { Button, Descriptions, message, Modal } from 'antd';
import RawQRCode from 'qrcode.react';
import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { CloseCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { currency } from './Ticker';

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
const StyledRawQRCode: React.FC<StyledRawQRCodeProps> = styled(RawQRCode)<StyledRawQRCodeProps>`
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
    border-color: ${({ xpi = 0, ...props }) => (xpi === 1 ? props.theme.primary : props.theme.qr.token)};
  }
  @media (max-width: 768px) {
    border-radius: 18px;
    width: 170px;
    height: 170px;
  }
`;

type QRCodeProps = {
  address: string;
  size?: number;
  logoImage?: string;
};
const QRCode = ({ address, size = 210, logoImage, ...otherProps }: QRCodeProps) => {
  return (
    <StyledRawQRCode
      {...otherProps}
      id="borderedQRCode"
      value={address || ''}
      size={size}
      xpi={address ? 1 : 0}
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
  );
};

type QRCodeModalProps = {
  address: string;
  type: string;
  onClick?: Function;
};

export const QRCodeModal = ({ address, type, onClick = () => null }: QRCodeModalProps) => {
  const StyledModel = styled(Modal)`
    .ant-descriptions-bordered .ant-descriptions-view {
      border: none;
    }
    .ant-modal-body {
      border-radius: 20px !important;
    }

    .ant-descriptions-bordered .ant-descriptions-item-label,
    .ant-descriptions-bordered .ant-descriptions-item-content {
      padding: 0px 24px;
      border-right: none;
    }
  `;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOnCopy = () => {
    message.info(type == 'address' ? intl.get('lixi.addressCopied') : intl.get('claim.claimCodeCopied'));
  };

  return (
    <>
      <div onClick={showModal}>
        <QRCode address={address} />
      </div>

      <StyledModel
        width={490}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        closable={false}
        footer={null}
      >
        <Descriptions bordered>
          <Descriptions.Item label={<QRCode address={address} size={300} />}>
            {/* <Button type='primary' onClick={handleCopy}> */}
            <Button type="primary">
              <CopyToClipboard text={address} onCopy={handleOnCopy}>
                <div>
                  <CopyOutlined style={{ fontSize: '24px', color: '#fff' }} />
                  <br /> {intl.get('special.copy')}
                </div>
              </CopyToClipboard>
            </Button>
            <br />
            <br />
            <Button type="primary" onClick={handleCancel}>
              <CloseCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
              <br /> {intl.get('special.cancel')}
            </Button>
          </Descriptions.Item>
        </Descriptions>
      </StyledModel>
    </>
  );
};
