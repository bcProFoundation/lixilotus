import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';
import { useState } from 'react';

import { $createEmojiNode, EmojiNode } from '../../nodes/EmojiNode';
import { BlockToolbarButton } from '@udecode/plate';
import { Emoji } from 'styled-icons/fluentui-system-filled';
import { Modal } from 'antd';
import EmojiPicker from 'emoji-picker-react';

const EmojiToolbarButtonsLexical: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isShowEmojiPicker, setIsShowEmojiPicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClickEmoji = value => {
    if (!editor.hasNodes([EmojiNode])) {
      throw new Error('EmojisPlugin: EmojiNode not registered on editor');
    }
    editor.update(() => {
      const selection = $getSelection();
      const emojiNode = $createEmojiNode('emoji-picker', value);
      selection.insertNodes([emojiNode]);
    });
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

export default EmojiToolbarButtonsLexical;
