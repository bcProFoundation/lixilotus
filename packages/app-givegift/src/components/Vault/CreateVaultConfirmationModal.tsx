import { AnyAction } from 'redux';
import { Modal } from 'antd';
import _ from 'lodash';
import { VaultParamLabel } from '@abcpros/givegift-components/components/Common/Atoms';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';


export type CreateVaultConfirmationModalProps = {
  isRandomGive: boolean;
  vaultType: number;
  newVaultMinValue: string;
  newVaultMaxValue: string;
  newVaultFixedValue: string;
  newVaultDividedValue: string;
  newVaultName: string;
  newMaxRedeem: string;
  newRedeemedNum: string;
  onOkAction?: AnyAction
}

export const CreateVaultConfirmationModal: React.FC<CreateVaultConfirmationModalProps> = (props: CreateVaultConfirmationModalProps) => {

  const dispatch = useAppDispatch();

  const {
    newVaultName,
    newMaxRedeem,
    newRedeemedNum,
    isRandomGive,
    vaultType,
    newVaultMinValue,
    newVaultMaxValue,
    newVaultFixedValue,
    newVaultDividedValue
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

  const confirmVaultType = () => {
    switch (vaultType) {
      // isFixed
      case 1:
        return (
          <>
            <VaultParamLabel>The fund giving is fixed</VaultParamLabel>
            <br />
            <VaultParamLabel>The fixed fund:</VaultParamLabel> {newVaultFixedValue}
          </>
        );
      // isDivided
      case 2:
        return (
          <>
            <VaultParamLabel>The fund giving is dividend</VaultParamLabel>
            <br />
            <VaultParamLabel>Divided by:</VaultParamLabel> {newVaultDividedValue}
          </>
        );
      // isRandom
      default:
        return (
          <>
              <VaultParamLabel>The fund giving is randomized</VaultParamLabel>
              <br />
              <VaultParamLabel>Min:</VaultParamLabel> {newVaultMinValue}
              <br />
              <VaultParamLabel>Max:</VaultParamLabel> {newVaultMaxValue}
            </>
        );
    }
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
        <VaultParamLabel>Max Redemption:</VaultParamLabel> {newMaxRedeem == "" ? "Infinity" : newMaxRedeem}
        <br />
        {confirmVaultType()}
        <br />
      </Modal>
    </>
  );
}