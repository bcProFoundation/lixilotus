import { CopyOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import DownVoteSvg from '@assets/icons/downVote.svg';
import UpDownSvg from '@assets/icons/upDownIcon.svg';
import UpVoteSvg from '@assets/icons/upVote.svg';
import { Burn } from '@bcpros/lixi-models';
import { PostsQueryTag } from '@bcpros/lixi-models/constants';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import { CommentItem } from '@components/Posts/CommentListItem';
import { PostItem } from '@components/Posts/PostDetail';
import { TokenItem } from '@components/Token/TokensFeed';
import { WalletContext } from '@context/walletProvider';
import { CommentOrderField, OrderDirection } from '@generated/types.generated';
import useXPI from '@hooks/useXPI';
import { getSelectedAccount } from '@store/account/selectors';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getBurnQueue, getFailQueue } from '@store/burn';
import { useCommentQuery } from '@store/comment/comments.generated';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { closeModal } from '@store/modal/actions';
import { usePostQuery } from '@store/post/posts.generated';
import { getFilterPostsHome, getIsTopPosts, getLevelFilter } from '@store/settings/selectors';
import { showToast } from '@store/toast/actions';
import { useTokenQuery } from '@store/token/tokens.generated';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { fromSmallestDenomination, fromXpiToSatoshis } from '@utils/cashMethods';
import { Button, Form, Modal, Radio } from 'antd';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import router from 'next/router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { TRANSLATION_REQUIRE_AMOUNT } from '@bcpros/lixi-models/constants/translation';
import { CURRENCIES, WalletItem, decimalFormatBalance } from '@components/Wallet/ListWallet';
import { QRCodeModal } from './QRCodeModal';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { ReactSVG } from 'react-svg';

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
  const level = useAppSelector(getLevelFilter);
  let isTop = useAppSelector(getIsTopPosts);
  const [openSelectCurrencies, setOpenSelectCurrencies] = useState(false);
  const [selectCurrencies, setSelectCurrencies] = useState(null);
  const defaultSelected = {
    name: 'Lotus',
    symbol: 'xpi',
    icon: '/images/currencies/xpi.svg',
    bg: '/images/currencies/bg-xpi.svg',
    balance: selectedAccount?.balance,
    address: selectedAccount?.address
  };

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
            direction: OrderDirection.Asc,
            field: CommentOrderField.UpdatedAt
          };
          break;

        case BurnForType.Token:
          const token = tokenQuery.token as TokenItem;
          tokenId = token.tokenId;
          id = token.tokenId;
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
        burnValue,
        tipToAddresses: tipToAddresses,
        extraArguments: {
          isTop: isTop,
          postQueryTag: tag,
          tokenId: tokenId,
          orderBy: queryParams,
          pageId: pageId,
          minBurnFilter: filterValue,
          level: level
        }
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
      dispatch(closeModal());
    } catch (e) {
      const errorMessage = intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: intl.get(`toast.error`),
          description: errorMessage,
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

  const getDanaBurnUp = (burnForType: BurnForType) => {
    switch (burnForType) {
      case BurnForType.Token:
        return (tokenQuery && tokenQuery.token.danaBurnUp) || 0;
      case BurnForType.Comment:
        return (commentQuery && commentQuery.comment.danaBurnUp) || 0;
      case BurnForType.Post:
        return (postQuery && postQuery.post.danaBurnUp) || 0;
      default:
        return 0;
    }
  };

  const getDanaBurnDown = (burnForType: BurnForType) => {
    switch (burnForType) {
      case BurnForType.Token:
        return (tokenQuery && tokenQuery.token.danaBurnDown) || 0;
      case BurnForType.Comment:
        return (commentQuery && commentQuery.comment.danaBurnDown) || 0;
      case BurnForType.Post:
        return (postQuery && postQuery.post.danaBurnDown) || 0;
      default:
        return 0;
    }
  };

  const calcAmountBurn = (initialAmount: number, coin: string) => {
    let resultAmount = initialAmount;
    switch (coin) {
      case 'xpi':
        resultAmount = initialAmount;
        return resultAmount;
      case 'xec':
        resultAmount = initialAmount / 2;
        return resultAmount;
      case 'eth':
        resultAmount = initialAmount / 1000;
        return resultAmount;
      case 'near':
        resultAmount = initialAmount / 50;
        return resultAmount;
      case 'dot':
        resultAmount = initialAmount / 100;
        return resultAmount;
      case 'sol':
        resultAmount = initialAmount / 150;
        return resultAmount;
      default:
        return resultAmount;
    }
  };

  const handleOnCopy = (id: string) => {
    dispatch(
      showToast('info', {
        message: intl.get('token.copyId'),
        description: id
      })
    );
  };

  const modalSelectWallet = () => {
    return (
      <Modal
        transitionName=""
        width={'auto'}
        className={`${classStyle} custom-select-currencies-burn-modal`}
        open={openSelectCurrencies}
        onCancel={handleOnCancel}
        title={<h3>Select Wallet To Burn</h3>}
        footer={
          <Button type="primary" onClick={() => setOpenSelectCurrencies(!openSelectCurrencies)}>
            Finish
          </Button>
        }
        style={{ top: '0 !important' }}
      >
        {selectCurrencies && (
          <div className="current-selected">
            <WalletItem className="wallet-item" style={{ backgroundImage: `url(${selectCurrencies.bg})` }}>
              <div className="wallet-card-header">
                <div className="wallet-info" onClick={() => router.push(`/wallet/${selectCurrencies.symbol}`)}>
                  <img className="ico-currency" src={selectCurrencies.icon} alt="" />
                  <span className="wallet-name">{selectCurrencies.name}</span>
                </div>
                <div className="address-code">
                  <QRCodeModal logoImage={selectCurrencies.icon} address={selectCurrencies.address} type={'address'} />
                </div>
              </div>
              <div className="wallet-card-content">
                <span className="balance">
                  {decimalFormatBalance(selectCurrencies.balance, selectCurrencies?.symbol)}{' '}
                  <span className="wallet-symbol">{selectCurrencies?.symbol}</span>
                </span>
              </div>
              <div className="wallet-card-footer">
                <CopyToClipboard text={selectCurrencies.address} onCopy={() => handleOnCopy(selectCurrencies.address)}>
                  <Button type="primary" className="no-border-btn" icon={<CopyOutlined />}>
                    {selectCurrencies.address.slice(-10) + ' '}
                  </Button>
                </CopyToClipboard>
              </div>
            </WalletItem>
            <div className="selected-status" onClick={() => setSelectCurrencies(null)}>
              <ReactSVG src="/images/ico-trash.svg" />
            </div>
          </div>
        )}
        {!selectCurrencies && (
          <div className="current-selected default-selected">
            <WalletItem className="wallet-item" style={{ backgroundImage: `url(${defaultSelected.bg})` }}>
              <div className="wallet-card-header">
                <div className="wallet-info" onClick={() => router.push(`/wallet/${defaultSelected?.symbol}`)}>
                  <img className="ico-currency" src={defaultSelected.icon} alt="" />
                  <span className="wallet-name">{defaultSelected.name}</span>
                </div>
                <div className="address-code">
                  <QRCodeModal logoImage={defaultSelected.icon} address={defaultSelected.address} type={'address'} />
                </div>
              </div>
              <div className="wallet-card-content">
                <span className="balance">
                  {decimalFormatBalance(defaultSelected.balance, defaultSelected?.symbol)}{' '}
                  <span className="wallet-symbol">{defaultSelected.symbol}</span>
                </span>
              </div>
              <div className="wallet-card-footer">
                <CopyToClipboard text={defaultSelected.address} onCopy={() => handleOnCopy(defaultSelected.address)}>
                  <Button type="primary" className="no-border-btn" icon={<CopyOutlined />}>
                    {defaultSelected.address.slice(-10) + ' '}
                  </Button>
                </CopyToClipboard>
              </div>
            </WalletItem>
          </div>
        )}
        <div className="switch-coin-to-burn">
          {CURRENCIES.map(coin => {
            if (coin.symbol === 'xpi') {
              coin = defaultSelected;
            }
            return (
              <WalletItem style={{ backgroundImage: `url(${coin.bg})` }} onClick={() => setSelectCurrencies(coin)}>
                <div className="wallet-card-header">
                  <div className="wallet-info" onClick={() => router.push(`/wallet/${coin.symbol}`)}>
                    <img className="ico-currency" src={coin.icon} alt="" />
                    <span className="wallet-name">{coin.name}</span>
                  </div>
                  <div className="address-code">
                    <QRCodeModal logoImage={coin.icon} address={coin.address} type={'address'} />
                  </div>
                </div>
                <div className="wallet-card-content">
                  <span className="balance">
                    {decimalFormatBalance(coin.balance, coin?.symbol)}{' '}
                    <span className="wallet-symbol">{coin.symbol}</span>
                  </span>
                </div>
                <div className="wallet-card-footer">
                  <CopyToClipboard text={coin.address} onCopy={() => handleOnCopy(coin.address)}>
                    <Button type="primary" className="no-border-btn" icon={<CopyOutlined />}>
                      {coin.address.slice(-10) + ' '}
                    </Button>
                  </CopyToClipboard>
                </div>
              </WalletItem>
            );
          })}
        </div>
      </Modal>
    );
  };

  return (
    <Modal
      transitionName=""
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
                <p className="title">{getDanaBurnUp(burnForType) + intl.get('general.dana')}</p>
              </div>
            </div>
            <div className="banner-item">
              <DislikeOutlined />
              <div className="count-bar">
                <p className="title">{getDanaBurnDown(burnForType) + intl.get('general.dana')}</p>
              </div>
            </div>
          </div>
          {/* TODO: Burn multi coin */}
          {/* {selectCurrencies && (
            <>
              <WalletItem className="current-wallet-burn" style={{ backgroundImage: `url(${selectCurrencies.bg})` }}>
                <div className="wallet-card-header">
                  <div className="wallet-info" onClick={() => router.push(`/wallet/${selectCurrencies.symbol}`)}>
                    <img className="ico-currency" src={selectCurrencies.icon} alt="" />
                    <span className="wallet-name">{selectCurrencies.name}</span>
                  </div>
                  <div className="address-code">
                    <QRCodeModal
                      logoImage={selectCurrencies.icon}
                      address={selectCurrencies.address}
                      type={'address'}
                    />
                  </div>
                </div>
                <div className="wallet-card-content">
                  <span className="balance">
                    {decimalFormatBalance(selectCurrencies.balance, selectCurrencies?.symbol)}{' '}
                    <span className="wallet-symbol">{selectCurrencies.symbol}</span>
                  </span>
                </div>
                <div className="wallet-card-footer">
                  <CopyToClipboard
                    text={selectCurrencies.address}
                    onCopy={() => handleOnCopy(selectCurrencies.address)}
                  >
                    <Button type="primary" className="no-border-btn" icon={<CopyOutlined />}>
                      {selectCurrencies.address.slice(-10) + ' '}
                    </Button>
                  </CopyToClipboard>
                </div>
              </WalletItem>
            </>
          )}
          {!selectCurrencies && (
            <>
              <WalletItem className="current-wallet-burn" style={{ backgroundImage: `url(${defaultSelected.bg})` }}>
                <div className="wallet-card-header">
                  <div className="wallet-info" onClick={() => router.push(`/wallet/${defaultSelected.symbol}`)}>
                    <img className="ico-currency" src={defaultSelected.icon} alt="" />
                    <span className="wallet-name">{defaultSelected.name}</span>
                  </div>
                  <div className="address-code">
                    <QRCodeModal logoImage={defaultSelected.icon} address={defaultSelected.address} type={'address'} />
                  </div>
                </div>
                <div className="wallet-card-content">
                  <span className="balance">
                    {decimalFormatBalance(defaultSelected.balance, defaultSelected?.symbol)}{' '}
                    <span className="wallet-symbol">{defaultSelected.symbol}</span>
                  </span>
                </div>
                <div className="wallet-card-footer">
                  <CopyToClipboard text={defaultSelected.address} onCopy={() => handleOnCopy(defaultSelected.address)}>
                    <Button type="primary" className="no-border-btn" icon={<CopyOutlined />}>
                      {defaultSelected.address.slice(-10) + ' '}
                    </Button>
                  </CopyToClipboard>
                </div>
              </WalletItem>
            </>
          )} */}
        </div>
      }
      footer={
        <Button.Group style={{ width: '100%' }}>
          <UpDownButton className="downVote" onClick={() => handleBurn(false)}>
            <DownVoteSvg />
            &nbsp; {intl.get('general.voteDown')}
          </UpDownButton>
          <UpDownButton className="upVote" onClick={() => handleBurn(true)}>
            <UpVoteSvg />
            &nbsp; {intl.get('general.voteUp')}
          </UpDownButton>
        </Button.Group>
      }
      style={{ top: '0 !important' }}
    >
      <Form>
        <p className="question-txt">
          {intl.get('text.selectXpi')} {/* TODO: Burn multi coin */}
          {/* <Button type="primary" onClick={() => setOpenSelectCurrencies(!openSelectCurrencies)}>
            Select Currencies
          </Button> */}
        </p>

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
          cost: currency.burnFee * selectedAmount + selectedAmount,
          coin: 'XPI'
        })}
      </p>
      <p className="trans-amount">
        {intl.get('burn.trans', {
          amount: TRANSLATION_REQUIRE_AMOUNT
        })}
      </p>
      {/* TODO: Burn multi coin */}
      {/* <>{modalSelectWallet()}</>/ */}
    </Modal>
  );
};
