import { AnyAction } from 'redux';
import { Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { VaultParamLabel } from '@abcpros/givegift-components/components/Common/Atoms';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';
import { countries } from '@abcpros/givegift-models/src/constants/countries';
import { VaultType } from '@abcpros/givegift-models/src/lib/vault';


export type CreateVaultConfirmationModalProps = {
  isRandomGive: boolean;
  vaultType: number;
  newVaultMinValue: string;
  newVaultMaxValue: string;
  newVaultFixedValue: string;
  newVaultDividedValue: string;
  newVaultName: string;
  newMaxRedeem: string;
  newExpiryAt: string;
  newCountryVault: string;
  isFamilyFriendly: boolean;
  onOkAction?: AnyAction
}

export const CreateVaultConfirmationModal: React.FC<CreateVaultConfirmationModalProps> = (props: CreateVaultConfirmationModalProps) => {

  const dispatch = useAppDispatch();

  const {
    newVaultName,
    newMaxRedeem,
    newExpiryAt,
    isRandomGive,
    vaultType,
    newVaultMinValue,
    newVaultMaxValue,
    newVaultFixedValue,
    newVaultDividedValue,
    newCountryVault,
    isFamilyFriendly,
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
      case VaultType.Fixed:
        return (
          <>
            <VaultParamLabel>The fund giving is fixed</VaultParamLabel>
            <br />
            <VaultParamLabel>The fixed fund:</VaultParamLabel> {newVaultFixedValue}
          </>
        );
      // isDivided
      case VaultType.Divided:
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
              <VaultParamLabel>Min: {newVaultMinValue}; Max: {newVaultMaxValue}</VaultParamLabel> 
            </>
        );
    }
  }

  const formatDate = () => {
    if (newExpiryAt != "") {
      return <VaultParamLabel>Expiry at: {moment(newExpiryAt).format("YYYY-MM-DD HH:mm")}<br/></VaultParamLabel> ;
    }
    else {
      return;
    }
  }

  const confirmCountry = () => {
    const country = countries.find(country => country.id === newCountryVault);
    return <VaultParamLabel>Country: {country ? country.name : "All of country"}<br /></VaultParamLabel> 
  }

  const confirmMaxRedeem = () => {
    if (isFamilyFriendly && !newMaxRedeem) {
      return (<VaultParamLabel>Max Redemption: 5 <br /></VaultParamLabel>);
    }
    else {
      return (newMaxRedeem == "" ? "" : <VaultParamLabel>Max Redemption: {newMaxRedeem} <br /></VaultParamLabel>);
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
        {confirmVaultType()}
        <br />
        {confirmMaxRedeem()}
        {formatDate()}
        {confirmCountry()}
      </Modal>
    </>
  );
}