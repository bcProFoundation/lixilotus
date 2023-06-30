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
import { CommentOrderField, OrderDirection } from '@generated/types.generated';
import { BurnData, PostItem } from '@components/Posts/PostDetail';
import { CommentItem } from '@components/Posts/CommentListItem';
import { TokenItem } from '@components/Token/TokensFeed';
import router from 'next/router';
import { useTokenQuery } from '@store/token/tokens.generated';
import { usePostQuery } from '@store/post/posts.generated';
import { useCommentQuery } from '@store/comment/comments.generated';
import { getFilterPostsHome } from '@store/settings/selectors';

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
  border-radius: var(--border-radius-primary) !important;
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
    border-radius: var(--border-radius-primary) !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border-color);
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

const DefaultXpiBurnValues = [1, 10, 50, 100, 200, 500, 1000];

type BurnForItem = PostItem | CommentItem | TokenItem;
interface BurnModalProps {
  id?: string;
  burnForType: BurnForType;
  isPage?: boolean;
  classStyle?: string;
}

export const BurnModal = ({ id, burnForType, isPage, classStyle }: BurnModalProps) => {
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
  const pathName = router.pathname ?? '';
  const tokenQuery = useTokenQuery({ tokenId: id }, { skip: burnForType !== BurnForType.Token }).currentData;
  const postQuery = usePostQuery({ id: id }, { skip: burnForType !== BurnForType.Post }).currentData;
  const commentQuery = useCommentQuery({ id: id }, { skip: burnForType !== BurnForType.Comment }).currentData;
  const filterValue = useAppSelector(getFilterPostsHome);

  const handleBurn = async (isUpVote: boolean) => {
    try {
      let queryParams;
      let tipToAddresses: { address: string; amount: string }[] = [];
      let tag;
      let pageId;
      let tokenId;
      let userId;
      let id: string;
      const burnValue = _.isNil(control._formValues.burnedValue)
        ? DefaultXpiBurnValues[0]
        : control._formValues.burnedValue;
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { fundingWif, hash160 } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;

      switch (burnForType) {
        case BurnForType.Post:
          const post = postQuery.post as PostItem;
          id = post.id;

          if (_.isNil(post.page) && _.isNil(post.token)) {
            if (pathName.includes('/profile/')) {
              tag = PostsQueryTag.PostsByUserId;
            } else {
              tag = PostsQueryTag.Post;
            }
            tipToAddresses.push({
              address: post.postAccount.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
            });
          } else if (post.page) {
            tag = PostsQueryTag.PostsByPageId;
            tipToAddresses.push({
              address: post.page.pageAccount.address,
              amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
            });
          } else if (post.token) {
            tag = PostsQueryTag.PostsByTokenId;
          }

          pageId = post.page?.id;
          tokenId = post.token?.id;
          userId = post.postAccount.id;
          break;

        case BurnForType.Comment:
          const comment = commentQuery.comment as CommentItem;
          id = comment.id;

          const pageAddress = comment.commentTo.page.pageAccount.address;
          const postAddress = comment.commentTo.postAccount.address;
          tipToAddresses.push({
            address: pageAddress ?? postAddress,
            amount: fromXpiToSatoshis(new BigNumber(burnValue).multipliedBy(currency.burnFee)).valueOf().toString()
          });

          queryParams = {
            id: comment.commentToId,
            orderBy: {
              direction: OrderDirection.Asc,
              field: CommentOrderField.UpdatedAt
            }
          };
          break;

        case BurnForType.Token:
          const token = tokenQuery.token as TokenItem;
          tokenId = token.tokenId;
          id = token.id;
          break;
      }

      tipToAddresses = tipToAddresses.filter(item => item.address != selectedAccount.address);
      const totalTip = fromSmallestDenomination(
        tipToAddresses.reduce((total, item) => total + parseFloat(item.amount), 0)
      );
      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue) + totalTip
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: burnForType,
        burnedBy,
        burnForId: id,
        tokenId: tokenId,
        burnValue,
        tipToAddresses: tipToAddresses,
        queryParams: queryParams,
        postQueryTag: tag,
        pageId: pageId,
        minBurnFilter: filterValue
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
      dispatch(closeModal());
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

  const getName = (burnForType: BurnForType) => {
    switch (burnForType) {
      case BurnForType.Token:
        return tokenQuery && tokenQuery.token.ticker;
      case BurnForType.Comment:
        return intl.get('burn.comment');
      case BurnForType.Page:
        return intl.get('burn.page');
      case BurnForType.Account:
        return intl.get('burn.account');
      default:
        return intl.get('burn.post');
    }
  };

  const getLotusBurnUp = (burnForType: BurnForType) => {
    switch (burnForType) {
      case BurnForType.Token:
        return (tokenQuery && tokenQuery.token.lotusBurnUp) || 0;
      case BurnForType.Comment:
        return (commentQuery && commentQuery.comment.lotusBurnUp) || 0;
      case BurnForType.Post:
        return (postQuery && postQuery.post.lotusBurnUp) || 0;
      default:
        return 0;
    }
  };

  const getLotusBurnDown = (burnForType: BurnForType) => {
    switch (burnForType) {
      case BurnForType.Token:
        return (tokenQuery && tokenQuery.token.lotusBurnDown) || 0;
      case BurnForType.Comment:
        return (commentQuery && commentQuery.comment.lotusBurnDown) || 0;
      case BurnForType.Post:
        return (postQuery && postQuery.post.lotusBurnDown) || 0;
      default:
        return 0;
    }
  };

  return (
    <Modal
      width={450}
      className={`${classStyle} custom-burn-modal`}
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
                <p className="title">{getLotusBurnUp(burnForType) + intl.get('general.dana')}</p>
              </div>
            </div>
            <div className="banner-item">
              <DislikeOutlined />
              <div className="count-bar">
                <p className="title">{getLotusBurnDown(burnForType) + intl.get('general.dana')}</p>
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        <Button.Group style={{ width: '100%' }}>
          <UpDownButton className="upVote" onClick={() => handleBurn(true)}>
            <UpVoteSvg />
            &nbsp; {intl.get('general.voteUp')}
          </UpDownButton>
          <UpDownButton className="downVote" onClick={() => handleBurn(false)}>
            <DownVoteSvg />
            &nbsp; {intl.get('general.voteDown')}
          </UpDownButton>
        </Button.Group>
      }
      style={{ top: '0 !important' }}
    >
      <Form>
        <p className="question-txt">{intl.get('text.selectXpi')}</p>

        <Controller
          name="burnedValue"
          control={control}
          rules={{
            required: {
              value: true,
              message: intl.get('burn.selectXpi')
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
      <p className="amount-burn">{intl.get('burn.youOffering') + selectedAmount + intl.get('general.dana')}.</p>

      <p className="fee-burn">
        {intl.get('burn.sendDana', {
          cost: currency.burnFee * selectedAmount + selectedAmount
        })}
      </p>
    </Modal>
  );
};
