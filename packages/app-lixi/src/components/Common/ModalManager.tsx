import { useAppSelector } from 'src/store/hooks';
import { getModals } from 'src/store/modal/selectors';

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
  BurnModal
};

const ModalManager = () => {
  const currentModals = useAppSelector(getModals);

  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {} } = modalDescription;
    const ModalComponent = modalComponentLookupTable[modalType];

    return <ModalComponent {...modalProps} key={modalType + index} />;
  });

  return <span>{renderedModals}</span>;
};

export default ModalManager;
