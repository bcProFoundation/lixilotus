import { Button, Col, Form, Input, Modal, Row, Select } from 'antd';
import isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getAllCountries, getAllStates } from '@store/country/selectors';
import { setPage } from '@store/page/action';
import { showToast } from '@store/toast/actions';
import { getCountries, getStates } from '@store/country/actions';
import _ from 'lodash';
import Image from 'next/image';
import { UpdatePageInput, Page } from '@generated/types.generated';
import { api as pageApi, useUpdatePageMutation } from '@store/page/pages.generated';
import styled from 'styled-components';
import { closeModal } from '@store/modal/actions';
import { CreateForm } from '@components/Lixi/CreateLixiFormModal';
import { getAllCategories } from '@store/category/selectors';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { currency } from '@components/Common/Ticker';

const { TextArea } = Input;
const { Option } = Select;

type EditPageModalProps = {
  page: Page;
  classStyle?: string;
} & React.HTMLProps<HTMLElement>;

export const EditPageModal: React.FC<EditPageModalProps> = ({ page, disabled, classStyle }: EditPageModalProps) => {
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
  const createPostFee = [0, 1, 10, 100, 1000];
  const createCommentFee = [0, fromSmallestDenomination(currency.dustSats), 1, 10, 100];

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue
  } = useForm({
    defaultValues: {
      id: page.id,
      name: page.name,
      categoryId: page.category.id,
      categoryName: page.category.name,
      description: page.description,
      website: page.website,
      countryId: page.countryId,
      countryName: page?.countryName,
      stateId: page.stateId,
      stateName: page?.stateName,
      address: page.address,
      createPostFee: page.createPostFee,
      createCommentFee: page.createCommentFee
    }
  });

  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const onFormLayoutChange = ({ disabled }: { disabled: boolean }) => {
    setComponentDisabled(disabled);
  };

  const onSubmit: SubmitHandler<UpdatePageInput> = async data => {
    try {
      const updatePageInput: UpdatePageInput = _.omit(
        {
          ...data,
          id: page.id,
          categoryId: String(data.categoryId),
          countryId: !_.isNil(data.countryId) ? String(data.countryId) : null,
          stateId: !_.isNil(data.stateId) ? String(data.stateId) : null,
          createPostFee: String(data.createPostFee),
          createCommentFee: String(data.createCommentFee)
        },
        'categoryName',
        'countryName',
        'stateName'
      );

      const pageUpdated = await updatePageTrigger({ input: updatePageInput }).unwrap();
      dispatch(
        showToast('success', {
          message: 'Success',
          description: intl.get('page.updatePageSuccessful'),
          duration: 5
        })
      );
      dispatch(setPage({ ...pageUpdated.updatePage }));
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

  useEffect(() => {
    dispatch(getStates(page.countryId));
  }, []);

  return (
    <>
      <Modal
        width={1192}
        className={`${classStyle} custom-edit-page-modal`}
        title={intl.get('page.updatePage')}
        open={true}
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
              <Controller
                name="name"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: intl.get('page.inputName')
                  },
                  pattern: {
                    value: /.+/,
                    message: intl.get('page.inputNamePattern')
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input value={value} onChange={onChange} onBlur={onBlur} />
                )}
              />
              <p style={{ display: errors.name ? 'flex' : 'none', color: 'var(--color-danger)' }}>
                {errors.name && errors.name.message}
              </p>
            </Form.Item>

            <Form.Item
              name="category"
              label={intl.get('page.category')}
              rules={[
                {
                  required: true,
                  message: intl.get('page.selectCategory')
                }
              ]}
            >
              <Controller
                name="categoryId"
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: intl.get('page.selectCategory')
                  }
                }}
                render={({ field: { onChange, onBlur, value }, formState: { isSubmitting } }) => (
                  <Select
                    className="select-after edit-page"
                    showSearch
                    onChange={onChange}
                    onBlur={onBlur}
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
                    defaultValue={intl.get('category.' + page.category.name)}
                    disabled={isSubmitting}
                  >
                    {categories.map(pageCategory => (
                      <Option key={pageCategory.id} value={pageCategory.id}>
                        {intl.get('category.' + pageCategory.name)}
                      </Option>
                    ))}
                  </Select>
                )}
              />
              <p style={{ display: errors.categoryId ? 'flex' : 'none', color: 'var(--color-danger)' }}>
                {errors.categoryId && errors.categoryId.message}
              </p>
            </Form.Item>

            {/* <Form.Item name="title" label={intl.get('page.title')}>
              <Input defaultValue={page.title} onChange={e => handleNewPageTitleInput(e)} />
            </Form.Item> */}

            <Form.Item label={intl.get('page.description')}>
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextArea maxLength={160} value={value} onChange={onChange} rows={5} />
                )}
              />
            </Form.Item>
          </CreateForm>

          {/* Column 2 */}
          <CreateForm className="form-child edit-page" layout="vertical">
            <Form.Item name="website" label={intl.get('page.website')}>
              <Controller
                name="website"
                control={control}
                render={({ field: { onChange, value } }) => <Input value={value} onChange={onChange} />}
              />
            </Form.Item>

            <Form.Item name="country-state" label={intl.get('page.countryName') + '/ ' + intl.get('page.stateName')}>
              <Row>
                <Col span={12}>
                  <Controller
                    name="countryId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        className="select-after edit-page"
                        showSearch
                        defaultValue={page.countryName}
                        onSelect={value => {
                          onChange(value);
                          dispatch(getStates(value));
                          setValue('stateId', null);
                        }}
                        placeholder={intl.get('page.country')}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option!.children as unknown as string).toLocaleLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                          (optionA!.children as unknown as string)
                            .toLowerCase()
                            .localeCompare((optionB!.children as unknown as string).toLowerCase())
                        }
                        style={{ width: '99%', textAlign: 'start' }}
                      >
                        {countries.map(country => (
                          <Option key={country.id} value={country.id}>
                            {country.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </Col>
                <Col span={12}>
                  <Controller
                    name="stateId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        className="select-after edit-page"
                        showSearch
                        value={value}
                        onChange={onChange}
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
                    )}
                  />
                </Col>
              </Row>
            </Form.Item>

            <Form.Item name="address" label={intl.get('page.address')}>
              <Controller
                name="address"
                control={control}
                render={({ field: { onChange, value } }) => <Input value={value} onChange={onChange} />}
              />
            </Form.Item>

            <Form.Item
              name="post-comment-fee"
              label={intl.get('page.createPostFee') + '/ ' + intl.get('page.createCommentFee')}
            >
              <Row>
                <Col span={12}>
                  <Controller
                    name="createPostFee"
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: intl.get('page.selectCategory')
                      }
                    }}
                    render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
                      <Select
                        className="select-after edit-page"
                        value={`${value} ${currency.ticker}`}
                        onChange={onChange}
                        placeholder={intl.get('page.state')}
                        defaultValue={`${page.createPostFee} ${currency.ticker}`}
                        disabled={isSubmitting}
                        style={{ width: '99%', textAlign: 'end' }}
                      >
                        {createPostFee.map(fee => (
                          <Option key={fee}>{`${fee} ${currency.ticker}`}</Option>
                        ))}
                      </Select>
                    )}
                  />
                </Col>
                <Col span={12}>
                  <Controller
                    name="createCommentFee"
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: intl.get('page.selectCategory')
                      }
                    }}
                    render={({ field: { onChange, value }, formState: { isSubmitting } }) => (
                      <Select
                        className="select-after edit-page"
                        value={`${value} ${currency.ticker}`}
                        onChange={onChange}
                        placeholder={intl.get('page.state')}
                        defaultValue={`${page.createCommentFee} ${currency.ticker}`}
                        disabled={isSubmitting}
                        style={{ width: '99%', textAlign: 'end' }}
                      >
                        {createCommentFee.map(fee => (
                          <Option key={fee}>{`${fee} ${currency.ticker}`}</Option>
                        ))}
                      </Select>
                    )}
                  />
                </Col>
              </Row>
            </Form.Item>
          </CreateForm>
        </CreateForm>

        <div style={{ textAlign: 'end', marginRight: '10px' }}>
          <Button type="primary" htmlType="submit" onClick={handleSubmit(onSubmit)}>
            {intl.get('page.editPage')}
          </Button>
        </div>
      </Modal>
    </>
  );
};
