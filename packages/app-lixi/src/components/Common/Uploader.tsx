import { useState } from 'react';
import intl from 'react-intl-universal';
import { message, Upload, Button, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import styled from 'styled-components';
import Image from 'next/image';
import type { UploadFile } from 'antd/es/upload/interface';
import { isMobile } from 'react-device-detect';
import { useAppDispatch } from '@store/hooks';
import { setUpload, removeUpload } from '@store/account/actions';
import axiosClient from '@utils/axiosClient';
import { UPLOAD_API } from '@bcpros/lixi-models/constants';
import _ from 'lodash';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const StyledButton = styled(Button)`
  font-size: 17px;
  border-radius: 3px;
  border: none;
  font-family: Roboto;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  align-items: center;
  color: rgb(158, 42, 156);
  flex: 0 0 auto;
  order: 0;

  :disabled {
    color: gray;
  }
`;

const StyledContainer = styled.div`
  padding: 0px;
`;

type UploaderProps = {
  type: string | Blob;
  buttonName?: string;
  buttonType?: string;
  isIcon: boolean;
  showUploadList: boolean;
}

export const Uploader = ({ type, buttonName, buttonType, isIcon, showUploadList }: UploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const dispatch = useAppDispatch();

  const uploadButton = (
    <StyledButton
      disabled={loading}
      type={!_.isEmpty(buttonType) ? buttonType : "primary"}
      size="middle"
      loading={loading}
      icon={isIcon ? <UploadOutlined style={{ color: loading ? 'gray' : 'white' }} /> : null}
    >
      {!_.isEmpty(buttonName) ? buttonName : loading ? intl.get('lixi.uploadingText') : intl.get('lixi.uploadText')}
    </StyledButton>
  );

  const customProgress = {
    strokeColor: {
      '0%': '#231557',
      '29%': '#44107A',
      '67%': '#FF1361',
      '100%': '#d38cad'
    },
    strokeWidth: 3,

    //hide percentage number
    format: percent => ''
  };

  const beforeUpload = (file: RcFile) => {
    const isJPG = file.type === 'image/jpeg';
    const isPNG = file.type === 'image/png';
    const isGIF = file.type === 'image/gif';
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isJPG && !isPNG && !isGIF) {
      message.error(intl.get('lixi.fileTypeError'));
    }

    if (!isLt5M) {
      message.error(intl.get('lixi.fileSizeError'));
    }

    return (isJPG || isPNG || isGIF) && isLt5M;
  };

  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file: UploadFile) => {
    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
      return message.error(intl.get('lixi.previewFileFailed'));
    }

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange = (info: UploadChangeParam) => {
    const { status } = info.file;
    switch (status) {
      case 'uploading':
        setLoading(true);
        break;
      case 'done':
        setLoading(false);
        message.success(intl.get('lixi.fileUploadSuccess'));
        break;
      case 'error':
        setLoading(false);
        message.error(intl.get('lixi.fileUploadError'));
        break;
    }
  };

  const uploadImage = async options => {
    const { onSuccess, onError, file, onProgress } = options;
    const url = UPLOAD_API;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('type', type);
    const config = {
      headers: { 'content-type': 'multipart/form-data' },
      withCredentials: true,
      onUploadProgress: event => {
        onProgress({ percent: (event.loaded / event.total) * 100 });
      }
    };

    await axiosClient
      .post(url, formData, config)
      .then(response => {
        return onSuccess(dispatch(setUpload({ upload: response.data, type: type })));
      })
      .catch(err => {
        const { response } = err;
        return onError(response);
      });
  };

  return (
    <StyledContainer>
      <Upload
        name="image-uploader"
        listType="picture"
        className="page-image-uploader"
        maxCount={1}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        accept="image/png, image/gif, image/jpeg"
        progress={customProgress}
        customRequest={uploadImage}
        onRemove={() => dispatch(removeUpload({ type: type }))}
        showUploadList={showUploadList}
      >
        {uploadButton}
      </Upload>
      <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
        <div style={{ width: '100%', height: '50vh', position: isMobile ? 'initial' : 'relative' }}>
          <Image alt="custom-upload" layout="fill" quality={100} src={previewImage} />
        </div>
      </Modal>
    </StyledContainer>
  );
};

export const StyledUploader = styled(Uploader)`
  .ant-upload.ant-upload-select-picture-card {
    background-color: white;
  }
`;
