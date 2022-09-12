import { Button, Form, Input, Select } from 'antd';
import isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getAllCountries, getAllStates } from '@store/country/selectors';
import { setPage } from '@store/page/action';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import { StyledUploader } from '@components/Common/Uploader';
import { showToast } from '@store/toast/actions';
import { getCountries, getStates } from '../../store/country/actions';
import { getPageCoverUpload, getPageAvatarUpload } from 'src/store/account/selectors';
import _ from 'lodash';
import { getPageBySelectedAccount } from '@store/page/selectors';
import Image from 'next/image';
import { CreatePageInput, UpdatePageInput, Page } from 'src/generated/types.generated';
import { useCreatePageMutation, useUpdatePageMutation } from '@store/page/pages.generated';
import { useRouter } from 'next/router';
import { WrapperPage } from '@components/Settings';

const { TextArea } = Input;
const { Option } = Select;
type PageEditProps = {
  className?: string;
  isEditPage: boolean;
};
const CreateOrEditPageComponent = ({ isEditPage }: PageEditProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const selectedPage = useAppSelector(getPageBySelectedAccount);

  const router = useRouter();

  const [
    createPageTrigger,
    { isLoading: isLoadingCreatePage, isSuccess: isSuccessCreatePage, isError: isErrorCreatePage }
  ] = useCreatePageMutation();
  const [
    updatePageTrigger,
    { isLoading: isLoadingUpdatePage, isSuccess: isSuccessUpdatePage, isError: isErrorUpdatePage }
  ] = useUpdatePageMutation();

  useEffect(() => {
    dispatch(getCountries());
  }, []);
  const countries = useAppSelector(getAllCountries);
  const states = useAppSelector(getAllStates);
  const avatar = useAppSelector(getPageAvatarUpload);
  const cover = useAppSelector(getPageCoverUpload);

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

  // Only enable CreateLixi button if all form entries are valid
  let createPageFormDataIsValid = newPageName && newPageTitle;

  const handleOnCreateNewPage = async () => {
    if (!createPageFormDataIsValid && !selectedAccount.id) {
      dispatch(
        showToast('error', {
          message: intl.get('page.unableCreatePage'),
          description: intl.get('page.selectAccountFirst'),
          duration: 5
        })
      );
    }

    const createPageInput: CreatePageInput = {
      name: newPageName,
      title: newPageTitle,
      description: newPageDescription,
      website: newPageWebsite,
      country: newPageCountry,
      state: newPageState,
      address: newPageAddress,
      avatar: avatar?.id,
      cover: cover?.id,
      parentId: null
    };

    try {
      if (createPageInput) {
        const pageCreated = await createPageTrigger({ input: createPageInput }).unwrap();
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('page.createPageSuccessful'),
            duration: 5
          })
        );
        dispatch(setPage({ ...pageCreated.createPage }));
        router.push(`/page/${pageCreated.createPage.id}`);
      }
    } catch (error) {
      const message = intl.get('page.unableCreatePageServer');

      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }
  };

  const handleOnEditPage = async () => {
    const updatePageInput: UpdatePageInput = {
      id: selectedPage.id,
      name: _.isEmpty(newPageName) ? selectedPage?.name : newPageName,
      title: _.isEmpty(newPageTitle) ? selectedPage?.title : newPageTitle,
      description: _.isEmpty(newPageDescription) ? selectedPage?.description : newPageDescription,
      website: _.isEmpty(newPageWebsite) ? selectedPage?.website : newPageWebsite,
      country: _.isEmpty(newPageCountry) ? selectedPage?.country : newPageCountry,
      state: _.isEmpty(newPageState) ? selectedPage?.state : newPageState,
      address: _.isEmpty(newPageAddress) ? selectedPage?.address : newPageAddress,
      avatar: avatar?.id,
      cover: cover?.id
    };

    try {
      const pageUpdated = await updatePageTrigger({ input: updatePageInput }).unwrap();
      dispatch(
        showToast('success', {
          message: 'Success',
          description: intl.get('page.updatePageSuccessful'),
          duration: 5
        })
      );
      dispatch(setPage({ ...pageUpdated.updatePage }));
    } catch (error) {
      const message = intl.get('page.unableUpdatePage');

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
      <WrapperPage>
        <h3>{isEditPage ? intl.get('page.editPage') : intl.get('page.createNewPage')}</h3>

        {!selectedPage ? (
          // Create Page
          <Form
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 24 }}
            layout="horizontal"
            initialValues={{ disabled: componentDisabled }}
            onValuesChange={onFormLayoutChange}
          >
            <Form.Item
              name="name"
              label={intl.get('page.name')}
              rules={[{ required: true, message: intl.get('page.inputName') }]}
            >
              <Input defaultValue={newPageName} onChange={e => handleNewPageNameInput(e)} />
            </Form.Item>
            <Form.Item
              name="title"
              label={intl.get('page.title')}
              rules={[{ required: true, message: intl.get('page.inputTitle') }]}
            >
              <Input onChange={e => handleNewPageTitleInput(e)} />
            </Form.Item>
            <Form.Item name="walletAddress" label={intl.get('page.walletAddress')}>
              <Input defaultValue={selectedAccount.address} disabled />
            </Form.Item>
            <Form.Item
              name="avatar"
              label={intl.get('page.avatar')}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <StyledUploader type={UPLOAD_TYPES.PAGE_AVATAR} />
            </Form.Item>
            <Form.Item
              name="cover"
              label={intl.get('page.cover')}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
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
            {newPageCountry != '' && (
              <Form.Item>
                <Select
                  showSearch
                  onChange={handleChangeState}
                  style={{ width: 200 }}
                  placeholder={intl.get('page.state')}
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
                  {states.map(state => (
                    <Option key={state.id}>{state.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}

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
        ) : (
          // Edit Page
          <Form
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 24 }}
            layout="horizontal"
            initialValues={{ disabled: componentDisabled }}
            onValuesChange={onFormLayoutChange}
          >
            <Form.Item name="name">
              <Input
                addonBefore={intl.get('page.name')}
                defaultValue={selectedPage.name}
                value={selectedPage.name}
                onChange={e => handleNewPageNameInput(e)}
              />
            </Form.Item>
            <Form.Item name="title">
              <Input
                addonBefore={intl.get('page.title')}
                defaultValue={selectedPage.title}
                onChange={e => handleNewPageTitleInput(e)}
              />
            </Form.Item>
            <Form.Item name="walletAddress">
              <Input addonBefore={intl.get('page.walletAddress')} defaultValue={selectedAccount.address} disabled />
            </Form.Item>
            <Form.Item
              name="avatar"
              label={intl.get('page.avatar')}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              {selectedPage.avatar && (
                <Image src={(selectedPage.avatar as any).upload.url} width="150px" height="150px" />
              )}
              <StyledUploader type={UPLOAD_TYPES.PAGE_AVATAR} />
            </Form.Item>
            <Form.Item
              name="cover"
              label={intl.get('page.cover')}
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              {selectedPage.cover && (
                <Image src={(selectedPage.cover as any).upload.url} width="150px" height="150px" />
              )}
              <StyledUploader type={UPLOAD_TYPES.PAGE_COVER} />
            </Form.Item>
            <Form.Item name="website">
              <Input
                addonBefore={intl.get('page.website')}
                defaultValue={selectedPage.website}
                value={selectedPage.website}
                onChange={e => handleNewPageWebsiteInput(e)}
              />
            </Form.Item>
            <Form.Item label={intl.get('page.description')}>
              <TextArea
                defaultValue={selectedPage.description}
                onChange={e => handleNewPageDescriptionInput(e)}
                rows={4}
              />
            </Form.Item>

            {/* Country */}
            <Form.Item>
              <Select
                showSearch
                defaultValue={selectedPage.country}
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
            <Form.Item>
              <Select
                showSearch
                defaultValue={selectedPage.state}
                onChange={handleChangeState}
                style={{ width: 200 }}
                placeholder={intl.get('page.state')}
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
                {states.map(state => (
                  <Option key={state.id}>{state.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Input
                addonBefore={intl.get('page.address')}
                defaultValue={selectedPage.address}
                onChange={e => handleNewPageAddressInput(e)}
              />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
              <Button type="primary" htmlType="submit" onClick={handleOnEditPage}>
                {intl.get('page.editPage')}
              </Button>
            </Form.Item>
          </Form>
        )}
      </WrapperPage>
    </>
  );
};

export default CreateOrEditPageComponent;
