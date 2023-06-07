import { useAppSelector } from '@store/hooks';
import { getModals } from '@store/modal/selectors';

import { RenameAccountModal } from '../Settings/RenameAccountModal';
import { RenameLixiModal } from '../Lixi/RenameLixiModal';
import { DeleteAccountModal } from '../Settings/DeleteAccountModal';
import { CreateLixiConfirmationModal } from '../Lixi/CreateLixiConfirmationModal';
import { CreateLixiFormModal } from '../Lixi/CreateLixiFormModal';
import { QRCodeModalPopup } from './QRCodeModalPopup';
import { EditPostModalPopup } from '../Posts/EditPostModalPopup';
import { CreatePageModal } from '@components/Pages/CreatePageModal';
import { EditPageModal } from '@components/Pages/EditPageModal';
import { UploadAvatarCoverModal } from './uploadImageModal';
import { BurnModal } from './BurnModal';
import { ConfigProvider } from 'antd';
import lightTheme from 'src/styles/themes/lightTheme';
import { FollowModal } from './FollowModal';

const modalComponentLookupTable = {
  CreateLixiConfirmationModal,
  RenameAccountModal,
  DeleteAccountModal,
  RenameLixiModal,
  CreateLixiFormModal,
  QRCodeModalPopup,
  EditPostModalPopup,
  CreatePageModal,
  EditPageModal,
  UploadAvatarCoverModal,
  BurnModal,
  FollowModal
};

const ModalManager = () => {
  const currentModals = useAppSelector(getModals);

  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {} } = modalDescription;
    const ModalComponent = modalComponentLookupTable[modalType];

    return (
      <ConfigProvider theme={lightTheme}>
        <ModalComponent {...modalProps} key={modalType + index} />
      </ConfigProvider>
    );
  });

  return <span>{renderedModals}</span>;
};

export default ModalManager;
