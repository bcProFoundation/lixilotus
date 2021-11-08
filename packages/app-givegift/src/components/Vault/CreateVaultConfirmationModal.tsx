import { AnyAction } from 'redux';
import { Modal } from 'antd';
import _ from 'lodash';
import { VaultParamLabel } from '@abcpros/givegift-components/components/Common/Atoms';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';


export type CreateVaultConfirmationModalProps = {
  isRandomGive: boolean;
  newVaultMinValue: string;
  newVaultMaxValue: string;
  newVaultFixedValue: string;
  newVaultName: string;
  onOkAction?: AnyAction
}

export const CreateVaultConfirmationModal: React.FC<CreateVaultConfirmationModalProps> = (props: CreateVaultConfirmationModalProps) => {

  const dispatch = useAppDispatch();

  const {
    newVaultName,
    isRandomGive,
    newVaultMinValue,
    newVaultMaxValue,
    newVaultFixedValue
  } = props;

  const handleOnCancel = () => {
    dispatch(closeModal());
  }

  const handleOnOk = () => {
    if (props.onOkAction) {
      // There's an action should be dispatch on ok
      const newAction = _.cloneDeep(props.onOkAction);
      dispatch(newAction);
    }
    dispatch(closeModal());
  }


  return (
    <>
      <Modal
        title={`Please confirm your vault settings.`}
        visible={true}
        onOk={() => handleOnOk()}
        onCancel={() => handleOnCancel()}
      >
        <VaultParamLabel>Name:</VaultParamLabel> {newVaultName}
        <br />
        {isRandomGive ?
          (
            <>
              <VaultParamLabel>The fund giving is randomized</VaultParamLabel>
              <br />
              <VaultParamLabel>Min:</VaultParamLabel> {newVaultMinValue}
              <br />
              <VaultParamLabel>Max:</VaultParamLabel> {newVaultMaxValue}
            </>
          ) :
          (
            <>
              <VaultParamLabel>The fixed fund:</VaultParamLabel> {newVaultFixedValue}
            </>
          )}
        <br />
      </Modal>
    </>
  );
}