import { Button, Descriptions, message, Modal } from 'antd';
import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { CloseCircleOutlined, CopyOutlined } from '@ant-design/icons';
import { QRCode } from './QRCodeModal';
import { AntdFormWrapper } from './EnhancedInputs';
import { closeModal } from '@store/modal/actions';
import { useAppDispatch } from '@store/hooks';

export type QRCodeModalProps = {
  address: string;
  type: string;
  onClick?: Function;
};

export const QRCodeModalPopup: React.FC<QRCodeModalProps> = (props: QRCodeModalProps) => {
  const dispatch = useAppDispatch();
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
  const StyledButton = styled(Button)`
    min-width: 90px;
  `

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOk = () => {};
  const handleCancel = () => {
    dispatch(closeModal());
  };

  const handleOnCopy = () => {
    message.info(props.type == 'address' ? intl.get('lixi.addressCopied') : intl.get('claim.claimCodeCopied'));
  };

  return (
    <>
      <Modal open={true} footer={null} width={400}>
        <StyledModel width={490} open={true} onOk={handleOk} onCancel={handleCancel} closable={false} footer={null}>
          <Descriptions bordered>
            <Descriptions.Item label={<QRCode address={props.address} size={300} />}>
              {/* <Button type='primary' onClick={handleCopy}> */}
              <StyledButton type="primary">
                <CopyToClipboard text={props.address} onCopy={handleOnCopy}>
                  <div>
                    <CopyOutlined style={{ fontSize: '24px', color: '#fff' }} />
                    <br /> {intl.get('special.copy')}
                  </div>
                </CopyToClipboard>
              </StyledButton>
              <br />
              <br />
              <StyledButton type="primary" onClick={handleCancel}>
                <CloseCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />
                <br /> {intl.get('special.cancel')}
              </StyledButton>
            </Descriptions.Item>
          </Descriptions>
        </StyledModel>
      </Modal>
    </>
  );
};
