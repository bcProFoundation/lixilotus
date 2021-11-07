import { useAppSelector } from "src/store/hooks";
import { getModals } from "src/store/modal/selectors";
import { CreateVaultConfirmationModal } from '../Vault/CreateVaultConfirmationModal';

const modalComponentLookupTable = {
  CreateVaultConfirmationModal
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