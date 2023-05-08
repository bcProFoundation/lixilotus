import { useAppSelector } from '@store/hooks';
import { getModals } from '@store/modal/selectors';

import { RenameAccountModal } from '../Settings/RenameAccountModal';
import { DeleteAccountModal } from '../Settings/DeleteAccountModal';
import { QRCodeModalPopup } from './QRCodeModalPopup';
import { EditPostModalPopup } from '../Posts/EditPostModalPopup';
import { UploadAvatarCoverModal } from './uploadImageModal';
import { BurnModal } from './BurnModal';
import { ConfigProvider } from 'antd';
import lightTheme from 'src/styles/themes/lightTheme';

const modalComponentLookupTable = {
  RenameAccountModal,
  DeleteAccountModal,
  QRCodeModalPopup,
  EditPostModalPopup,
  UploadAvatarCoverModal,
  BurnModal
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
