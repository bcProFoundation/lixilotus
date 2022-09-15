import { PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Modal } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import SunEditorCore from 'suneditor/src/lib/core';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

const WrapEditor = styled.div``;

const CreateCardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 30px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  align-items: center;
  margin: 1rem 0;
  .avatar {
    flex: 2 auto;
    display: flex;
    align-items: center;
    .ant-avatar {
      min-width: 50px;
    }
  }
  .btn-create {
    .anticon {
      font-size: 22px;
      color: #7342cc;
    }
  }
`;

const CreatePostCard = () => {
  const [enableEditor, setEnableEditor] = useState(false);
  const editor = useRef<SunEditorCore>();

  const getSunEditorInstance = (sunEditor: SunEditorCore) => {
    editor.current = sunEditor;
  };

  const configEditor = {
    rtl: false,
    katex: 'window.katex',
    imageGalleryUrl: 'https://etyswjpn79.execute-api.ap-northeast-1.amazonaws.com/suneditor-demo',
    videoFileInput: false,
    tabDisable: false,
    height: '50vh',
    buttonList: [
      [
        'undo',
        'redo',
        'font',
        'fontSize',
        'formatBlock',
        'paragraphStyle',
        'blockquote',
        'bold',
        'underline',
        'italic',
        'strike',
        'subscript',
        'superscript',
        'fontColor',
        'hiliteColor',
        'textStyle',
        'removeFormat',
        'outdent',
        'indent',
        'align',
        'horizontalRule',
        'list',
        'lineHeight',
        'table',
        'link',
        'image',
        'video',
        'audio',
        'math',
        'imageGallery',
        'fullScreen',
        'showBlocks',
        'codeView',
        'preview',
        'print',
        'save',
        'template'
      ]
    ]
  };
  const handleSaveEditor = contents => {
    setEnableEditor(false);
    console.log('Save done', contents);
  };

  const handleLeaveEditor = () => {
    setEnableEditor(!enableEditor);
    console.log('Move out');
  };

  const handleDrop = event => {
    console.log(event); //Get the drop event
  };

  return (
    <>
      {!enableEditor && (
        <CreateCardContainer onClick={() => setEnableEditor(!enableEditor)}>
          <div className="avatar">
            <Avatar size={50} style={{ color: '#fff', backgroundColor: '#bdbdbd' }}>
              ER
            </Avatar>
            <TextArea bordered={false} placeholder="What's on your mind?" autoSize={{ minRows: 1, maxRows: 2 }} />
          </div>
          <div className="btn-create">
            <PlusCircleOutlined />
          </div>
        </CreateCardContainer>
      )}
      {enableEditor && (
        <WrapEditor>
          <Modal
            className="custom-modal-editor"
            title="Create Post"
            visible={enableEditor}
            okText="Create Post"
            onOk={() => setEnableEditor(false)}
            onCancel={() => setEnableEditor(false)}
          >
            <p>Create your own post</p>
            <SunEditor
              width="100%"
              placeholder="Please type here..."
              hide={!enableEditor}
              onSave={handleSaveEditor}
              setOptions={configEditor}
            />
          </Modal>
        </WrapEditor>
      )}
    </>
  );
};

export default CreatePostCard;
