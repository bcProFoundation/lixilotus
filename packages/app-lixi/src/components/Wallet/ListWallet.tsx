import { CopyOutlined, LockOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import ClaimComponent from '@components/Claim';
import { Button, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import React from 'react';
import styled from 'styled-components';
import WalletInfoComponent from './WalletInfo';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { getWalletParsedTxHistory } from '@store/wallet';
import { ParsedChronikTx } from '@utils/chronik';
import { Tx } from 'chronik-client';
import { formatDate } from '@utils/formatting';
import _ from 'lodash';
import { getCurrentLocale } from '@store/settings/selectors';
import { FormattedTxAddress } from '@components/Common/FormattedWalletAddress';
import Link from 'next/link';
import Reply from '@assets/icons/reply.svg';
import { BurnForType } from '@bcpros/lixi-models/lib/burn';
import { selectTokens } from '@store/token';
import { useCommentQuery } from '@store/comment/comments.generated';
import { QRCodeModal } from '@components/Common/QRCodeModal';
import { useRouter } from 'next/router';
import { showToast } from '@store/toast/actions';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { fromSmallestDenomination } from '@utils/cashMethods';

export const CURRENCIES = [
  {
    name: 'Lotus',
    symbol: 'xpi',
    icon: '/images/currencies/xpi.svg',
    bg: '/images/currencies/bg-xpi.svg',
    balance: 28735,
    address: 'lotus_16PSJPYxmBxaJYAd1GGRcVn2nD1vooHJCozd5Dw91'
  },
  {
    name: 'eCash',
    symbol: 'xec',
    icon: '/images/currencies/xec.svg',
    bg: '/images/currencies/bg-xec.svg',
    balance: 48120.24,
    address: 'ecash:qp8ks7622cklc7c9pm2d3ktwzctack6njq6q83ed9x'
  },
  {
    name: 'Ethereum',
    symbol: 'eth',
    icon: '/images/currencies/eth.svg',
    bg: '/images/currencies/bg-ltc.svg',
    balance: 57.7,
    address: '0x406f46a756c42e1f0e2cf5fc6d4c65f8cfae569d'
  },
  {
    name: 'Near',
    symbol: 'near',
    icon: '/images/currencies/near.svg',
    bg: '/images/currencies/bg-near.svg',
    balance: 248.412,
    address: 'a9386360b06f9a8961f4e80e69f15d9416c1b558c379be00cb29c459c60f332e'
  },
  {
    name: 'Polkadot',
    symbol: 'dot',
    icon: '/images/currencies/dot.svg',
    bg: '/images/currencies/bg-dot.svg',
    balance: 42.412,
    address: '12hxiaYpZaA1t2GznEmYdsUYPgij5eZQVkCk92bcPPicMy35'
  },
  {
    name: 'Solana',
    symbol: 'sol',
    icon: '/images/currencies/sol.svg',
    bg: '/images/currencies/bg-sol.svg',
    balance: 48.424,
    address: '12hxiaYpZaA1t2GznEmYdsUYPgij5eZQVkCk92bcPPicMy35'
  }
];

const ListWalletContainer = styled.div`
  margin-top: 1rem;
  .title {
    text-align: left;
    margin-top: 1rem;
  }
  @media (min-width: 960px) {
    padding: 0 10rem;
  }
`;

export const WalletItem = styled.div`
  border: 1px solid var(--light-toast-title);
  box-shadow: 1rem 1rem 2.5rem 0 rgb(0 0 0 / 5%);
  background-size: cover !important;
  background-position: center !important;
  border-radius: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  .wallet-card-header {
    padding: 1rem 1rem 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .ico-currency {
      width: 40px;
      height: 40px;
      margin-right: 8px;
    }
    .wallet-name {
      color: var(--text-color-primary-dark);
      font-size: 15px;
      font-weight: 500;
    }
    .address-code {
      svg {
        border-radius: 8px;
        width: 60px;
        height: 60px;
      }
    }
  }
  .wallet-card-content {
    text-align: left;
    padding: 0rem 1rem 3rem 1rem;
    .balance {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-color-primary-dark);
      font-size: 20px;
      font-weight: 500;
    }
    .wallet-symbol {
      color: var(--text-color-on-dark);
      font-size: 12px;
      text-transform: uppercase;
    }
  }
  .wallet-card-footer {
    text-align: right;
    background: linear-gradient(270deg, rgba(0, 30, 46, 0.24) 2.04%, rgba(0, 30, 46, 0) 100%);
    border-radius: 8px 8px 16px 16px;
    button {
      font-size: 10px;
      color: var(--text-color-on-dark) !important;
      &:hover {
        background: transparent !important;
        color: var(--text-color-on-dark);
      }
    }
  }
`;

export const decimalFormatBalance = (balanceWallet: any, coin?: string) => {
  let balance: any = balanceWallet;
  if (coin === 'xpi') {
    balance = fromSmallestDenomination(balanceWallet) || 0;
  }
  if (typeof balance === 'string') balance = balance.replace(/,/g, '');
  if (isNaN(Number(balance)) || Number(balance) <= 0) {
    return '0.00';
  } else {
    if (Number(balance) < 10) {
      return Number(Number(balance).toFixed(Math.round(1 / Number(balance)).toString().length + 2)).toLocaleString(
        'en-GB'
      );
    } else {
      return Number(Number(balance).toFixed(Math.round(1 / Number(balance)).toString().length + 1)).toLocaleString(
        'en-GB'
      );
    }
  }
};

const ListWallet = () => {
  const trimLength = 8;
  const dispatch = useAppDispatch();

  const selectedAccount = useAppSelector(getSelectedAccount);
  const currentLocale = useAppSelector(getCurrentLocale);
  const allTokens = useAppSelector(selectTokens);
  const router = useRouter();

  const walletParsedHistory = useAppSelector(getWalletParsedTxHistory);
  const orderedWalletParsedHistory = _.orderBy(walletParsedHistory, x => x.timeFirstSeen, 'desc');
  const walletParsedHistoryGroupByDate = _.groupBy(orderedWalletParsedHistory, item => {
    const currentMonth = new Date().getMonth();
    const dateTime = new Date(formatDate(item.timeFirstSeen));
    if (currentMonth == dateTime.getMonth()) return intl.get('account.recent');
    const month = dateTime.toLocaleString('en', { month: 'long' });
    return month + ' ' + dateTime.getFullYear();
  });

  const defaultSelected = {
    name: 'Lotus',
    symbol: 'xpi',
    icon: '/images/currencies/xpi.svg',
    bg: '/images/currencies/bg-xpi.svg',
    balance: selectedAccount?.balance,
    address: selectedAccount?.address
  };

  const handleOnCopy = (id: string) => {
    dispatch(
      showToast('info', {
        message: intl.get('token.copyId'),
        description: id
      })
    );
  };

  return (
    <>
      <ListWalletContainer>
        {/* <h2 className="title">List Wallets</h2> */}
        {CURRENCIES.map(coin => {
          if (coin.symbol === 'xpi') {
            coin = defaultSelected;
          }
          return (
            <WalletItem style={{ backgroundImage: `url(${coin.bg})` }}>
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
                  {decimalFormatBalance(coin.balance, coin.symbol)} <span className="wallet-symbol">{coin.symbol}</span>
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
      </ListWalletContainer>
    </>
  );
};

export default ListWallet;
