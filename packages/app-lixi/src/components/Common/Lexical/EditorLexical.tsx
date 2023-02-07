import React, { useEffect, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import TreeViewPlugin from './plugins/TreeViewPlugin';
// import EmoticonPlugin from './plugins/EmoticonPlugin';
import MyCustomAutoFocusPlugin from './plugins/MyCustomAutoFocusPlugin';
import editorConfig from './editorConfig';
import CustomButtonSubmitPlugin from './plugins/CustomButtonSubmitPlugin';
import onChange from './onChange';
import EmojisPlugin from './plugins/EmojisPlugin';
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import { MultiUploader } from '../Uploader/MultiUploader';
import { PictureOutlined } from '@ant-design/icons';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import styled from 'styled-components';
import LinkPlugin from './plugins/LinkPlugin';
import ButtonLinkPlugin from './plugins/ButtonLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import { Image } from 'antd';
import { useAppSelector } from '@store/hooks';
import { getPostCoverUploads } from '@store/account/selectors';

export type EditorLexicalProps = {
  initialContent?: string;
  isEditMode?: boolean;
  onSubmit?: (value) => void;
  loading?: boolean;
};

const StyledEditorLexical = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

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
    margin-bottom: 24px;
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
    justify-content: start;
  }

  .EditorLexical_submit {
    width: fit-content;
    align-self: flex-end;
    min-width: 140px;
    position: absolute;
    bottom: 0;
  }

  .EditorLexical_pictures {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 2rem;
  }
`;

const EditorLexical = (props: EditorLexicalProps) => {
  const { initialContent, onSubmit, isEditMode, loading } = props;
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const postCoverUploads = useAppSelector(getPostCoverUploads);
  const defaultHtmlString = `<p class="EditorLexical_paragraph"><br><br></p>`;

  console.log(initialContent);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const Placeholder = () => {
    return <div className="EditorLexical_placeholder">What do you think?...</div>;
  };
  return (
    <>
      <StyledEditorLexical>
        <LexicalComposer initialConfig={editorConfig}>
          <div className="EditorLexical_container">
            <PlainTextPlugin
              contentEditable={
                <div className="editor" ref={onRef}>
                  <ContentEditable className="EditorLexical_root" />
                </div>
              }
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
            <EmojisPlugin />
            <HistoryPlugin />
            <AutoLinkPlugin />
            <LinkPlugin />
            <HashtagPlugin />
            <AutoEmbedPlugin />
            <MyCustomAutoFocusPlugin
              initialContent={isEditMode || initialContent !== defaultHtmlString ? initialContent : ''}
            />
            {floatingAnchorElem && (
              <>
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
            <div className="EditorLexical_pictures">
              <Image.PreviewGroup>
                {postCoverUploads.map(item => {
                  const imageUrl = `${process.env.NEXT_PUBLIC_AWS_ENDPOINT}/${item.bucket}/${item.sha}`;
                  return (
                    <>
                      <Image loading="lazy" width={200} src={imageUrl} />
                    </>
                  );
                })}
              </Image.PreviewGroup>
            </div>
            <div className="EditorLexical_action">
              <EmojiPickerPlugin />
              <MultiUploader
                type={UPLOAD_TYPES.POST}
                isIcon={true}
                icon={'/images/ico-picture.svg'}
                buttonName=" "
                buttonType="text"
                showUploadList={false}
              />
              <ButtonLinkPlugin />
              <TwitterPlugin />
            </div>
          </div>
          <CustomButtonSubmitPlugin onSubmit={value => onSubmit(value)} loading={loading} isEditMode={isEditMode} />
        </LexicalComposer>
      </StyledEditorLexical>
    </>
  );
};

export default EditorLexical;
