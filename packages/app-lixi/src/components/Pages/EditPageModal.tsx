import { Button, Col, Form, Input, Modal, Row, Select } from 'antd';
import isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from 'src/store/account/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getAllCountries, getAllStates } from '@store/country/selectors';
import { setPage } from '@store/page/action';
import { showToast } from '@store/toast/actions';
import { getCountries, getStates } from '../../store/country/actions';
import _ from 'lodash';
import Image from 'next/image';
import { UpdatePageInput, Page } from 'src/generated/types.generated';
import { api as pageApi, useUpdatePageMutation } from '@store/page/pages.generated';
import styled from 'styled-components';
import { closeModal } from '@store/modal/actions';
import { CreateForm } from '@components/Lixi/CreateLixiFormModal';
import { getAllCategories } from '@store/category/selectors';

const { TextArea } = Input;
const { Option } = Select;

type EditPageModalProps = {
  page: Page;
} & React.HTMLProps<HTMLElement>;

export const EditPageModal: React.FC<EditPageModalProps> = ({ page, disabled }: EditPageModalProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);

  const [
    updatePageTrigger,
    { isLoading: isLoadingUpdatePage, isSuccess: isSuccessUpdatePage, isError: isErrorUpdatePage, error: errorOnUpdate }
  ] = useUpdatePageMutation();

  useEffect(() => {
    dispatch(getCountries());
  }, []);
  const categories = useAppSelector(getAllCategories);
  const countries = useAppSelector(getAllCountries);
  const states = useAppSelector(getAllStates);

  // New page name
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameIsValid, setNewPageNameIsValid] = useState(true);

  // New page category
  const [newPageCategory, setNewPageCategory] = useState('');
  const [newPageCategoryIsValid, setNewPageCategoryIsValid] = useState(true);

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

  const handleChangeCategory = (value: string) => {
    setNewPageCategory(value);
    if (value && !isEmpty(value)) {
      setNewPageCategoryIsValid(true);
    }
  };

  const handleNewPageTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setNewPageTitle(value);
    setNewPageTitleIsValid(true);
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

  const handleOnEditPage = async () => {
    const updatePageInput: UpdatePageInput = {
      id: page.id,
      name: _.isEmpty(newPageName) ? page.name : newPageName,
      categoryId: _.isEmpty(newPageCategory) ? page.categoryId : newPageCategory,
      title: _.isEmpty(newPageTitle) ? page?.title : newPageTitle,
      description: _.isEmpty(newPageDescription) ? page?.description : newPageDescription,
      website: _.isEmpty(newPageWebsite) ? page?.website : newPageWebsite,
      countryId: _.isEmpty(newPageCountry) ? page?.countryId : newPageCountry,
      stateId: _.isEmpty(newPageState) ? page?.stateId : newPageState,
      address: _.isEmpty(newPageAddress) ? page?.address : newPageAddress
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
      // dispatch(
      //   pageApi.util.updateQueryData('Page', params, draft => {
      //     draft.allPosts.edges.unshift({
      //       cursor: result.createPost.id,
      //       node: {
      //         ...result.createPost
      //       }
      //     });
      //     draft.allPosts.totalCount = draft.allPosts.totalCount + 1;
      //   })
      // );
      dispatch(closeModal());
    } catch (error) {
      const message = errorOnUpdate?.message ?? intl.get('page.unableUpdatePage');

      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <Modal
        width={1192}
        className="custom-edit-page-modal"
        title={intl.get('page.updatePage')}
        visible={true}
        onCancel={handleOnCancel}
        footer={null}
        style={{ top: '0 !important' }}
      >
        <CreateForm className="form-parent">
          <CreateForm
            className="form-child edit-page"
            layout="vertical"
            initialValues={{ disabled: componentDisabled }}
            onValuesChange={onFormLayoutChange}
            style={{ textAlign: 'start' }}
          >
            <Form.Item
              name="name"
              label={intl.get('page.name')}
              rules={[{ required: true, message: intl.get('page.inputName') }]}
            >
              <Input defaultValue={page.name} onChange={e => handleNewPageNameInput(e)} />
            </Form.Item>

            <Form.Item
              name="category"
              label={intl.get('page.category')}
              rules={[{ required: true, message: intl.get('page.selectCategory') }]}
            >
              <Select
                className="select-after edit-page"
                showSearch
                defaultValue={page.categoryId}
                onChange={handleChangeCategory}
                placeholder={intl.get('page.category')}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option!.children as unknown as string).toLocaleLowerCase().includes(input)
                }
                filterSort={(optionA, optionB) =>
                  (optionA!.children as unknown as string)
                    .toLowerCase()
                    .localeCompare((optionB!.children as unknown as string).toLowerCase())
                }
                style={{ width: '99%', textAlign: 'start' }}
              >
                {categories.map(pageCategory => (
                  <Option key={pageCategory.id}>{intl.get('category.' + pageCategory.name)}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="title" label={intl.get('page.title')}>
              <Input defaultValue={page.title} onChange={e => handleNewPageTitleInput(e)} />
            </Form.Item>

            <Form.Item label={intl.get('page.description')}>
              <TextArea defaultValue={page.description} onChange={e => handleNewPageDescriptionInput(e)} rows={4} />
            </Form.Item>
          </CreateForm>

          {/* Column 2 */}
          <CreateForm className="form-child edit-page" layout="vertical">
            <Form.Item name="website" label={intl.get('page.website')}>
              <Input defaultValue={page.website} onChange={e => handleNewPageWebsiteInput(e)} />
            </Form.Item>

            <Form.Item name="address" label={intl.get('page.countryName') + '/ ' + intl.get('page.stateName')}>
              <Row>
                <Col span={12}>
                  <Select
                    className="select-after edit-page"
                    showSearch
                    defaultValue={String(page.countryId)}
                    onChange={handleChangeCountry}
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
                    style={{ width: '99%', textAlign: 'start' }}
                  >
                    {countries.map(country => (
                      <Option key={country.id}>{country.name}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={12}>
                  <Select
                    className="select-after edit-page"
                    showSearch
                    defaultValue={String(page.stateId)}
                    onChange={handleChangeState}
                    placeholder={intl.get('page.state')}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option!.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                    filterSort={(optionA, optionB) =>
                      (optionA!.children as unknown as string)
                        .toLowerCase()
                        .localeCompare((optionB!.children as unknown as string).toLowerCase())
                    }
                    style={{ width: '99%', textAlign: 'end' }}
                  >
                    {states.map(state => (
                      <Option key={state.id}>{state.name}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item name="address" label={intl.get('page.address')}>
              <Input defaultValue={page.address} onChange={e => handleNewPageAddressInput(e)} />
            </Form.Item>
          </CreateForm>
        </CreateForm>

        <Button type="primary" htmlType="submit" onClick={handleOnEditPage}>
          {intl.get('page.editPage')}
        </Button>
      </Modal>
    </>
  );
};
