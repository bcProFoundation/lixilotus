import { LockOutlined, SearchOutlined } from '@ant-design/icons';
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
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
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
            margin-top: 16px;
          }
        }
      }
      .tx-info {
        margin-top: 24px;
        .tx-status {
          background: linear-gradient(0deg, rgba(0, 101, 141, 0.08), rgba(0, 101, 141, 0.08)), #fafafb;
          border-radius: 4px;
          font-size: 12px;
          color: rgba(0, 30, 46, 0.6);
          letter-spacing: 0.25px;
        }
        .tx-date {
          font-size: 12px;
          color: rgba(0, 30, 46, 0.6);
          letter-spacing: 0.25px;
        }
      }
      .icon-reply {
        margin-top: 6.5px;
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
  const allTokens = useAppSelector(selectTokens);

  const walletParsedHistory = useAppSelector(getWalletParsedTxHistory);
  const orderedWalletParsedHistory = _.orderBy(walletParsedHistory, x => x.timeFirstSeen, 'desc');
  const walletParsedHistoryGroupByDate = _.groupBy(orderedWalletParsedHistory, item => {
    const currentMonth = new Date().getMonth();
    const dateTime = new Date(formatDate(item.timeFirstSeen));
    if (currentMonth == dateTime.getMonth()) return intl.get('account.recent');
    const month = dateTime.toLocaleString('en', { month: 'long' });
    return month + ' ' + dateTime.getFullYear();
  });

  const getBurnForType = (burnForType: BurnForType) => {
    const typeValuesArr = Object.values(BurnForType);
    const burnForTypeString = Object.keys(BurnForType)[typeValuesArr.indexOf(burnForType as unknown as BurnForType)];
    return burnForTypeString;
  };

  const getUrl = (burnForType: BurnForType, burnForId: string) => {
    let burnForTypeString = getBurnForType(burnForType);
    let idComment = burnForId;

    if (burnForType == BurnForType.Token && burnForId.length !== 64) {
      const searchTokenID = allTokens.find(token => token.id === burnForId);
      if (searchTokenID) {
        burnForId = searchTokenID.tokenId;
      } else {
        return '/404';
      }
    }
    if (burnForType == BurnForType.Comment) {
      burnForTypeString = getBurnForType(BurnForType.Post);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { currentData, isSuccess } = useCommentQuery({ id: burnForId });
      if (isSuccess) {
        burnForId = currentData.comment.commentToId;
      }
    }

    return `/${burnForTypeString.toLowerCase()}/${burnForId}`;
  };

  const showAmount = (item: Tx & { parsed: ParsedChronikTx }) => {
    const xpiBurnAndGiftAmount = Number(item.parsed.xpiBurnAmount) + Number(item.parsed.xpiAmount);
    if (item.parsed.isBurn) {
      if (item.parsed.incoming) {
        return ' +' + item.parsed.xpiAmount + ' XPI';
      } else {
        return '- ' + xpiBurnAndGiftAmount + ' XPI';
      }
    } else {
      if (item.parsed.incoming) {
        return '+ ' + item.parsed.xpiAmount + ' XPI';
      } else {
        return '- ' + item.parsed.xpiAmount + ' XPI';
      }
    }
  };

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
                                  {showAmount(item)}
                                </a>
                              }
                              description={
                                <div className="tx-transaction">
                                  <p className="tx-action">
                                    {item.parsed.isBurn ? (
                                      <p>
                                        {intl.get('general.burnForType')}:{' '}
                                        {item.parsed.burnInfo && (
                                          <Link
                                            href={{
                                              pathname: getUrl(
                                                item.parsed.burnInfo.burnForType,
                                                item.parsed.burnInfo.burnForId
                                              ),
                                              query: item.parsed.burnInfo.burnForType == BurnForType.Comment && { comment: item.parsed.burnInfo.burnForId }
                                            }}
                                          >
                                            <Button size="small" type="text">
                                              <p style={{ fontWeight: 'bold' }}>
                                                {getBurnForType(item.parsed.burnInfo.burnForType)}
                                              </p>
                                            </Button>
                                          </Link>
                                        )}
                                      </p>
                                    ) : item.parsed.incoming ? (
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
                                  {!_.isEmpty(memo) && (
                                    <p className="tx-memo">
                                      <LockOutlined /> {memo}
                                    </p>
                                  )}
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
                                    query: { replyAddress: item.parsed.replyAddress, isReply: true }
                                  }}
                                >
                                  <Button size="small" type="text">
                                    <p className="icon-reply">
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
                  </List >
                </>
              );
            })}
          </div>
        </TransactionHistory>
      </FullWalletWrapper >
    </>
  );
};

export default FullWalletComponent;
