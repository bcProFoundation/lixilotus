import { Button, Form, Input, Modal, Select } from 'antd';
import isEmpty from 'lodash.isempty';
import React, { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { getSelectedAccount } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setPage } from '@store/page/action';
import { showToast } from '@store/toast/actions';
import { getCountries, getStates } from '@store/country/actions';
import { CreatePageInput } from '@generated/types.generated';
import { useCreatePageMutation } from '@store/page/pages.generated';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { closeModal } from '@store/modal/actions';
import { getAllCategories } from '@store/category/selectors';
import { getCategories } from '@store/category/actions';

const { TextArea } = Input;
const { Option } = Select;

const TextCustom = styled.p`
  padding-left: 20px;
  margin-top: 4px;
  padding-left: 0;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: flex;
  align-items: center;
  letter-spacing: 0.4px;
  color: #4e444b;
`;

type CreatePageModalProps = {
  accountId?: Number;
} & React.HTMLProps<HTMLElement>;

export const CreatePageModal: React.FC<CreatePageModalProps> = ({ accountId, disabled }: CreatePageModalProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);

  const router = useRouter();

  const [
    createPageTrigger,
    { isLoading: isLoadingCreatePage, isSuccess: isSuccessCreatePage, isError: isErrorCreatePage, error: errorOnCreate }
  ] = useCreatePageMutation();

  const categories = useAppSelector(getAllCategories);

  // New page name
  const [newPageName, setNewPageName] = useState('');
  const [newPageNameIsValid, setNewPageNameIsValid] = useState(true);

  // New page category
  const [newPageCategory, setNewPageCategory] = useState('');
  const [newPageCategoryIsValid, setNewPageCategoryIsValid] = useState(true);

  // New page description
  const [newPageDescription, setNewPageDescription] = useState('');
  const [newPageDescriptionIsValid, setNewPageDescriptionIsValid] = useState(true);

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

  const handleNewPageDescriptionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setNewPageDescription(value);
    setNewPageDescriptionIsValid(true);
  };

  // Only enable CreateLixi button if all form entries are valid
  let createPageFormDataIsValid = newPageName && newPageCategory;

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
      categoryId: newPageCategory,
      description: newPageDescription
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
        dispatch(closeModal());
        dispatch(setPage({ ...pageCreated.createPage }));
        router.push(`/page/${pageCreated.createPage.id}`);
      }
    } catch (error) {
      const message = errorOnCreate?.message ?? intl.get('page.unableCreatePageServer');

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
      {selectedAccount && selectedAccount.address ? (
        <Modal
          width={400}
          className="custom-create-page-modal"
          title={intl.get('page.createNewPage')}
          open={true}
          onCancel={handleOnCancel}
          footer={
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleOnCreateNewPage}
              disabled={!createPageFormDataIsValid}
            >
              {intl.get('page.createPage')}
            </Button>
          }
          style={{ top: '0 !important' }}
        >
          <Form
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
              <Input defaultValue={newPageName} onChange={e => handleNewPageNameInput(e)} />
              <TextCustom>{intl.get('text.createPageName')}</TextCustom>
            </Form.Item>

            <Form.Item
              name="category"
              label={intl.get('page.category')}
              rules={[{ required: true, message: intl.get('page.selectCategory') }]}
            >
              <Select
                className="select-after edit-page"
                showSearch
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
              <TextCustom>{intl.get('text.createPageCategory')}</TextCustom>
            </Form.Item>

            <Form.Item label={intl.get('page.description')}>
              <TextArea onChange={e => handleNewPageDescriptionInput(e)} rows={4} />
              <TextCustom>{intl.get('text.createPageDescription')}</TextCustom>
            </Form.Item>
          </Form>
        </Modal>
      ) : (
        intl.get('page.selectAccountFirst')
      )}
    </>
  );
};
