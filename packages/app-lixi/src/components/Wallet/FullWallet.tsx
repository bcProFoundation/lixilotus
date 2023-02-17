import { SearchOutlined } from '@ant-design/icons';
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

interface UserItem {
  email: string;
  gender: string;
  name: {
    first: string;
    last: string;
    title: string;
  };
  nat: string;
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
}

const TransactionHistory = styled.div`
  background: #fff;
  padding: 0 2rem;
  .header-transaction {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 400;
    font-size: 22px;
    line-height: 28px;
    color: #1e1a1d;
    span {
      font-size: 17px;
    }
  }
  .content-transaction {
    margin-top: 1rem;
    height: 400px;
    overflow: scroll;
    .tx-history-header {
      text-align: left;
      text-transform: uppercase;
      margin: 12px 0;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: #4e444b;
    }
    .ant-list-item {
      padding: 1rem;
      border: 1px solid rgba(128, 116, 124, 0.12) !important;
      border-radius: 1rem;
      background: #fff;
      margin-bottom: 8px;
      .ant-list-item-meta-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        .ant-list-item-meta-title {
          margin-bottom: 0;
        }
        .amount {
          font-size: 14px;
          &.increase {
            color: #37a372;
          }
          &.decrease {
            color: #ba1b1b;
          }
        }
        .tx-transaction {
          p {
            margin: 0;
            text-align: left;
          }
          .tx-action {
            letter-spacing: 0.25px;
            color: #001e2e;
          }
          .tx-memo {
            letter-spacing: 0.25px;
            color: rgba(0, 30, 46, 0.6);
          }
        }
      }
      .tx-info {
        .tx-status {
          background: linear-gradient(0deg, rgba(0, 101, 141, 0.08), rgba(0, 101, 141, 0.08)), #fafafb;
          border-radius: 4px;
          font-size: 12px;
          color: rgba(0, 30, 46, 0.6);
          letter-spacing: 0.4px;
        }
        .tx-date {
          font-size: 12px;
          color: rgba(0, 30, 46, 0.6);
          letter-spacing: 0.4px;
        }
      }
    }
  }
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const FullWalletWrapper = styled.div`
  width: 100%;
  max-width: 816px;
  margin: 1rem auto;
  background: var(--bg-color-light-theme);
  border-radius: 20px;
  @media (max-width: 768px) {
    border: none;
    padding-bottom: 9rem;
  }
`;

const FullWalletComponent: React.FC = () => {
  const trimLength = 8;
  const dispatch = useAppDispatch();

  const selectedAccount = useAppSelector(getSelectedAccount);
  const currentLocale = useAppSelector(getCurrentLocale);

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
      <FullWalletWrapper>
        <WalletInfoComponent />
        <ClaimComponent isClaimFromAccount={true}></ClaimComponent>
        <TransactionHistory>
          <div className="header-transaction">
            {intl.get('account.transactionHistory')}
            <SearchOutlined />
          </div>
          <div className="content-transaction">
            {Object.keys(walletParsedHistoryGroupByDate).map(index => {
              return (
                <>
                  <h3 className="tx-history-header">{index}</h3>
                  <List>
                    <VirtualList data={walletParsedHistoryGroupByDate[index]} itemHeight={47} itemKey="email">
                      {(item: Tx & { parsed: ParsedChronikTx }) => {
                        let memo = '';
                        if (item.parsed.isLotusMessage) {
                          if (item.parsed.isEncryptedMessage && item.parsed.decryptionSuccess) {
                            memo = item.parsed.opReturnMessage ?? '';
                          } else {
                            memo = item.parsed.opReturnMessage ?? '';
                          }
                        }
                        return (
                          <List.Item key={item.txid}>
                            <List.Item.Meta
                              title={
                                <a className={item.parsed.incoming ? 'amount increase' : 'amount decrease'}>
                                  {item.parsed.incoming
                                    ? '+ ' + item.parsed.xpiAmount + ' XPI'
                                    : '- ' + item.parsed.xpiAmount + ' XPI'}
                                </a>
                              }
                              description={
                                <div className="tx-transaction">
                                  <p className="tx-action">
                                    {item.parsed.incoming ? (
                                      <p>
                                        {intl.get('account.from')}:{' '}
                                        {item.parsed.replyAddress && (
                                          <FormattedTxAddress address={item.parsed.replyAddress.slice(-trimLength)} />
                                        )}
                                      </p>
                                    ) : (
                                      <p>
                                        {intl.get('account.to')}:{' '}
                                        {item.parsed.destinationAddress && (
                                          <FormattedTxAddress
                                            address={item.parsed.destinationAddress.slice(-trimLength)}
                                          />
                                        )}
                                      </p>
                                    )}
                                  </p>
                                  <p className="tx-memo">{memo}</p>
                                </div>
                              }
                            />
                            <div className="tx-info">
                              <div className="tx-status"></div>
                              <p className="tx-date">{formatDate(item.timeFirstSeen)}</p>
                              {item.parsed.incoming && (
                                <Link
                                  href={{
                                    pathname: '/send',
                                    query: { replyAddress: item.parsed.replyAddress }
                                  }}
                                >
                                  <Button size="small" type="text">
                                    <p>
                                      <Reply /> {intl.get('account.reply')}
                                    </p>
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </List.Item>
                        );
                      }}
                    </VirtualList>
                  </List>
                </>
              );
            })}
          </div>
        </TransactionHistory>
      </FullWalletWrapper>
    </>
  );
};

export default FullWalletComponent;
