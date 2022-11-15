import React, { useState } from 'react';
import { BlockToolbarButton, useEventPlateId } from '@udecode/plate';
import { useMyPlateEditorRef } from './plateTypes';
import EmojiPicker from 'emoji-picker-react';
import { Emoji } from 'styled-icons/fluentui-system-filled';
import { Modal } from 'antd';

export const EmojiElementToolbarButtons = () => {
  const editor = useMyPlateEditorRef(useEventPlateId());
  const [isShowEmojiPicker, setIsShowEmojiPicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClickEmoji = value => {
    editor.insertText(value);
    setIsModalVisible(!isModalVisible);
  };

  return (
    <>
      <div
        onClick={() => {
          setIsShowEmojiPicker(!isShowEmojiPicker);
          setIsModalVisible(!isModalVisible);
        }}
      >
        <BlockToolbarButton icon={<Emoji />} type={''} />
      </div>
      <Modal
        onCancel={() => setIsModalVisible(!isModalVisible)}
        visible={isModalVisible}
        footer={null}
        closeIcon={null}
        className="emoji-modal"
      >
        <EmojiPicker onEmojiClick={value => handleClickEmoji(value.emoji)} />
      </Modal>
    </>
  );
};
