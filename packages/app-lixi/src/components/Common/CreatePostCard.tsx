import { PlusCircleOutlined } from '@ant-design/icons';
import { PatchCollection } from '@reduxjs/toolkit/dist/query/core/buildThunks';
import { getPostCoverUploads } from '@store/account/selectors';
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

const styles = {
  wrapper: {
    // display: 'flex'
  }
};

// const Editor = (props: PlateProps<MyValue>) => {
//   return (
//     <Plate {...props} id="main">
//       <MarkBalloonToolbar />
//     </Plate>
//   );
// };

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
  iframe {
    width: 100% !important;
  }
`;

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
});

const WrapEditor = styled.div`
  position: relative;
  z-index: -2;
`;

const CreateCardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  align-items: center;
  margin: 1rem 2px;
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

const StyledUploader = styled.div`
  position: absolute;
  bottom: 24px;
`;

type CreatePostCardProp = {
  pageId?: string;
  tokenId?: string;
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
  const { pageId, tokenId } = props;

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
    console.log(valueInput);
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

  const handleSubmitEditor = async value => {
    console.log('handleSubmitEditor');
    if (url) {
      console.log(url);
    } else {
      setEnableEditor(false);

      await handleCreateNewPost(value);
    }
  };

  const updatePost = async (tag: string, params, result: CreatePostMutation, pageId?: string, tokenId?: string) => {
    switch (tag) {
      case 'PostsByPageId':
        return dispatch(
          postApi.util.updateQueryData('PostsByPageId', { ...params, id: pageId }, draft => {
            console.log(draft);
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
          postApi.util.updateQueryData('PostsByTokenId', { ...params, id: tokenId }, draft => {
            draft.allPostsByTokenId.edges.unshift({
              cursor: result.createPost.id,
              node: {
                ...result.createPost
              }
            });
            draft.allPostsByTokenId.totalCount = draft.allPostsByTokenId.totalCount + 1;
          })
        );
      default:
        return dispatch(
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
    }
  };

  const handleCreateNewPost = async content => {
    if (content !== '' || !_.isNil(content)) {
      const createPostInput: CreatePostInput = {
        uploadCovers: postCoverUploads.map(upload => upload.id),
        content: content,
        pageId: pageId || undefined,
        tokenId: tokenId || undefined
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

        if (_.isNil(pageId) && _.isNil(tokenId)) {
          tag = PostsQueryTag.Posts;
        } else if (pageId) {
          tag = PostsQueryTag.PostsByPageId;
        } else if (tokenId) {
          tag = PostsQueryTag.PostsByTokenId;
        }

        const patches = updatePost(tag, params, result, pageId, tokenId);
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('post.createPostSuccessful'),
            duration: 5
          })
        );
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

  const handleImageUploadBefore = () => {
    alert("Please upload picture by 'Upload' button");
    return;
  };

  return (
    <>
      <CreateCardContainer onClick={() => setEnableEditor(!enableEditor)}>
        <div className="avatar">
          <Avatar size={50} style={{ color: '#fff', backgroundColor: '#bdbdbd' }}>
            ER
          </Avatar>
          <Input bordered={false} placeholder="What's on your mind?" />
        </div>
        <div className="btn-create">
          <PlusCircleOutlined />
        </div>
      </CreateCardContainer>
      <WrapEditor>
        <Modal
          className="custom-modal-editor"
          title="Create Post"
          visible={enableEditor}
          footer={null}
          onCancel={() => setEnableEditor(false)}
          destroyOnClose={true}
          maskClosable={false}
        >
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Create" key="create">
              {/* <Editor onSubmitPost={handleSubmitEditor} /> */}
              <EditorLexical onSubmit={value => handleCreateNewPost(value)} />
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
          </Tabs>
        </Modal>
      </WrapEditor>
    </>
  );
};

export default React.memo(CreatePostCard);
