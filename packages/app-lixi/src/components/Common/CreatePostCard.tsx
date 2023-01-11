import { PlusCircleOutlined, GlobalOutlined } from '@ant-design/icons';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getPostCoverUploads, getSelectedAccount } from '@store/account/selectors';
import { api as postApi, useCreatePostMutation } from '@store/post/posts.api';
import { CreatePostMutation, PostsByPageIdDocument } from '@store/post/posts.generated';
import { showToast } from '@store/toast/actions';
import { Avatar, Button, Input, Modal, Tabs } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import React, { useRef, useState } from 'react';
import intl from 'react-intl-universal';
import { CreatePostInput, OrderDirection, PostOrderField } from 'src/generated/types.generated';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styled from 'styled-components';
import 'suneditor/dist/css/suneditor.min.css'; // Import Sun Editor's CSS File
import SunEditorCore from 'suneditor/src/lib/core';
import Editor from './Editor';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { Embed, SocialsEnum } from './Embed';
import EditorLexical from './Lexical/EditorLexical';
import { removeAllUpload } from '@store/account/actions';

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
  iframe {
    width: 100% !important;
  }
`;

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

const MobileCreatePost = styled.div`
  display: none;
  @media (max-width: 968px) {
    display: block;
    position: fixed;
    right: 15px;
    bottom: 90px;
    .fab-btn {
      padding: 16px;
      background: #ffdbd1;
      border-radius: 16px;
    }
  }
`;

const WrapEditor = styled.div`
  position: relative;
  z-index: -2;
`;

const DesktopCreatePost = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  background: #fff;
  border-radius: 20px;
  align-items: center;
  margin: 1rem 0;
  border: 1px solid var(--boder-item-light);
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
  input {
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.5px;
  }
  @media (max-width: 968px) {
    display: none;
  }
`;

const UserCreate = styled.div`
  .user-create-post {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 24px;
    .user-info {
      .title-user {
        margin: 0;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0.15px;
        color: var(--text-color-on-background);
      }
      .btn-select {
        background: var(--boder-item-light);
        border-radius: 8px;
        padding: 0 8px;
        border: none;
        margin-top: 4px;
        span {
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.25px;
          color: #4e444b;
        }
      }
    }
  }
`;

type CreatePostCardProp = {
  pageId?: string;
  tokenPrimaryId?: string;
  userId?: string;
  refetch?: () => void;
};

