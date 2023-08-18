import {
  getAccountAvatarUpload,
  getAccountCoverUpload,
  getPageAvatarUpload,
  getPageCoverUpload
} from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { UpdatePageInput, Page, Account, UpdateAccountInput } from '@generated/types.generated';
import Image from 'next/image';
import { StyledUploader } from './Uploader/Uploader';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import { Button, Form, Modal } from 'antd';
import { setPage } from '@store/page/action';
import { useUpdatePageMutation } from '@store/page/pages.generated';
import { showToast } from '@store/toast/actions';
import intl from 'react-intl-universal';
import { closeModal } from '@store/modal/actions';
import { useState } from 'react';
import { setAccount, setAccountAvatar, setAccountCover } from '@store/account';
import { useUpdateAccountMutation } from '@store/account/accounts.generated';

export interface UploadAvatarCoverProps {
  profile?: Account;
  page?: Page;
  isAvatar: boolean;
  classStyle?: string;
}

export const UploadAvatarCoverModal: React.FC<UploadAvatarCoverProps> = (props: UploadAvatarCoverProps) => {
  const { profile, page, isAvatar, classStyle } = props;

  const [
    updatePageTrigger,
    { isLoading: isLoadingUpdatePage, isSuccess: isSuccessUpdatePage, isError: isErrorUpdatePage, error: errorOnUpdate }
  ] = useUpdatePageMutation();

  const [
    updateAccountTrigger,
    {
      isLoading: isLoadingUpdateAccount,
      isSuccess: isSuccessUpdateAccount,
      isError: isErrorUpdateAccount,
      error: errorOnUpdateAccount
    }
  ] = useUpdateAccountMutation();

  const dispatch = useAppDispatch();
  const avatar = profile ? useAppSelector(getAccountAvatarUpload) : useAppSelector(getPageAvatarUpload);
  const cover = profile ? useAppSelector(getAccountCoverUpload) : useAppSelector(getPageCoverUpload);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleOnEditPage = async () => {
    let updatePageAvatar: UpdatePageInput;
    let updatePageCover: UpdatePageInput;

    if (isAvatar) {
      updatePageAvatar = {
        id: page.id,
        avatar: avatar?.id
      };
    } else {
      updatePageCover = {
        id: page.id,
        cover: cover?.id
      };
    }

    try {
      const pageUpdated = await updatePageTrigger({ input: isAvatar ? updatePageAvatar : updatePageCover }).unwrap();
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

  const handleOnEditProfile = async () => {
    let updateAccountAvatar: UpdateAccountInput;
    let updateAccountCover: UpdateAccountInput;

    if (isAvatar) {
      updateAccountAvatar = {
        id: profile.id,
        avatar: avatar?.id
      };
    } else {
      updateAccountCover = {
        id: profile.id,
        cover: cover?.id
      };
    }

    try {
      const accountUpdated = await updateAccountTrigger({
        input: isAvatar ? updateAccountAvatar : updateAccountCover
      }).unwrap();
      dispatch(
        showToast('success', {
          message: 'Success',
          description: intl.get('page.updateAccountSuccessful'),
          duration: 5
        })
      );
      if (isAvatar) {
        dispatch(setAccountAvatar(accountUpdated.updateAccount.avatar));
      } else {
        dispatch(setAccountCover(accountUpdated.updateAccount.cover));
      }
      dispatch(closeModal());
    } catch (error) {
      const message = errorOnUpdateAccount?.message ?? intl.get('page.unableUpdateAccount');

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
  const setUploadingImage = state => {
    setIsUploadingImage(state);
  };

  return (
    <Modal
      transitionName=""
      width={500}
      className={`${classStyle} custom-edit-page-modal`}
      title={isAvatar ? intl.get('page.avatar') : intl.get('page.cover')}
      open={true}
      onCancel={handleOnCancel}
      footer={
        <Button
          loading={isUploadingImage}
          disabled={isUploadingImage}
          type="primary"
          htmlType="submit"
          onClick={profile ? handleOnEditProfile : handleOnEditPage}
        >
          {intl.get('post.upload')}
        </Button>
      }
      style={{ top: '0 !important' }}
    >
      <h3>{isAvatar ? intl.get('page.chooseAvatar') : intl.get('page.chooseCover')}</h3>
      <Form>
        {isAvatar ? (
          <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader
              loading={isUploadingImage}
              setUploadingImage={setUploadingImage}
              type={profile ? UPLOAD_TYPES.ACCOUNT_AVATAR : UPLOAD_TYPES.PAGE_AVATAR}
            />
          </Form.Item>
        ) : (
          <Form.Item name="cover" valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader
              loading={isUploadingImage}
              setUploadingImage={setUploadingImage}
              type={profile ? UPLOAD_TYPES.ACCOUNT_COVER : UPLOAD_TYPES.PAGE_COVER}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
