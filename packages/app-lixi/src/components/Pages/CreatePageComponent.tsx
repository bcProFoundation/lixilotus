import { Button, Form, Input, Select } from 'antd';
import isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { CreatePageCommand, EditPageCommand } from '@bcpros/lixi-models';
import { getAllCountries, getAllStates, getAllStatesByCountry } from '@store/country/selectors';
import { editPage, postPage } from '@store/page/action';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import { StyledUploader } from '@components/Common/Uploader';
import { showToast } from '@store/toast/actions';
import { getCountries, getStates } from '../../store/country/actions';
import { getPageCoverUpload, getPageAvatarUpload } from 'src/store/account/selectors';
import _ from 'lodash';

const { TextArea } = Input;
const { Option } = Select;

const CreatePageComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  // const pages = useAppSelector(getPagesBySelectedAccount);
  const selectedAccount = useAppSelector(getSelectedAccount);

  useEffect(() => {
    dispatch(getCountries());
  }, []);
  const countries = useAppSelector(getAllCountries);
  const states = useAppSelector(getAllStates);
  const avatar = useAppSelector(getPageAvatarUpload);
  const cover = useAppSelector(getPageCoverUpload);

  const page = selectedAccount.page;

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

  // New page website
  const [newPageWebsite, setNewPageWebsite] = useState('');
  const [newPageWebsiteIsValid, setNewPageWebsiteIsValid] = useState(true);

  // New page avatar
  const [newPageAvatar, setNewPageAvatar] = useState('');
  const [newPageAvatarIsValid, setNewPageAvatarIsValid] = useState(true);

  // New page cover
  const [newPageCover, setNewPageCover] = useState('');
  const [newPageCoverIsValid, setNewPageCoverIsValid] = useState(true);

  // New page country
  const [newPageCountry, setNewPageCountry] = useState('');
  const [newPageCountryIsValid, setNewPageCountryIsValid] = useState(true);

  // New page state
  const [newPageState, setNewPageState] = useState('');
  const [newPageStateIsValid, setNewPageStateIsValid] = useState(true);

  // New page address
  const [newPageAddress, setNewPageAddress] = useState('');
  const [newPageAddressIsValid, setNewPageAddressIsValid] = useState(true);

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

  const handleChangeCountry = (value: string) => {
    setNewPageCountry(value);
    if (value && !isEmpty(value)) {
      setNewPageCountryIsValid(true);
    }
    dispatch(getStates(value));
  };

  const handleChangeState = (value: string) => {
    setNewPageState(value);
    if (value && !isEmpty(value)) {
      setNewPageStateIsValid(true);
    }
  };

  const handleNewPageAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageAddress(value);
    setNewPageAddressIsValid(true);
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
  let createPageFormDataIsValid = newPageName && newPageTitle;

  const handleOnCreateNewPage = () => {
    if (!createPageFormDataIsValid && !selectedAccount.id) {
      dispatch(
        showToast('error', {
          message: intl.get('page.unableCreatePage'),
          description: intl.get('page.selectAccountFirst'),
          duration: 5
        })
      );
    }

    const valueCreatePage: CreatePageCommand = {
      name: newPageName,
      title: newPageTitle,
      description: newPageDescription,
      website: newPageWebsite,
      country: newPageCountry,
      state: newPageState,
      address: newPageAddress,
      avatar: avatar?.id,
      cover: cover?.id
    };
    if (valueCreatePage) dispatch(postPage(valueCreatePage));
  };

  const handleOnEditPage = () => {
    const valueEditPage: EditPageCommand = {
      id: selectedAccount.page.id,
      name: _.isEmpty(newPageName) ? page.name : newPageName,
      title: _.isEmpty(newPageTitle) ? page.title : newPageTitle,
      description: _.isEmpty(newPageDescription) ? page.description : newPageDescription,
      website: _.isEmpty(newPageWebsite) ? page.website : newPageWebsite,
      country: _.isEmpty(newPageCountry) ? page.country : newPageCountry,
      state: _.isEmpty(newPageState) ? page.state : newPageState,
      address: _.isEmpty(newPageAddress) ? page.address : newPageAddress,
      avatar: avatar?.id ?? page.avatar,
      cover: cover?.id ?? page.cover
    };
    valueEditPage && dispatch(editPage(valueEditPage));
  };

  return (
    <>
      <h3>{selectedAccount.page ? intl.get('page.editPage') : intl.get('page.createNewPage')}</h3>

      {!selectedAccount.page ?
        // Create Page
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 24 }}
          layout="horizontal"
          initialValues={{ disabled: componentDisabled }}
          onValuesChange={onFormLayoutChange}
        >
          <Form.Item name="name" label={intl.get('page.name')} rules={[{ required: true, message: intl.get('page.inputName') }]}>
            <Input defaultValue={newPageName} onChange={e => handleNewPageNameInput(e)} />
          </Form.Item>
          <Form.Item name="title" label={intl.get('page.title')} rules={[{ required: true, message: intl.get('page.inputTitle') }]}>
            <Input onChange={e => handleNewPageTitleInput(e)} />
          </Form.Item>
          <Form.Item name="walletAddress" label={intl.get('page.walletAddress')}>
            <Input defaultValue={selectedAccount.address} disabled />
          </Form.Item>
          <Form.Item name="avatar" label={intl.get('page.avatar')} valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader type={UPLOAD_TYPES.PAGE_AVATAR} />
          </Form.Item>
          <Form.Item name="cover" label={intl.get('page.cover')} valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader type={UPLOAD_TYPES.PAGE_COVER} />
          </Form.Item>
          <Form.Item name="website" label={intl.get('page.website')}>
            <Input onChange={e => handleNewPageWebsiteInput(e)} />
          </Form.Item>
          <Form.Item label={intl.get('page.description')}>
            <TextArea onChange={e => handleNewPageDescriptionInput(e)} rows={4} />
          </Form.Item>

          {/* Country */}
          <Form.Item>
            <Select
              showSearch
              onChange={handleChangeCountry}
              style={{ width: 200 }}
              placeholder={intl.get('page.country')}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option!.children as unknown as string).toLocaleLowerCase().includes(input)
              }
              filterSort={(optionA, optionB) =>
                (optionA!.children as unknown as string)
                  .toLowerCase()
                  .localeCompare((optionB!.children as unknown as string).toLowerCase())
              }
            >
              {countries.map(country => (
                <Option key={country.id}>{country.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* State */}
          {newPageCountry != '' &&
            <Form.Item>
              <Select
                showSearch
                onChange={handleChangeState}
                style={{ width: 200 }}
                placeholder={intl.get('page.state')}
                optionFilterProp="children"
                filterOption={(input, option) => (option!.children as unknown as string).toLocaleLowerCase().includes(input)}
                filterSort={(optionA, optionB) =>
                  (optionA!.children as unknown as string)
                    .toLowerCase()
                    .localeCompare((optionB!.children as unknown as string).toLowerCase())
                }
              >
                {states.map(state => (
                  <Option key={state.id}>{state.name}</Option>
                ))}
              </Select>
            </Form.Item>
          }

          <Form.Item>
            <Input
              addonBefore={intl.get('page.address')}
              value={newPageAddress}
              onChange={e => handleNewPageAddressInput(e)}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleOnCreateNewPage}
              disabled={!createPageFormDataIsValid}
            >
              {intl.get('page.createPage')}
            </Button>
          </Form.Item>
        </Form>
        :
        // Edit Page
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 24 }}
          layout="horizontal"
          initialValues={{ disabled: componentDisabled }}
          onValuesChange={onFormLayoutChange}
        >
          <Form.Item name="name">
            <Input addonBefore={intl.get('page.name')} defaultValue={page.name} value={page.name} onChange={e => handleNewPageNameInput(e)} />
          </Form.Item>
          <Form.Item name="title" >
            <Input addonBefore={intl.get('page.title')} defaultValue={page.title} onChange={e => handleNewPageTitleInput(e)} />
          </Form.Item>
          <Form.Item name="walletAddress">
            <Input addonBefore={intl.get('page.walletAddress')} defaultValue={selectedAccount.address} disabled />
          </Form.Item>
          <Form.Item name="avatar" label={intl.get('page.avatar')} valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader type={UPLOAD_TYPES.PAGE_AVATAR} />
          </Form.Item>
          <Form.Item name="cover" label={intl.get('page.cover')} valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader type={UPLOAD_TYPES.PAGE_COVER} />
          </Form.Item>
          <Form.Item name="website">
            <Input addonBefore={intl.get('page.website')} defaultValue={page.website} value={page.website} onChange={e => handleNewPageWebsiteInput(e)} />
          </Form.Item>
          <Form.Item label={intl.get('page.description')}>
            <TextArea defaultValue={page.description} onChange={e => handleNewPageDescriptionInput(e)} rows={4} />
          </Form.Item>

          {/* Country */}
          <Form.Item>
            <Select
              showSearch
              defaultValue={page.country}
              onChange={handleChangeCountry}
              style={{ width: 200 }}
              placeholder={intl.get('page.country')}
              optionFilterProp="children"
              filterOption={(input, option) => (option!.children as unknown as string).toLocaleLowerCase().includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA!.children as unknown as string)
                  .toLowerCase()
                  .localeCompare((optionB!.children as unknown as string).toLowerCase())
              }
            >
              {countries.map(country => (
                <Option key={country.id}>{country.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* State */}
          <Form.Item>
            <Select
              showSearch
              defaultValue={page.state}
              onChange={handleChangeState}
              style={{ width: 200 }}
              placeholder={intl.get('page.state')}
              optionFilterProp="children"
              filterOption={(input, option) => (option!.children as unknown as string).toLocaleLowerCase().includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA!.children as unknown as string)
                  .toLowerCase()
                  .localeCompare((optionB!.children as unknown as string).toLowerCase())
              }
            >
              {states.map(state => (
                <Option key={state.id}>{state.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Input
              addonBefore={intl.get('page.address')}
              defaultValue={page.address}
              onChange={e => handleNewPageAddressInput(e)}
            />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleOnEditPage}
            >
              {intl.get('page.editPage')}
            </Button>
          </Form.Item>
        </Form>
      }

    </>
  );
};

export default CreatePageComponent;
