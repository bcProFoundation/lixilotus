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

const CURRENCIES = [
  {
    name: 'Lotus',
    symbol: 'xpi',
    icon: '/images/currencies/xpi.svg',
    bg: '/images/currencies/bg-xpi.svg'
  },
  {
    name: 'eCash',
    symbol: 'xec',
    icon: '/images/currencies/xec.svg',
    bg: '/images/currencies/bg-xec.svg'
  },
  {
    name: 'Ethereum',
    symbol: 'eth',
    icon: '/images/currencies/eth.svg',
    bg: '/images/currencies/bg-ltc.svg'
  },
  {
    name: 'Near',
    symbol: 'near',
    icon: '/images/currencies/near.svg',
    bg: '/images/currencies/bg-doge.svg'
  },
  {
    name: 'Polkadot',
    symbol: 'dot',
    icon: '/images/currencies/dot.svg',
    bg: '/images/currencies/bg-bch.svg'
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

const WalletItem = styled.div`
  background-size: cover;
  background-position: center;
  border-radius: 1rem;
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
    padding: 0rem 1rem 1rem 1rem;
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
      color: var(--text-color-on-dark);
      &:hover {
        background: none;
        color: var(--text-color-on-dark);
      }
    }
  }
`;

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

  return (
    <>
      <ListWalletContainer>
        {/* <h2 className="title">Currencies</h2> */}
        {CURRENCIES.map(coin => {
          return (
            <WalletItem
              onClick={() => router.push(`/wallet/${coin.symbol}`)}
              className="card"
              style={{ backgroundImage: `url(${coin.bg})` }}
            >
              <div className="wallet-card-header">
                <div className="wallet-info">
                  <img className="ico-currency" src={coin.icon} alt="" />
                  <span className="wallet-name">{coin.name}</span>
                </div>
                <div className="address-code">
                  <QRCodeModal
                    logoImage={coin.icon}
                    address={'lotus_16PSJPYxmBxaJYAd1GGRcVn2nD1vooHJCozd5Dw91'}
                    type={'address'}
                  />
                </div>
              </div>
              <div className="wallet-card-content">
                <span className="balance">
                  10 <span className="wallet-symbol">{coin.symbol}</span>
                </span>
              </div>
              <div className="wallet-card-footer">
                <Button type="primary" className="no-border-btn" icon={<CopyOutlined />}>
                  ooHJCozd5Dw91{' '}
                </Button>
              </div>
            </WalletItem>
          );
        })}
      </ListWalletContainer>
    </>
  );
};

export default ListWallet;