const CreatePostCard = (props: CreatePostCardProp) => {
  const dispatch = useAppDispatch();
  const [url, setUrl] = useState<string>('');
  const [social, setSocial] = useState<SocialsEnum>();
  const [postId, setPostId] = useState<string>();
  const [error, setError] = useState<ErrorType | null>(null);
  const [enableEditor, setEnableEditor] = useState(false);
  const sunEditor = useRef<SunEditorCore>();
  const [valueEditor, setValue] = useState(null);
  const postCoverUploads = useAppSelector(getPostCoverUploads);
  const [importValue, setImportValue] = useState(null);
  const { pageId, tokenPrimaryId } = props;
  const selectedAccount = useAppSelector(getSelectedAccount);

  const getSunEditorInstance = (sunEditorCore: SunEditorCore) => {
    sunEditor.current = sunEditorCore;
  };

  const items = [
    { label: 'Create ', key: 'create', children: 'Content Create' }, // remember to pass the key prop
    { label: 'Import', key: 'import', children: 'Content Import' }
  ];

  const [
    createPostTrigger,
    { isLoading: isLoadingCreatePost, isSuccess: isSuccessCreatePost, isError: isErrorCreatePost }
  ] = useCreatePostMutation();

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
    event.preventDefault();

    const valueInput = sunEditor.current.getContents(true);
    setValue(valueInput);
    setEnableEditor(false);
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

  const handleOnLoad = (content, social) => {
    if (content) {
      setImportValue(content);
    }
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

  const updatePost = (tag: string, params, result: CreatePostMutation, pageId?: string, tokenPrimaryId?: string) => {
    dispatch(
      postApi.util.updateQueryData('Posts', params, draft => {
        draft.allPosts.edges.unshift({
          cursor: result.createPost.id,
          node: {
            ...result.createPost
          }
        });
        draft.allPosts.totalCount = draft.allPosts.totalCount + 1;
      })
    );
    switch (tag) {
      case 'PostsByPageId':
        return dispatch(
          postApi.util.updateQueryData('PostsByPageId', { ...params, id: pageId }, draft => {
            draft.allPostsByPageId.edges.unshift({
              cursor: result.createPost.id,
              node: {
                ...result.createPost
              }
            });
            draft.allPostsByPageId.totalCount = draft.allPostsByPageId.totalCount + 1;
          })
        );
      case 'PostsByTokenId':
        return dispatch(
          postApi.util.updateQueryData('PostsByTokenId', { ...params, id: tokenPrimaryId }, draft => {
            draft.allPostsByTokenId.edges.unshift({
              cursor: result.createPost.id,
              node: {
                ...result.createPost
              }
            });
            draft.allPostsByTokenId.totalCount = draft.allPostsByTokenId.totalCount + 1;
          })
        );
    }
  };

  const handleCreateNewPost = async ({ htmlContent, pureContent }) => {
    if (htmlContent !== '' || !_.isNil(htmlContent)) {
      const createPostInput: CreatePostInput = {
        uploadCovers: postCoverUploads.map(upload => upload.id),
        htmlContent: htmlContent,
        pureContent: pureContent,
        pageId: pageId || undefined,
        tokenPrimaryId: tokenPrimaryId || undefined
      };

      const params = {
        orderBy: {
          direction: OrderDirection.Desc,
          field: PostOrderField.UpdatedAt
        }
      };
      let patches: PatchCollection;
      try {
        const result = await createPostTrigger({ input: createPostInput }).unwrap();
        let tag: string;

        if (_.isNil(pageId) && _.isNil(tokenPrimaryId)) {
          tag = PostsQueryTag.Posts;
        } else if (pageId) {
          tag = PostsQueryTag.PostsByPageId;
        } else if (tokenPrimaryId) {
          tag = PostsQueryTag.PostsByTokenId;
        }

        const patches = updatePost(tag, params, result, pageId, tokenPrimaryId);
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('post.createPostSuccessful'),
            duration: 5
          })
        );

        setEnableEditor(false);
        dispatch(removeAllUpload());
      } catch (error) {
        const message = intl.get('post.unableCreatePostServer');
        if (patches) {
          dispatch(postApi.util.patchQueryData('Posts', params, patches.inversePatches));
        }
        dispatch(
          showToast('error', {
            message: 'Error',
            description: message,
            duration: 5
          })
        );
      }
    }
  };

  return (
    <>
      <DesktopCreatePost onClick={() => setEnableEditor(!enableEditor)}>
        <div className="avatar">
          <Avatar src="/images/anonymous-ava.svg" size={50} style={{ color: '#fff', backgroundColor: '#bdbdbd' }}>
            {/* ER */}
          </Avatar>
          <Input bordered={false} placeholder="What's on your mind?" value="" />
        </div>
        <div className="btn-create">
          <PlusCircleOutlined />
        </div>
      </DesktopCreatePost>

      <MobileCreatePost onClick={() => setEnableEditor(!enableEditor)}>
        <div className="fab-btn">
          <img src="/images/ico-create-post.svg" alt="" />
        </div>
      </MobileCreatePost>

      <WrapEditor>
        <Modal
          className="custom-modal-editor"
          title="Create Post"
          visible={enableEditor}
          footer={null}
          onCancel={() => setEnableEditor(false)}
        >
          <>
            <UserCreate>
              <div className="user-create-post">
                <img src="/images/xpi.svg" alt="" />
                <div className="user-info">
                  <p className="title-user">{selectedAccount?.name}</p>
                  <Button className="btn-select">
                    Public <GlobalOutlined />
                  </Button>
                </div>
              </div>
              <EditorLexical onSubmit={value => handleCreateNewPost(value)} />
            </UserCreate>
            {/* TODO: import link  */}
            {/* <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Create" key="create">
              </Tabs.TabPane>
              <Tabs.TabPane tab="Import" key="import">
                <form onSubmit={handleSubmit}>
                  <label>Link to post</label>
                  <input className="input-import" placeholder="Please type link..." onChange={handleUrlChange} />
                </form>
                {!error && social && postId && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginTop: '2rem' }}>Post Preview</h3>
                    <Preview>
                      <Embed
                        social={social}
                        postId={postId}
                        url={url}
                        onError={handleOnError}
                        onLoad={e => handleOnLoad(e, social)}
                      />
                    </Preview>
                    <Button
                      style={{ marginTop: '1rem', alignSelf: 'end' }}
                      type="primary"
                      disabled={importValue ? false : true}
                      onClick={() => handleCreateNewPost(importValue)}
                    >
                      Create Post
                    </Button>
                  </div>
                )}
              </Tabs.TabPane>
            </Tabs> */}
          </>
        </Modal>
      </WrapEditor>
    </>
  );
};

export default React.memo(CreatePostCard);
