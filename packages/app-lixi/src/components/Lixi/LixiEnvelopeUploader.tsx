import { useState } from 'react';
import intl from 'react-intl-universal';
import { message, Upload, Button, Modal } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import styled from 'styled-components';
import Image from 'next/image'
import type { UploadFile } from 'antd/es/upload/interface';
import { isMobile } from 'react-device-detect';
import { useAppDispatch, useAppSelector } from "@store/hooks";
import axiosClient from "@utils/axiosClient";

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

const StyledDivider = styled.h3`
  width: 100%;
  text-align: center; 
  border-bottom: 1px solid #000; 
  line-height: 0.1em;
  margin: 10px 0 20px; 
`

const StyledButton = styled(Button)`
  font-size: 17px;
  border-radius: 3px;
  border: none;

  :disabled {
    color: gray;
  }
`

const StyledContainer = styled.div`
  padding: 10px;
`

export const LixiEnvelopeUploader = ({
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const dispatch = useAppDispatch();

  const uploadButton = (
    <StyledButton disabled={loading} type='primary' size="middle" loading={loading}
      icon={<UploadOutlined style={{color: loading ? "gray" : "white"}}/>}
    >
      {loading ? intl.get('lixi.uploadingText') : intl.get('lixi.uploadText')}
    </StyledButton>
  );

  const customProgress = {
    strokeColor: {
      '0%': '#231557',
      '29%': '#44107A',
      '67%': '#FF1361',
      '100%': '#d38cad',
    },
    strokeWidth: 3,

    //hide percentage number
    format: percent => '',
  }

  const beforeUpload = (file: RcFile) => {
    const isJPG = file.type === 'image/jpeg';
    const isPNG = file.type === 'image/png'
    const isGIF = file.type === "image/gif"
    const isLt5M = file.size / 1024 / 1024 < 5;

    if (!isJPG && !isPNG && !isGIF) {
      message.error(intl.get('lixi.fileTypeError'));
    }

    if (!isLt5M) {
      message.error(intl.get('lixi.fileSizeError'));
    }

    //Get width and height
    // const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   reader.addEventListener('load', event => {
    //     const _loadedImageUrl = event.target.result;
    //     const image = document.createElement('img');
    //     image.src = _loadedImageUrl as string;
    //     image.addEventListener('load', () => {
    //       const { width, height } = image;
    //       // set image width and height to your state here
    //       console.log(width, height);
    //     });
    //   });

    return (isJPG || isPNG || isGIF) && isLt5M;
  }


  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file: UploadFile) => {
    if(file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
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
        message.success(intl.get('lixi.fileUploadSuccess'))
        break;
      case 'error':
        setLoading(false);
        message.error(intl.get('lixi.fileUploadError'));
        break;
    }
  };

  const uploadImage = async options => {
    const { onSuccess, onError, file, onProgress } = options;
    const url = `/api/lixies/custom-envelope`
    const formData = new FormData();

    formData.append('file', file);
    const config = {
      headers: { "content-type": "multipart/form-data" },
      withCredentials: true,
      onUploadProgress: event => {
        onProgress({ percent: (event.loaded / event.total) * 100 });
      }
    };

    await axiosClient.post(url, formData, config).then(response => {
      return onSuccess();
    })
    .catch(err => {
      const { response } = err;
      return onError(response);
    })
  };

  return (
    <StyledContainer>
      <StyledDivider>
        <span style={{backgroundColor: "#FFF",padding: "0 10px"}}>{intl.get('lixi.uploadDividerText')}</span>
      </StyledDivider>
      <Upload
        name="envelope-uploader"
        listType="picture"
        className="lixi-envelope-uploader"
        maxCount={1}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        accept="image/png, image/gif, image/jpeg"
        progress={customProgress}
        customRequest={uploadImage}
      >
        {uploadButton}
      </Upload>
       <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
        <div style={{width: '100%', height: '50vh', position: isMobile ? 'initial' : 'relative'}}>
          <Image alt="custom-envelope" layout='fill' quality={100} src={previewImage} />
        </div>  
      </Modal>
    </StyledContainer>
  )
}

export const StyledLixiEnvelopeUploaded = styled(LixiEnvelopeUploader)`
  .ant-upload.ant-upload-select-picture-card {
    background-color: white;
  }
`