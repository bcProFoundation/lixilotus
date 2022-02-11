import { useAppSelector } from 'src/store/hooks';
import { getModals } from 'src/store/modal/selectors';

import { RenameAccountModal } from '../Settings/RenameAccountModal';
import { DeleteAccountModal } from '../Settings/DeleteAccountModal';
import { CreateVaultConfirmationModal } from '../Vault/CreateVaultConfirmationModal';

const modalComponentLookupTable = {
  CreateVaultConfirmationModal,
  RenameAccountModal,
  DeleteAccountModal
};

const ModalManager = () => {

  const currentModals = useAppSelector(getModals);

  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {} } = modalDescription;
    const ModalComponent = modalComponentLookupTable[modalType];

    return <ModalComponent {...modalProps} key={modalType + index} />;

  });

  return <span>{renderedModals}</span>
}

export default ModalManager;