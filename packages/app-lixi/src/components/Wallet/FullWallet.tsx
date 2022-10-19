import { SearchOutlined } from '@ant-design/icons';
import ClaimComponent from '@components/Claim';
import { List, message } from 'antd';
import VirtualList from 'rc-virtual-list';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import WalletInfoComponent from './WalletInfo';
import intl from 'react-intl-universal';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { getSelectedAccount } from '@store/account/selectors';
import { silentLogin } from '@store/account/actions';

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

const fakeDataUrl = 'https://randomuser.me/api/?results=20&inc=name,gender,email,nat,picture&noinfo';
const ContainerHeight = 400;

const TransactionHistory = styled.div`
  background: #fff;
  padding: 0 2rem;
  .header-transaction {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 22px;
    font-weight: 600;
    span {
      font-size: 17px;
    }
  }
  .content-transaction {
    .tx-history-header {
      text-align: left;
      color: rgba(28, 55, 69, 0.6);
      letter-spacing: 0.4px;
      font-size: 11px;
      text-transform: uppercase;
      margin: 12px 0;
      font-weight: 600;
    }
    .ant-list-item {
      border: none;
      background: #fafafb;
      padding: 1rem;
      margin-bottom: 4px;
      .ant-list-item-meta-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        .ant-list-item-meta-title {
          margin-bottom: 0;
        }
        .amount {
          font-size: 16px;
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
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 2px 10px rgb(0 0 0 / 5%);
  @media (max-width: 768px) {
    border: none;
  }
`;

const FullWalletComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<UserItem[]>([]);

  const selectedAccount = useAppSelector(getSelectedAccount);

  const appendData = () => {
    fetch(fakeDataUrl)
      .then(res => res.json())
      .then(body => {
        setData(data.concat(body.results));
        message.success(`${body.results.length} more items loaded!`);
      });
  };

  useEffect(() => {
    if (selectedAccount) {
      dispatch(silentLogin(selectedAccount.mnemonic));
    }
    appendData();
  }, []);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === ContainerHeight) {
      appendData();
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
            <h3 className="tx-history-header">Recent</h3>
            <List>
              <VirtualList data={data} height={ContainerHeight} itemHeight={47} itemKey="email" onScroll={onScroll}>
                {(item: UserItem) => (
                  <List.Item key={item.email}>
                    <List.Item.Meta
                      title={
                        <a className={item.name.last.includes('n') ? 'amount increase' : 'amount decrease'}>
                          {item.name.last.includes('n')
                            ? '+ ' + Math.random() * 999 + 'XPI'
                            : '- ' + Math.random() * 999 + 'XPI'}
                        </a>
                      }
                      description={
                        <div className="tx-transaction">
                          <p className="tx-action">To: {item.name.last}</p>
                          <p className="tx-memo">Happy birthday to you!</p>
                        </div>
                      }
                    />
                    <div className="tx-info">
                      <div className="tx-status">Complete</div>
                      <p className="tx-date">08/05/2022</p>
                    </div>
                  </List.Item>
                )}
              </VirtualList>
            </List>
          </div>
        </TransactionHistory>
      </FullWalletWrapper>
    </>
  );
};

export default FullWalletComponent;
