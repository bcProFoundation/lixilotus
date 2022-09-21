import { PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Form, Modal } from 'antd';
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
  const sunEditor = useRef<SunEditorCore>();
  const [valueEditor, setValue] = useState(null);

  const getSunEditorInstance = (sunEditorCore: SunEditorCore) => {
    sunEditor.current = sunEditorCore;
  };

  const configEditor = {
    rtl: false,
    katex: 'window.katex',
    videoFileInput: false,
    tabDisable: false,
    height: '50vh',
    placeholder: 'Type...',
    buttonList: [
      [
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
        'align',
        'lineHeight',
        'link',
        'image',
        'video',
        'audio',
        'fullScreen',
        'codeView'
      ]
    ]
  };
  const handleSaveEditor = contents => {
    setValue(contents);
    setEnableEditor(false);
  };

  const handleSubmit = event => {
    const valueInput = sunEditor.current.getContents(true);
    setValue(valueInput);
    setEnableEditor(false);
    console.log(valueInput);
    event.preventDefault();
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
            footer={null}
            onCancel={() => setEnableEditor(false)}
          >
            <form onSubmit={handleSubmit}>
              <SunEditor
                getSunEditorInstance={getSunEditorInstance}
                width="100%"
                placeholder="Please type here..."
                hide={!enableEditor}
                onSave={handleSaveEditor}
                setOptions={configEditor}
              />
              <input type="submit" value="Create Post" />
            </form>
          </Modal>
        </WrapEditor>
      )}
    </>
  );
};

export default CreatePostCard;
