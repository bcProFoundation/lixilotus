import { usePlateEditorRef } from '@udecode/plate-core';
import { insertImage } from '@udecode/plate-image';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { Modal, Upload } from 'antd';

import React, { useState } from 'react';
import { Uploader } from '../Uploader';

// import {Upload} from 'components/Upload';
// import {Modal} from 'components/atoms/Modal';
// import {useToggle} from 'src/hooks/use-toggle.hook';
// import * as UploadAPI from 'src/lib/api/upload';
// import i18n from 'src/locale';

export type ImageToolbarButtonProps = ToolbarButtonProps & {
  userId: string;
};

const toImageEntries = (images: File[]) => {
  return images.map((image, index) => [index, image] as const);
};

export const ImageToolbarButton: React.FC<ImageToolbarButtonProps> = ({ id, userId, getImageUrl, ...props }) => {
  const editor = usePlateEditorRef(id)!;

  const [open, toggleUploadDialog] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelected = async (images: File[]) => {
    const urls: string[] = [];
    const size = images.length;

    for (const [index, image] of toImageEntries(images)) {
      const { files } = await UploadAPI.image(userId, image, {
        onUploadProgress: (event: ProgressEvent) => {
          const fileProgress = Math.round((100 * event.loaded) / event.total);
          const totalProgress: number = (100 * index) / size + fileProgress / size;

          setProgress(totalProgress);
        }
      });

      if (files && files.length) {
        urls.push(files[0].url);
      }
    }

    if (urls.length > 1) {
      for (const url of urls) {
        insertImage(editor, url);
      }
    }

    if (urls.length === 1) {
      insertImage(editor, urls[0]);
    }

    setProgress(0);
    toggleUploadDialog(true);
  };

  return (
    <>
      <ToolbarButton
        onMouseDown={async event => {
          if (!editor) return;

          event.preventDefault();

          event.preventDefault();

          toggleUploadDialog(true);
        }}
        {...props}
      />

      <Modal title={'Upload image'} visible={open} onCancel={() => toggleUploadDialog}>
        <Upload
          //   type="image"
          //   progress={progress}
          //   loading={progress > 0}
          //   multiple={true}
          //   onFileSelected={handleFileSelected}
          //   accept={['image/*']}
          //   usage="post"
          on
        />
      </Modal>
    </>
  );
};
