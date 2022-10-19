import { PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Form, Modal, Tabs } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import SunEditorCore from 'suneditor/src/lib/core';
import dynamic from 'next/dynamic';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import { Embed, SocialsEnum } from './Embed';
type ErrorType = 'unsupported' | 'invalid';

const regex = {
  [SocialsEnum.TWITTER]: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/,
  [SocialsEnum.FACEBOOK]:
    /^(?:https?:\/\/)?(?:www\.|m\.|mobile\.|touch\.|mbasic\.)?(?:facebook\.com|fb(?:\.me|\.com))\/(?!$)(?:(?:\w)*#!\/)?(?:pages\/)?(?:photo\.php\?fbid=)?(?:[\w\-]*\/)*?(?:\/)?(?:profile\.php\?id=)?([^\/?&\s]*)(?:\/|&|\?)?.*$/s,
  [SocialsEnum.REDDIT]: /(?:^.+?)(?:reddit.com)(\/r|\/user)(?:\/[\w\d]+){2}(?:\/)([\w\d]*)/
};

const Preview = styled.div`
  border: 1px solid;
  border-color: #e5e5e5;
  border-radius: 5px;
  background: #fff;
  padding: 30px;
  margin-top: 2rem;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
`;

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

const WrapEditor = styled.div``;

const CreateCardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 1rem;
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
  const [url, setUrl] = useState<string>('');

  const [social, setSocial] = useState<SocialsEnum>();
  const [postId, setPostId] = useState<string>();
  const [error, setError] = useState<ErrorType | null>(null);
  const [enableEditor, setEnableEditor] = useState(false);
  const sunEditor = useRef<SunEditorCore>();
  const [valueEditor, setValue] = useState(null);

  const getSunEditorInstance = (sunEditorCore: SunEditorCore) => {
    sunEditor.current = sunEditorCore;
  };

  const items = [
    { label: 'Create ', key: 'create', children: 'Content Create' }, // remember to pass the key prop
    { label: 'Import', key: 'import', children: 'Content Import' }
  ];

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

  const handleUrlChange = (event): void => {
    const url = event.target.value;

    setError(null);
    setUrl(url);
    setSocial(null);
    setPostId(null);

    if (typeof url === 'string') {
      parseUrl(url);
    } else {
      setError('unsupported');
      // onChange(null);
    }
  };

  const parseUrl = (url: string) => {
    const matchTwitter = regex[SocialsEnum.TWITTER].exec(url);

    if (matchTwitter) {
      setSocial(SocialsEnum.TWITTER);
      setPostId(matchTwitter[3]);

      return;
    }

    const matchReddit = regex[SocialsEnum.REDDIT].exec(url);

    if (matchReddit) {
      setSocial(SocialsEnum.REDDIT);
      setPostId(matchReddit[1]);

      return;
    }

    const matchFacebook = url.includes(SocialsEnum.FACEBOOK);

    if (matchFacebook) {
      setSocial(SocialsEnum.FACEBOOK);
      setPostId('123');

      return;
    }

    setError('unsupported');
  };

  const handleOnLoad = () => {
    // onChange(url);
    console.log('handleOnLoad');
  };

  const handleOnError = () => {
    setError('invalid');
    console.log('handleOnError');
    // onError();
  };

  const handleInputChange = event => {
    const urlValue = event.target.value;
    setUrl(urlValue);
    event.preventDefault();
  };

  const handleSubmitEditor = event => {
    if (url) {
      console.log(url);
    }
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
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Create" key="create">
                <form onSubmit={handleSubmitEditor}>
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
              </Tabs.TabPane>
              <Tabs.TabPane tab="Import" key="import">
                <form onSubmit={handleSubmit}>
                  <label>Link to post</label>
                  <input className="input-import" placeholder="Please type link..." onChange={handleUrlChange} />
                </form>
                {!error && social && postId && (
                  <div>
                    <h3 style={{ marginTop: '2rem' }}>Post Preview</h3>
                    <Preview>
                      <Embed social={social} postId={postId} url={url} onError={handleOnError} onLoad={handleOnLoad} />
                    </Preview>
                  </div>
                )}
              </Tabs.TabPane>
            </Tabs>
          </Modal>
        </WrapEditor>
      )}
    </>
  );
};

export default CreatePostCard;
