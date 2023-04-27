import { Button, Form, Modal, notification, Radio } from 'antd';
import { showToast } from '@store/toast/actions';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { closeModal } from '@store/modal/actions';
import intl from 'react-intl-universal';
import useXPI from '@hooks/useXPI';
import UpDownSvg from '@assets/icons/upDownIcon.svg';
import UpVoteSvg from '@assets/icons/upVote.svg';
import DownVoteSvg from '@assets/icons/downVote.svg';
import { WalletContext } from '@context/walletProvider';
import React, { useState } from 'react';
import { Burn, Comment, Post, Token } from '@bcpros/lixi-models';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import styled from 'styled-components';
import { BurnCommand, BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import {
  addBurnQueue,
  addBurnTransaction,
  burnForUpDownVote,
  getBurnQueue,
  getFailQueue,
  clearFailQueue
} from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import _ from 'lodash';
import { DislikeOutlined, FireTwoTone, LikeOutlined } from '@ant-design/icons';
import useDidMountEffect from '@hooks/useDidMountEffect ';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import BigNumber from 'bignumber.js';
import { getSelectedAccount } from '@store/account/selectors';
import { CommentOrderField, OrderDirection } from 'src/generated/types.generated';
import { BurnData, PostItem } from '@components/Posts/PostDetail';
import { CommentItem } from '@components/Posts/CommentListItem';
import { TokenItem } from '@components/Token/TokensFeed';

const UpDownButton = styled(Button)`
  background: rgb(158, 42, 156);
  color: white;
  display: flex;
  align-items: center;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  width: 49%;
  height: 40px;
  border-radius: 16px !important;
  justify-content: center;

  &.upVote {
    background: #00abe7;
    &:hover {
      color: #fff;
    }
  }
  &.downVote {
    background: #ba1a1a;
    &:hover {
      color: #fff;
    }
  }
`;

const RadioStyle = styled(Radio.Group)`
  flex-flow: wrap !important;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: row;
  justify-content: start;
  gap: 10px;

  .ant-radio-button-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 8px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #c5c5c5;
    color: #1e1a1d;
    font-weight: 500;
    font-size: 16px;
    letter-spacing: 0.15px;
    &:before {
      content: none;
    }
    &:hover {
      background: #ffd7f6;
      color: #1e1a1d;
    }
    &.ant-radio-button-wrapper-checked {
      color: #1e1a1d;
      background: #ffd7f6;
      &:hover {
        color: #1e1a1d;
        background: #ffd7f6;
      }
    }
  }
`;

const DefaultXpiBurnValues = [1, 8, 50, 100, 200, 500, 1000];

type BurnForItem = PostItem | CommentItem | TokenItem;
interface BurnModalProps {
  data: BurnForItem;
  burnForType: BurnForType;
}

export const BurnModal = ({ data, burnForType }: BurnModalProps) => {
  const {
    formState: { errors },
    control
  } = useForm<Burn>();
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { createBurnTransaction } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const [selectedAmount, setSelectedAmount] = useState(1);
  const burnQueue = useAppSelector(getBurnQueue);
  const failQueue = useAppSelector(getFailQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const [burnUp, setBurnUp] = useState(data.lotusBurnUp);
  const [burnDown, setBurnDown] = useState(data.lotusBurnDown);

  const handleBurn = async (isUpVote: boolean, data: BurnForItem) => {
    try {
      let queryParams;
      let tipToAddresses: { address: string; amount: string }[];
      let tag;
      let pageId;
      let tokenId;
      const burnValue = _.isNil(control._formValues.burnedValue)
        ? DefaultXpiBurnValues[0]
        : control._formValues.burnedValue;
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue)
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { fundingWif, hash160 } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;

      switch (burnForType) {
        case BurnForType.Post:
          const post = data as PostItem;

          tipToAddresses = [
            {
              address: post.page ? post.pageAccount.address : post.postAccount.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
            }
          ];
          if (burnType === BurnType.Up && selectedAccount.address !== post.postAccount.address) {
            tipToAddresses.push({
              address: post.postAccount.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
            });
          }

          if (_.isNil(post.page) && _.isNil(post.token)) {
            tag = PostsQueryTag.Posts;
          } else if (post.page) {
            tag = PostsQueryTag.PostsByPageId;
          } else if (post.token) {
            tag = PostsQueryTag.PostsByTokenId;
          }

          pageId = post.page?.id;
          tokenId = post.token?.id;
          break;
        case BurnForType.Comment:
          const comment = data as CommentItem;
          if (burnType === BurnType.Up && selectedAccount.address != comment?.commentAccount?.address) {
            tipToAddresses.push({
              address: comment?.commentAccount?.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(0.04)).valueOf().toString()
            });
          }
          queryParams = {
            id: comment.commentToId,
            orderBy: {
              direction: OrderDirection.Asc,
              field: CommentOrderField.UpdatedAt
            }
          };
          break;

        case BurnForType.Token:
          const token = data as TokenItem;
          tokenId = token.tokenId;
          if (burnType == BurnType.Up) {
            setBurnUp((prev) => {
              return prev + burnValue
            });
          }
          else {
            setBurnDown((prev) => {
              return prev + burnValue
            });
          }

          break;
      }

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: burnForType,
        burnedBy,
        burnForId: data.id,
        tokenId: tokenId,
        burnValue,
        queryParams: queryParams,
        postQueryTag: tag,
        pageId: pageId
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
      // dispatch(closeModal());
    } catch (e) {
      const errorMessage = e.message || intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: errorMessage,
          duration: 3
        })
      );
    }
  };

  const handleOnCancel = () => {
    dispatch(closeModal());
  };
  return (
    <Modal
      width={450}
      className="custom-burn-modal"
      open={true}
      onCancel={handleOnCancel}
      title={
        <div className="custom-burn-header">
          <UpDownSvg />
          <h3>{intl.get('general.goodOrNot')}</h3>
          <div className="banner-count-burn">
            <div className="banner-item">
              <LikeOutlined />
              <div className="count-bar">
                <p className="title">{burnUp + ' XPI'}</p>
                <p className="sub-title">burnt to up</p>
              </div>
            </div>
            <div className="banner-item">
              <DislikeOutlined />
              <div className="count-bar">
                <p className="title">{burnDown + ' XPI'}</p>
                <p className="sub-title">burnt to down</p>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <Button.Group style={{ width: '100%' }}>
          <UpDownButton className="upVote" onClick={() => handleBurn(true, data)}>
            <UpVoteSvg />
            &nbsp; {intl.get('general.burnUp')}
          </UpDownButton>
          <UpDownButton className="downVote" onClick={() => handleBurn(false, data)}>
            <DownVoteSvg />
            &nbsp; {intl.get('general.burnDown')}
          </UpDownButton>
        </Button.Group>
      }
      style={{ top: '0 !important' }}
    >
      <Form>
        <p className="question-txt">
          {intl.get('text.selectXpi', {
            //TODO: Will crash if use burn modal other than token. Will handle later!
            name: burnForType == BurnForType.Token ? 'ticker' in data : intl.get('text.post')
          })}{' '}
        </p>

        <Controller
          name="burnedValue"
          control={control}
          rules={{
            required: {
              value: true,
              message: intl.get('burn.selectXpi', {
                name: burnForType == BurnForType.Token ? 'ticker' in data : intl.get('text.post')
              })
            }
          }}
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <RadioStyle
              {...fieldProps}
              value={value}
              defaultValue={DefaultXpiBurnValues[0]}
              options={DefaultXpiBurnValues.map(xpi => xpi)}
              optionType="button"
              buttonStyle="solid"
              onChange={value => {
                setSelectedAmount(value?.target?.value);
                onChange(value);
              }}
            />
          )}
        />
        <p style={{ color: 'red', margin: '10px', fontSize: '12px' }}>
          {errors.burnedValue && errors.burnedValue.message}
        </p>
      </Form>
      <p className="amount-burn">{`You're burning ` + selectedAmount + ' XPI'}</p>
    </Modal>
  );
};
