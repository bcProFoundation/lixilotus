import { UploadOutlined } from '@ant-design/icons';
import { showToast } from '@store/toast/actions';
import intl from 'react-intl-universal';
import { Button, Form, Input, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getLixiesBySelectedAccount } from 'src/store/lixi/selectors';
import { pagesByAccountId } from 'src/store/page/selectors';
import { AppContext } from 'src/store/store';
import { CreatePageCommand } from '@bcpros/lixi-models/src';
import { getPagesByAccountId, postPage } from '@store/page/action';
import {} from 'src/store/page/selectors';
import styled from 'styled-components';
import { StyledPageImageUploader } from './PageImageUploader';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';

const { TextArea } = Input;

const CreatePageComponent: React.FC = isEditPage => {
  const ContextValue = React.useContext(AppContext);
  const pagesByAccountIdList = useAppSelector(pagesByAccountId);

  // Page account id
  const [pageAccountId, setPageAccountId] = useState(null);
  const [pageAccountIdIsValid, setPageAccountIdIsValid] = useState(true);

  // New page name
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameIsValid, setNewPageNameIsValid] = useState(true);

  // New page title
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageTitleIsValid, setNewPageTitleIsValid] = useState(true);

  // New page handle id
  const [newPageHandleId, setNewPageHandleId] = useState('');
  const [newPageHandleIdIsValid, setNewPageHandleIdIsValid] = useState(true);

  // New page parent id
  const [newPageParentId, setNewPageParentId] = useState('');
  const [newPageParentIdIsValid, setNewPageParentIdIsValid] = useState(true);

  // New page description
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newPageDescriptionIsValid, setNewPageDescriptionIsValid] = useState(true);

  // New page address
  const [newPageAddress, setNewPageAddress] = useState('');
  const [newPageAddressIsValid, setNewPageAddressIsValid] = useState(true);

  // New page website
  const [newPageWebsite, setNewPageWebsite] = useState('');
  const [newPageWebsiteIsValid, setNewPageWebsiteIsValid] = useState(true);

  // New page avatar
  const [newPageAvatar, setNewPageAvatar] = useState('');
  const [newPageAvatarIsValid, setNewPageAvatarIsValid] = useState(true);

  // New page cover
  const [newPageCover, setNewPageCover] = useState('');
  const [newPageCoverIsValid, setNewPageCoverIsValid] = useState(true);

  const dispatch = useAppDispatch();
  const lixies = useAppSelector(getLixiesBySelectedAccount);
  // const pages = useAppSelector(getPagesBySelectedAccount);
  const selectedAccount = useAppSelector(getSelectedAccount);

  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const onFormLayoutChange = ({ disabled }: { disabled: boolean }) => {
    setComponentDisabled(disabled);
  };

  const handleNewPageNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageName(value);
    setNewPageNameIsValid(true);
  };
  const handleNewPageTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageTitle(value);
    setNewPageTitleIsValid(true);
  };

  const handleNewPageAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageAddress(value);
    setNewPageAddressIsValid(true);
  };

  const handleNewPageAvatarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageAvatar(value);
    setNewPageAvatarIsValid(true);
  };

  const handleNewPageCoverInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageCover(value);
    setNewPageCoverIsValid(true);
  };

  const handleNewPageDescriptionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNewPageDescription(value);
    setNewPageDescriptionIsValid(true);
  };

  const handleNewPageWebsiteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageWebsite(value);
    setNewPageWebsiteIsValid(true);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    // dispatch(getEnvelopes());
    // if (selectedAccount) {
    //   dispatch(getAccount(selectedAccount.id));
    //   dispatch(refreshLixiListSilent(selectedAccount?.id));
    // }
    // dispatch(getPagesByAccountId(selectedAccount));
  }, []);

  //   const refreshList = () => {
  //     dispatch(refreshLixiList(selectedAccount?.id));
  //   };

  // Only enable CreateLixi button if all form entries are valid
  let createPageFormDataIsValid = pageAccountIdIsValid;

  const handleOnCreateNewPage = () => {
    if (!createPageFormDataIsValid && !selectedAccount.id) {
      dispatch(
        showToast('error', {
          message: intl.get('account.unableCreateLixi'),
          description: intl.get('account.selectLixiFirst'),
          duration: 5
        })
      );
    }

    const valueCreatePage: CreatePageCommand = {
      name: newPageName,
      title: newPageTitle,
      description: newPageDescription,
      address: newPageAddress,
      website: newPageWebsite
    };
    if (valueCreatePage) dispatch(postPage(valueCreatePage));
  };

  return (
    <>
      <h3>{isEditPage ? 'Edit page' : 'Create new page'}</h3>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 24 }}
        layout="horizontal"
        initialValues={{ disabled: componentDisabled }}
        onValuesChange={onFormLayoutChange}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input name' }]}>
          <Input defaultValue={newPageName} onChange={e => handleNewPageNameInput(e)} />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input title' }]}>
          <Input onChange={e => handleNewPageTitleInput(e)} />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input address' }]}>
          <Input onChange={e => handleNewPageAddressInput(e)} />
        </Form.Item>
        <Form.Item
          name="avatar"
          label="Avatar"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <StyledPageImageUploader type={UPLOAD_TYPES.PAGE_AVATAR}/>
        </Form.Item>
        <Form.Item
          name="cover"
          label="Cover"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <StyledPageImageUploader type={UPLOAD_TYPES.PAGE_COVER}/>
        </Form.Item>
        <Form.Item name="website" label="Website">
          <Input onChange={e => handleNewPageWebsiteInput(e)} />
        </Form.Item>
        <Form.Item label="Description">
          <TextArea onChange={e => handleNewPageDescriptionInput(e)} rows={4} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={handleOnCreateNewPage}
            disabled={!createPageFormDataIsValid}
          >
            Create page
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default CreatePageComponent;
