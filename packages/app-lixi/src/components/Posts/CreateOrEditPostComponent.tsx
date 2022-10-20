import { Button, Form, Input, Select } from 'antd';
import isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getAllCountries, getAllStates } from '@store/country/selectors';
import { setPost } from '@store/post/action';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import { StyledUploader } from '@components/Common/Uploader';
import { showToast } from '@store/toast/actions';
import { getCountries, getStates } from '../../store/country/actions';
import { getPostCoverUpload } from 'src/store/account/selectors';
import _ from 'lodash';
import { getPostBySelectedAccount } from '@store/post/selectors';
import Image from 'next/image';
import { CreatePostInput, UpdatePostInput, Post } from 'src/generated/types.generated';
import { useCreatePostMutation, useUpdatePostMutation } from '@store/post/posts.generated';
import { useRouter } from 'next/router';
import { WrapperPost } from '@components/Settings';

const { TextArea } = Input;
const { Option } = Select;
type PostEditProps = {
  className?: string;
  isEditPost: boolean;
};
const CreateOrEditPostComponent = ({ isEditPost }: PostEditProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedPost = useAppSelector(getPostBySelectedAccount);

  const router = useRouter();

  const [
    createPostTrigger,
    { isLoading: isLoadingCreatePost, isSuccess: isSuccessCreatePost, isError: isErrorCreatePost }
  ] = useCreatePostMutation();
  const [
    updatePostTrigger,
    { isLoading: isLoadingUpdatePost, isSuccess: isSuccessUpdatePost, isError: isErrorUpdatePost }
  ] = useUpdatePostMutation();

  useEffect(() => {
    dispatch(getCountries());
  }, []);
  const countries = useAppSelector(getAllCountries);
  const states = useAppSelector(getAllStates);
  const cover = useAppSelector(getPostCoverUpload);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostContentIsValid, setNewPostContentIsValid] = useState(true);

  // New post cover
  const [newPostCover, setNewPostCover] = useState('');
  const [newPostCoverIsValid, setNewPostCoverIsValid] = useState(true);

  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const onFormLayoutChange = ({ disabled }: { disabled: boolean }) => {
    setComponentDisabled(disabled);
  };

  const handleNewPostCoverInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPostCover(value);
    setNewPostCoverIsValid(true);
  };

  const handleNewPostContentInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNewPostContent(value);
    setNewPostContentIsValid(true);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Only enable CreateLixi button if all form entries are valid
  let createPostFormDataIsValid = newPostContent;

  const handleOnCreateNewPost = async () => {
    if (!createPostFormDataIsValid && !selectedAccount.id) {
      dispatch(
        showToast('error', {
          message: intl.get('post.unableCreatePost'),
          description: intl.get('post.selectAccountFirst'),
          duration: 5
        })
      );
    }

    const createPostInput: CreatePostInput = {
      cover: cover?.id,
      content: newPostContent,
      pageId: ''
    };

    try {
      if (createPostInput) {
        const postCreated = await createPostTrigger({ input: createPostInput }).unwrap();
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('post.createPostSuccessful'),
            duration: 5
          })
        );
        const data = { pageAccountId: 0 };
        dispatch(setPost({ ...data, ...postCreated.createPost }));
        router.push(`/post/${postCreated.createPost.id}`);
      }
    } catch (error) {
      const message = intl.get('post.unableCreatePostServer');

      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }
  };

  const handleOnEditPost = async () => {
    const updatePostInput: UpdatePostInput = {
      id: selectedPost.id,
      cover: cover?.id,
      content: _.isEmpty(newPostContent) ? selectedPost?.content : newPostContent
    };

    try {
      const postUpdated = await updatePostTrigger({ input: updatePostInput }).unwrap();
      dispatch(
        showToast('success', {
          message: 'Success',
          description: intl.get('post.updatePostSuccessful'),
          duration: 5
        })
      );
      const data = { pageAccountId: 0 };

      dispatch(setPost({ ...data, ...postUpdated.updatePost }));
    } catch (error) {
      const message = intl.get('post.unableUpdatePost');

      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }
  };

  return (
    <>
      {selectedAccount && selectedAccount.address ? (
        <WrapperPost>
          <h3>{isEditPost ? intl.get('post.editPost') : intl.get('post.createNewPost')}</h3>

          {!selectedPost ? (
            // Create Post
            <Form layout="vertical" initialValues={{ disabled: componentDisabled }} onValuesChange={onFormLayoutChange}>
              <Form.Item label={intl.get('post.content')}>
                <TextArea defaultValue={selectedPost?.content} onChange={e => handleNewPostContentInput(e)} rows={4} />
              </Form.Item>
              <Form.Item
                name="cover"
                label={intl.get('post.cover')}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <StyledUploader type={UPLOAD_TYPES.PAGE_COVER} />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleOnCreateNewPost}
                  disabled={!createPostFormDataIsValid}
                >
                  {intl.get('post.createPost')}
                </Button>
              </Form.Item>
            </Form>
          ) : (
            // Edit Post
            <Form layout="vertical" initialValues={{ disabled: componentDisabled }} onValuesChange={onFormLayoutChange}>

              <Form.Item
                name="cover"
                label={intl.get('post.cover')}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                {selectedPost.cover && (
                  <Image src={(selectedPost.cover as any).upload.url} width="150px" height="150px" />
                )}
                <StyledUploader type={UPLOAD_TYPES.PAGE_COVER} />
              </Form.Item>

              <Form.Item label={intl.get('post.content')}>
                <TextArea defaultValue={selectedPost?.content} onChange={e => handleNewPostContentInput(e)} rows={4} />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                <Button type="primary" htmlType="submit" onClick={handleOnEditPost}>
                  {intl.get('post.editPost')}
                </Button>
              </Form.Item>
            </Form>
          )}
        </WrapperPost>
      ) : (
        intl.get('post.selectAccountFirst')
      )}
    </>
  );
};

export default CreateOrEditPostComponent;
