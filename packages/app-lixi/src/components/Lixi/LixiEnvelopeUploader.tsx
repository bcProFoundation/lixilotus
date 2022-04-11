
import { useState } from 'react';
import intl from 'react-intl-universal';
import { message, Upload } from "antd";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam } from 'antd/lib/upload';
import styled from 'styled-components';
import Image from 'next/image'

function getBase64(img: any, callback: Function) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

const beforeUpload = (file: RcFile) => {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error(intl.get('account.fileTypeError'));
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error(intl.get('account.fileSizeError'));
  }
  return isJPG && isLt2M;
}



export const LixiEnvelopeUploader = ({
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div className="ant-upload-text">{intl.get('account.lixiPostcard')}</div>
    </div>
  );


  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        setImageUrl(imageUrl);
        setLoading(false);
      });
    }
  };

  return (
    <>
      <Upload
        name="avatar"
        listType="picture-card"
        className="lixi-envelope-uploader"
        showUploadList={false}
        action="//jsonplaceholder.typicode.com/posts/"
        beforeUpload={beforeUpload}
        onChange={handleChange}
      >
        {imageUrl ? <Image src={imageUrl} alt="" /> : uploadButton}
      </Upload>
    </>
  )
}

export const StyledLixiEnvelopeUploaded = styled(LixiEnvelopeUploader)`
  .ant-upload.ant-upload-select-picture-card {
    background-color: white;
  }
`