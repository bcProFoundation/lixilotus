import { AnyAction } from 'redux';
import { Modal } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { LixiParamLabel } from '@bcpros/lixi-components/components/Common/Atoms';
import { useAppDispatch } from 'src/store/hooks';
import { closeModal } from 'src/store/modal/actions';
import { countries } from '@bcpros/lixi-models/constants';
import { LixiType } from '@bcpros/lixi-models';
import { ClaimType } from '@bcpros/lixi-models';


export type CreateLixiConfirmationModalProps = {
  claimType: number;
  lixiType: number;
  newAccountName?: string;
  newLixiMinValue: string;
  newLixiMaxValue: string;
  newLixiFixedValue: string;
  newLixiDividedValue: string;
  newLixiAmount: string;
  newNumberOfSubLixi: string;
  newLixiName: string;
  newMaxClaim: string;
  newExpiryAt: string;
  newCountryLixi: string;
  isFamilyFriendly: boolean;
  newEnvelopeId: number | null;
  onOkAction?: AnyAction
}

export const CreateLixiConfirmationModal: React.FC<CreateLixiConfirmationModalProps> = (props: CreateLixiConfirmationModalProps) => {

  const dispatch = useAppDispatch();

  const {
    newAccountName,
    newLixiName,
    newLixiAmount,
    newNumberOfSubLixi,
    newMaxClaim,
    newExpiryAt,
    claimType,
    lixiType,
    newLixiMinValue,
    newLixiMaxValue,
    newLixiFixedValue,
    newLixiDividedValue,
    newCountryLixi,
    isFamilyFriendly,
    newEnvelopeId
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

  const confirmLixiType = () => {
    switch (lixiType) {
      // isFixed
      case LixiType.Fixed:
        return (
          <>
            <LixiParamLabel>The fund giving is fixed</LixiParamLabel>
            <br />
            <LixiParamLabel>The fixed fund:</LixiParamLabel> {newLixiFixedValue}
          </>
        );
      // isDivided
      case LixiType.Divided:
        return (
          <>
            <LixiParamLabel>The fund giving is dividend</LixiParamLabel>
            <br />
            <LixiParamLabel>Divided by:</LixiParamLabel> {newLixiDividedValue}
          </>
        );
      // Equal
      case LixiType.Equal:
        return (
          <>
            <LixiParamLabel>The fund giving is equal</LixiParamLabel>
            <br />
            <LixiParamLabel>Equal:</LixiParamLabel> {Number(newLixiAmount) / Number(newNumberOfSubLixi)}
          </>
        );
      // isRandom
      default:
        return (
          <>
            <LixiParamLabel>The fund giving is randomized</LixiParamLabel>
            <br />
            <LixiParamLabel>Min: {newLixiMinValue}; Max: {newLixiMaxValue}</LixiParamLabel>
          </>
        );
    }
  }

  const confirmAmount = () => {
    return (newLixiAmount == "" ? "" : <LixiParamLabel>Amount: {newLixiAmount} <br /></LixiParamLabel>);
  }

  const confirmSubLixies = () => {
    return (claimType == ClaimType.OneTime ? <LixiParamLabel>Number of sub lixi: {newNumberOfSubLixi} <br /></LixiParamLabel> : "");
  }

  const confirmCountry = () => {
    const country = countries.find(country => country.id === newCountryLixi);
    return <LixiParamLabel>Country: {country ? country.name : "All of country"}<br /></LixiParamLabel>
  }

  const confirmMaxClaim = () => {
    return (newMaxClaim == "" ? "" : <LixiParamLabel>Max Redemption: {newMaxClaim} <br /></LixiParamLabel>);
  }

  const formatDate = () => {
    if (newExpiryAt != "") {
      return <LixiParamLabel>Expiry at: {moment(newExpiryAt).format("YYYY-MM-DD HH:mm")}<br /></LixiParamLabel>;
    }
    else {
      return;
    }
  }

  return (
    <>
      <Modal
        title={`Please confirm your lixi settings.`}
        visible={true}
        onOk={() => handleOnOk()}
        onCancel={() => handleOnCancel()}
      >
        <LixiParamLabel>Name:</LixiParamLabel> {newLixiName}
        <br />
        <LixiParamLabel>Fund for the account: </LixiParamLabel> {newAccountName}
        <br />
        {/* <LixiParamLabel>The claim type is: </LixiParamLabel> {claimType==0 ? "Single" : "One-Time Codes"} */}
        {/* <br /> */}
        {confirmAmount()}
        {confirmSubLixies()}
        {confirmLixiType()}
        <br />
        {confirmCountry()}
        {confirmMaxClaim()}
        {formatDate()}
        <LixiParamLabel>{isFamilyFriendly ? "Option: Family Friendly" : ""}</LixiParamLabel>
      </Modal>
    </>
  );
}
