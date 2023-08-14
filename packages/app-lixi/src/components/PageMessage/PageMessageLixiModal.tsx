import { Descriptions, Input, Modal } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { useAppDispatch } from '@store/hooks';
import { closeModal } from '@store/modal/actions';
import { useForm, Controller } from 'react-hook-form';
import { GenerateLixiCommand } from '@bcpros/lixi-models/lib/lixi';
import { Account } from '@bcpros/lixi-models/lib/account';
import moment from 'moment';
import { PageItem } from '@components/Pages/PageDetail';
import { generateLixi } from '@store/lixi/actions';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { WalletContext } from '@context/walletProvider';
import { WalletStatus } from '@store/wallet';

type PageMessageLixiModalProps = {
  account?: Account;
  page?: PageItem;
  wallet: WalletStatus;
  classStyle?: String;
};

const StyledModal = styled(Modal)`
  .ant-descriptions-bordered .ant-descriptions-view {
    border: none;
  }
  .ant-modal-body {
    border-radius: 20px !important;
  }

  .ant-descriptions-bordered .ant-descriptions-item-label,
  .ant-descriptions-bordered .ant-descriptions-item-content {
    padding: 0px 24px;
    border-right: none;
  }
`;

const PageMessageLixiModal = ({ account, page, wallet, classStyle }: PageMessageLixiModalProps) => {
  const dispatch = useAppDispatch();
  const {
    control,
    getValues,
    resetField,
    setFocus,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const Wallet = React.useContext(WalletContext);
  const txFee = Math.ceil(Wallet.XPI.BitcoinCash.getByteCount({ P2PKH: 1 }, { P2PKH: 1 }) * 2.01); //satoshi

  const handleOk = data => {
    //pageMessageLixi only need this data so we split the data here for easier management
    const pageMessageLixiData = {
      name: `${page.name.substring(0, 6)}.${moment.utc().format('DD-MM-YYYY')}`,
      accountId: account?.id,
      mnemonic: account?.mnemonic,
      mnemonicHash: account?.mnemonicHash,
      amount: (parseFloat(data.amount) + fromSmallestDenomination(txFee)).toString(),
      fixedValue: data.amount,
      claimType: 0,
      lixiType: 1,
      networkType: 'single-ip',
      // Remove comment when handle activationAt and expiryAt
      // activationAt: moment.utc().format(),
      // expiryAt: moment.utc().add(3, 'days').format(),
      activationAt: null,
      expiryAt: null,
      pageId: page.id
    };

    const generateLixiCommand: GenerateLixiCommand = {
      ...pageMessageLixiData,
      maxClaim: '',
      minValue: '',
      maxValue: '',
      dividedValue: '',
      minStaking: '',
      country: '',
      isFamilyFriendly: false,
      isNFTEnabled: false,
      numberOfSubLixi: '',
      envelopeId: null,
      envelopeMessage: '',
      shouldGroupToPackage: false,
      numberLixiPerPackage: '',
      upload: null,
      staffAddress: '',
      charityAddress: '',
      joinLotteryProgram: false
    };

    dispatch(generateLixi(generateLixiCommand));
    dispatch(closeModal());
  };

  const handleCancel = () => {
    dispatch(closeModal());
  };

  return (
    <StyledModal
      className={`${classStyle}`}
      width={490}
      open={true}
      onOk={handleSubmit(handleOk)}
      onCancel={handleCancel}
      closable={false}
      title={<div className="custom-burn-header">Create lixi to chat with {page.name}</div>}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item>
          <Controller
            name="amount"
            control={control}
            rules={{
              required: true,
              pattern: /^[0-9]*$/,
              validate: {
                checkEnoughXPI: value => {
                  return (
                    fromSmallestDenomination(wallet.balances.totalBalanceInSatoshis) >=
                      parseFloat(value) + fromSmallestDenomination(txFee) || 'Not enough XPI'
                  );
                }
                // can add more validate below here
              }
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                ref={ref}
                style={{ width: '95%' }}
                onChange={onChange}
                onBlur={onBlur}
                value={value}
                type="number"
                placeholder={'Input amount...'}
              />
            )}
          />
        </Descriptions.Item>
        <Descriptions.Item>{errors?.amount?.message}</Descriptions.Item>
      </Descriptions>
    </StyledModal>
  );
};

export default PageMessageLixiModal;
