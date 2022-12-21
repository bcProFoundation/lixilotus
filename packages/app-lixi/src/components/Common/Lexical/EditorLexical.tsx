import React, { useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import EmoticonPlugin from './plugins/EmoticonPlugin';
import MyCustomAutoFocusPlugin from './plugins/MyCustomAutoFocusPlugin';
import editorConfig from './editorConfig';
import CustomButtonSubmitPlugin from './plugins/CustomButtonSubmitPlugin';
import onChange from './onChange';
import EmojisPlugin from './plugins/EmoticonPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import { MultiUploader } from '../Uploader/MultiUploader';
import { PictureOutlined } from '@ant-design/icons';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import EmojiToolbarButtonsLexical from './plugins/EmojiToolbarButtonsLexical/EmojiToolbarButtonsLexical';
import styled from 'styled-components';

const StyledEditorLexical = styled.div`
  display: flex;
  flex-direction: column;

  // Customine Editor Lexical
  .EditorLexical_container {
    background: #fff;
    position: relative;
  }

  .EditorLexical_root {
    border: 0;
    font-size: 15px;
    display: block;
    position: relative;
    tab-size: 1;
    outline: 0;
    padding: 8px 8px;
    min-height: calc(100% - 16px);
  }

  .EditorLexical_hashtag {
    background: #ffd7f6;
  }

  .EditorLexical_placeholder {
    font-size: 15px;
    color: #999;
    overflow: hidden;
    position: absolute;
    text-overflow: ellipsis;
    top: 8px;
    left: 8px;
    right: 8px;
    user-select: none;
    white-space: nowrap;
    display: inline-block;
    pointer-events: none;
  }

  .EditorLexical_action {
    display: flex;
    align-items: center;
    justify-content: end;
  }

  .EditorLexical_submit {
    width: fit-content;
    align-self: flex-end;
  }
`;

const EditorLexical = props => {
  const Placeholder = () => {
    return <div className="EditorLexical_placeholder">What do you think?...</div>;
  };
  return (
    <>
      <StyledEditorLexical>
        <LexicalComposer initialConfig={editorConfig}>
          <div className="EditorLexical_container">
            <PlainTextPlugin
              contentEditable={<ContentEditable className="EditorLexical_root" />}
              placeholder={Placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <OnChangePlugin onChange={onChange} />
            {/* <OnChangePlugin
              onChange={(editorState, editor) => {
                editorState.read(() => {
                  const value = JSON.stringify(editorState); // or JSON.stringify(editorState.toJSON())
                  console.log(value + editor.getEditorState());
                });
              }}
            /> */}
            {/* <TreeViewPlugin /> */}
            {/* <TwitterPlugin /> */}
            <EmojisPlugin />
            <HistoryPlugin />
            <AutoLinkPlugin />
            <HashtagPlugin />
            <AutoEmbedPlugin />
            <MyCustomAutoFocusPlugin />
            <div className="EditorLexical_action">
              <EmojiToolbarButtonsLexical />
              <MultiUploader
                type={UPLOAD_TYPES.POST}
                isIcon={true}
                icon={<PictureOutlined />}
                buttonName=" "
                buttonType="text"
                showUploadList={false}
              />
            </div>
          </div>
          <CustomButtonSubmitPlugin onSubmit={value => props.onSubmit(value)} />
        </LexicalComposer>
      </StyledEditorLexical>
    </>
  );
};

export default EditorLexical;
