import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import MyCustomAutoFocusPlugin from './plugins/MyCustomAutoFocusPlugin';
import editorConfig from './editorConfig';
import CustomButtonSubmitPlugin from './plugins/CustomButtonSubmitPlugin';
import onChange from './onChange';
import EmojisPlugin from './plugins/EmojisPlugin';
import TwitterPlugin from './plugins/TwitterPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin';
import { MultiUploader } from '../Uploader/MultiUploader';
import { PictureOutlined, CloseOutlined } from '@ant-design/icons';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import styled from 'styled-components';
import LinkPlugin from './plugins/LinkPlugin';
import ButtonLinkPlugin from './plugins/ButtonLinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import { Image, Button } from 'antd';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getPostCoverUploads } from '@store/account/selectors';
import Gallery from 'react-photo-gallery';
import intl from 'react-intl-universal';
import { removeUpload } from '@store/account';
import useWindowDimensions from '@hooks/useWindowDimensions';
import YouTubePlugin from './plugins/YouTubePlugin';
import FigmaPlugin from './plugins/FigmaPlugin';

export type EditorLexicalProps = {
  initialContent?: string;
  isEditMode?: boolean;
  onSubmit?: (value) => void;
  loading?: boolean;
  hashtags?: string[];
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
    iframe {
      max-width: 100%;
    }
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

    .ant-btn-icon {
      .anticon-twitter {
        font-size: 26px;
      }
    }
  }

  .EditorLexical_submit {
    width: fit-content;
    align-self: flex-end;
    min-width: 140px;
    position: absolute;
    bottom: 0;
  }

  .EditorLexical_pictures {
    max-width: 100%;
    margin-bottom: 2rem;
    .images-post-mobile {
      display: flex;
      overflow-x: auto;
      gap: 5px;
      -ms-overflow-style: none; // Internet Explorer 10+
      scrollbar-width: none; // Firefox
      ::-webkit-scrollbar {
        display: none; // Safari and Chrome
      }
      img {
        width: auto;
        max-width: 75vw !important;
        height: 40vh;
        object-fit: cover;
        border-radius: var(--border-radius-primary);
        border: 1px solid var(--lt-color-gray-100);
      }
      &.only-one-image {
        justify-content: center;
        img {
          width: 100%;
          max-width: 100%;
        }
      }
    }
    .item-image-upload {
      position: relative;
      button {
        position: absolute;
        z-index: 9;
        right: 0;
        background: #303031;
        margin: 4px;
        .anticon {
          color: #fff;
        }
      }
    }
    .react-photo-gallery--gallery > div {
      gap: 5px;
    }
  }
`;

const EditorLexical = (props: EditorLexicalProps) => {
  const { initialContent, onSubmit, isEditMode, loading, hashtags } = props;
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const [isMobile, setIsMobile] = useState(false);
  const postCoverUploads = useAppSelector(getPostCoverUploads);
  const imagesList = postCoverUploads.map(img => {
    const imgUrl = `${process.env.NEXT_PUBLIC_CF_IMAGES_DELIVERY_URL}/${process.env.NEXT_PUBLIC_CF_ACCOUNT_HASH}/${img.cfImageId}/public`;
    let width = img?.width || 4;
    let height = img?.height || 3;
    let id = img?.id || null;
    let objImg = {
      src: imgUrl,
      width: width,
      height: height,
      id: id
    };
    return objImg;
  });
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [currentContent, setCurrentContent] = useState<String>('');

  useEffect(() => {
    const isMobile = width < 960 ? true : false;
    setIsMobile(isMobile);
  }, [width]);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const Placeholder = () => {
    return <div className="EditorLexical_placeholder">{intl.get('general.createPost')}</div>;
  };

  const setInitialContent = (hashtags: string[], initialContent: string, isEditMode: boolean) => {
    if (isEditMode) {
      return initialContent;
    }

    if (hashtags.length > 0) {
      return hashtags.join(' ');
    }

    return '';
  };

  const handleRemove = imgId => {
    if (imgId) {
      dispatch(removeUpload({ type: 'post', id: imgId }));
    }
  };

  const imageRenderer = useCallback(({ photo }) => {
    return (
      <>
        <div className="item-image-upload">
          <Button
            type="text"
            className="no-border-btn"
            icon={<CloseOutlined />}
            onClick={() => handleRemove(photo?.id)}
          />
          <Image src={photo?.src} width={photo?.width} height={photo?.height} />
        </div>
      </>
    );
  }, []);

  const setUploadingImage = state => {
    setIsUploadingImage(state);
  };
  const setContent = content => {
    setCurrentContent(content);
  };

  return (
    <React.Fragment>
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
            <OnChangePlugin onChange={editorState => onChange(editorState, setContent)} />
            {/* <TreeViewPlugin /> */}
            <TwitterPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            <EmojisPlugin />
            <HistoryPlugin />
            <AutoLinkPlugin />
            <LinkPlugin />
            <HashtagPlugin />
            <AutoEmbedPlugin />
            <YouTubePlugin />
            <FigmaPlugin />
            <MyCustomAutoFocusPlugin
              initialContent={setInitialContent(hashtags, initialContent, isEditMode)}
              hashtags={hashtags}
            />
            {floatingAnchorElem && (
              <>
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
            <div className="EditorLexical_pictures">
              {isMobile ? (
                <>
                  {imagesList.length > 1 && (
                    <div className="images-post images-post-mobile">
                      {imagesList.map((img, index) => {
                        return (
                          <div className="item-image-upload">
                            <Image key={index} src={img.src || 'error'} fallback="/images/default-image-fallback.png" />
                            <Button
                              type="text"
                              className="no-border-btn"
                              icon={<CloseOutlined />}
                              onClick={() => handleRemove(img?.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {imagesList.length === 1 && (
                    <>
                      <div className="images-post images-post-mobile only-one-image">
                        {imagesList.map((img, index) => {
                          return (
                            <div className="item-image-upload">
                              <Image
                                key={index}
                                src={img.src || 'error'}
                                fallback="/images/default-image-fallback.png"
                              />
                              <Button
                                type="text"
                                className="no-border-btn"
                                icon={<CloseOutlined />}
                                onClick={() => handleRemove(img?.id)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Gallery renderImage={imageRenderer} photos={imagesList} />
              )}
            </div>
            <div className="EditorLexical_action">
              <MultiUploader
                type={UPLOAD_TYPES.POST}
                isIcon={true}
                icon={'/images/ico-picture.svg'}
                buttonName=" "
                buttonType="text"
                showUploadList={false}
                loading={isUploadingImage}
                setUploadingImage={setUploadingImage}
              />
              <ButtonLinkPlugin />
            </div>
          </div>
          <CustomButtonSubmitPlugin
            onSubmit={value => onSubmit(value)}
            loading={loading || isUploadingImage}
            isEditMode={isEditMode}
            currentContent={currentContent}
            image={postCoverUploads}
          />
        </LexicalComposer>
      </StyledEditorLexical>
    </React.Fragment>
  );
};

export default EditorLexical;
