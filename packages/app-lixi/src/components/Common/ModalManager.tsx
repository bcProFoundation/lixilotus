import { useAppSelector } from 'src/store/hooks';
import { getModals } from 'src/store/modal/selectors';

import { RenameAccountModal } from '../Settings/RenameAccountModal';
import { RenameLixiModal } from '../Lixi/RenameLixiModal';
import { DeleteAccountModal } from '../Settings/DeleteAccountModal';
import { CreateLixiConfirmationModal } from '../Lixi/CreateLixiConfirmationModal';

const modalComponentLookupTable = {
  CreateLixiConfirmationModal,
  RenameAccountModal,
  DeleteAccountModal,
  RenameLixiModal
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
