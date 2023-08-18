import { useAppDispatch, useAppSelector } from '@store/hooks';
import { UpdateAccountInput } from '@generated/types.generated';
import { Button, DatePicker, Form, Input, Layout, Menu, MenuProps, Modal, Select, Tabs } from 'antd';
import intl from 'react-intl-universal';
import { closeModal } from '@store/modal/actions';
import { FileOutlined, IdcardOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { showToast } from '@store/toast/actions';
import { currency } from '@components/Common/Ticker';
import { CreateForm } from '@components/Lixi/CreateLixiFormModal';
import styled from 'styled-components';
import { Account } from '@bcpros/lixi-models';
import { useUpdateAccountMutation } from '@store/account/accounts.api';
import { setAccount } from '@store/account';

const { TextArea } = Input;
const { Option } = Select;

type EditProfileModalProps = {
  profile: Account;
  classStyle?: string;
} & React.HTMLProps<HTMLElement>;

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, classStyle }: EditProfileModalProps) => {
  const dispatch = useAppDispatch();
  // const createRepostFee = [0, 1, 10, 100, 1000];
  const createCommentFee = [0, fromSmallestDenomination(currency.dustSats), 1, 10, 100];

  const [componentDisabled, setComponentDisabled] = useState<boolean>(true);
  const onFormLayoutChange = ({ disabled }: { disabled: boolean }) => {
    setComponentDisabled(disabled);
  };

  const [
    updateAccountTrigger,
    {
      isLoading: isLoadingUpdateAccount,
      isSuccess: isSuccessUpdateAccount,
      isError: isErrorUpdateAccount,
      error: errorOnUpdate
    }
  ] = useUpdateAccountMutation();

  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm({
    defaultValues: {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      website: profile.website,
      createCommentFee: profile.createCommentFee
    }
  });

  const onSubmit: SubmitHandler<UpdateAccountInput> = async data => {
    try {
      const updateProfileInput: UpdateAccountInput = {
        ...data,
        createCommentFee: String(data.createCommentFee)
      };
      const profileUpdated = await updateAccountTrigger({ input: updateProfileInput }).unwrap();
      dispatch(
        showToast('success', {
          message: 'Success',
          description: intl.get('account.updateProfileSuccessful'),
          duration: 5
        })
      );
      dispatch(setAccount({ ...profileUpdated.updateAccount }));
      dispatch(closeModal());
    } catch (error) {
      const message = errorOnUpdate?.message ?? intl.get('account.unableUpdateProfile');

      dispatch(
        showToast('error', {
          message: 'Error',
          description: 'message',
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
        transitionName=""
        width={700}
        className={`${classStyle} custom-edit-page-modal`}
        open={true}
        footer={null}
        onCancel={handleOnCancel}
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

            <Form.Item label={intl.get('page.description')}>
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    className="showCount"
                    maxLength={160}
                    value={value}
                    onChange={onChange}
                    rows={5}
                    showCount
                  />
                )}
              />
            </Form.Item>
          </CreateForm>

          <CreateForm className="form-child edit-page" layout="vertical">
            <Form.Item name="website" label={intl.get('page.website')}>
              <Controller
                name="website"
                control={control}
                render={({ field: { onChange, value } }) => <Input value={value} onChange={onChange} />}
              />
            </Form.Item>

            <Form.Item name="post-comment-fee" label={intl.get('page.createCommentFee')}>
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
                    disabled={isSubmitting}
                    style={{ width: '99%', textAlign: 'end' }}
                  >
                    {createCommentFee.map(fee => (
                      <Option key={fee}>{`${fee} ${currency.ticker}`}</Option>
                    ))}
                  </Select>
                )}
              />
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
