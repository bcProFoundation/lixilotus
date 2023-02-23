import { getPageAvatarUpload, getPageCoverUpload } from '@store/account/selectors';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { UpdatePageInput, Page } from 'src/generated/types.generated';
import Image from 'next/image';
import { StyledUploader } from './Uploader/Uploader';
import { UPLOAD_TYPES } from '@bcpros/lixi-models/constants';
import { Button, Form, Modal } from 'antd';
import { setPage } from '@store/page/action';
import { useUpdatePageMutation } from '@store/page/pages.generated';
import { showToast } from '@store/toast/actions';
import intl from 'react-intl-universal';
import { closeModal } from '@store/modal/actions';
import { useEffect } from 'react';

export interface UploadAvatarCoverProps {
  page: Page;
  isAvatar: boolean;
}

export const UploadAvatarCoverModal: React.FC<UploadAvatarCoverProps> = (props: UploadAvatarCoverProps) => {
  const { page, isAvatar } = props;

  const [
    updatePageTrigger,
    { isLoading: isLoadingUpdatePage, isSuccess: isSuccessUpdatePage, isError: isErrorUpdatePage, error: errorOnUpdate }
  ] = useUpdatePageMutation();
  const dispatch = useAppDispatch();
  const avatar = useAppSelector(getPageAvatarUpload);
  const cover = useAppSelector(getPageCoverUpload);

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

  const handleOnCancel = () => {
    dispatch(closeModal());
  };

  return (
    <Modal
      width={500}
      className="custom-edit-page-modal"
      title={isAvatar ? intl.get('page.avatar') : intl.get('page.cover')}
      open={true}
      onCancel={handleOnCancel}
      footer={
        <Button type="primary" htmlType="submit" onClick={handleOnEditPage}>
          {intl.get('post.upload')}
        </Button>
      }
      style={{ top: '0 !important' }}
    >
      <h3>{isAvatar ? intl.get('page.chooseAvatar') : intl.get('page.chooseCover')}</h3>
      <Form>
        {isAvatar ? (
          <Form.Item name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader type={UPLOAD_TYPES.PAGE_AVATAR} />
          </Form.Item>
        ) : (
          <Form.Item name="cover" valuePropName="fileList" getValueFromEvent={normFile}>
            <StyledUploader type={UPLOAD_TYPES.PAGE_COVER} />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
