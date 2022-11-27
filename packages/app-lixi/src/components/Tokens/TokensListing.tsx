import { Button, Input, InputRef, Modal, Space, Table } from 'antd';
import intl from 'react-intl-universal';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ChronikClient } from 'chronik-client';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchAllTokens, selectTokens, postToken, selectToken } from '@store/tokens';
import { showToast } from '@store/toast/actions';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { FilterOutlined, FireOutlined, LeftOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { ColumnType } from 'antd/lib/table';
import { FilterConfirmProps } from 'antd/lib/table/interface';
import Highlighter from 'react-highlight-words';
import { CreateTokenCommand, Token } from '@bcpros/lixi-models';
const chronikClient = new ChronikClient('https://chronik.be.cash/xec');

const StyledTokensListing = styled.div``;

const StyledNavBarHeader = styled.div`
  header {
    justify-content: space-between;
    align-items: center;
    padding: 1rem !important;
  }
  .path-name {
    display: flex;
    align-items: center;
    h2 {
      margin: 0;
    }
  }
`;

const TokensListing: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [valueInput, setValueInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const tokenList = useAppSelector(selectTokens);

  useEffect(() => {
    dispatch(fetchAllTokens());
  }, []);

  const getColumnSearchProps = (dataIndex: any): ColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            className="outline-btn"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
          >
            Search
          </Button>
          <Button
            type="primary"
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            className="outline-btn"
            icon={<SyncOutlined />}
          >
            Reset
          </Button>
          <Button
            type="primary"
            size="small"
            className="outline-btn"
            icon={<FilterOutlined />}
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text, record) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        <Link href="/tokens/feed" passHref>
          <a onClick={() => handleNavigateToken(record)}>{text}</a>
        </Link>
      )
  });

  const columns: ColumnsType<Token> = [
    {
      title: 'Ticker',
      dataIndex: 'ticker',
      key: 'ticker',
      // fixed: 'left',
      ...getColumnSearchProps('ticker')
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      // fixed: 'left',
      ...getColumnSearchProps('name')
    },
    {
      title: 'Burn XPI',
      key: 'lotusBurn',
      sorter: (a, b) =>
        parseInt(a.lotusBurnUp) + parseInt(a.lotusBurnDown) - (parseInt(b.lotusBurnUp) + parseInt(b.lotusBurnDown)),
      render: (_, record) => parseInt(record.lotusBurnUp) + parseInt(record.lotusBurnDown) || 0
    },
    {
      title: 'Comments',
      key: 'comments',
      render: (_, record) => moment(record.comments).format('DD-MM-YYYY HH:mm')
    },
    {
      title: 'Created',
      key: 'createdDate',
      render: (_, record) => moment(record.createdDate).format('DD-MM-YYYY HH:mm')
    },
    {
      title: 'Action',
      key: 'action',
      // fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" className="outline-btn" icon={<FireOutlined />} onClick={() => burnToken()}>
            Burn
          </Button>
        </Space>
      )
    }
  ];

  const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const handleInputTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValueInput(value);
  };

  const handleNavigateToken = token => {
    dispatch(selectToken(token));
  };

  const mapTokenInfo = token => {
    const tokenInfo: CreateTokenCommand = {
      tokenId: token?.slpTxData?.slpMeta?.tokenId,
      tokenDocumentUrl: token?.slpTxData?.genesisInfo?.tokenDocumentUrl,
      tokenType: token?.slpTxData?.slpMeta?.tokenType,
      name: token?.slpTxData?.genesisInfo?.tokenName,
      ticker: token?.slpTxData?.genesisInfo?.tokenTicker,
      createdDate: moment(token?.block?.timestamp, 'X').toDate(),
      comments: moment().toDate(),
      decimals: token?.slpTxData?.genesisInfo?.decimals,
      initialTokenQuantity: token?.initialTokenQuantity,
      totalBurned: token?.tokenStats?.totalBurned,
      totalMinted: token?.tokenStats?.totalMinted
    };
    return tokenInfo;
  };

  const burnToken = () => {
    dispatch(
      showToast('info', {
        message: 'Info',
        description: 'Feature is coming soon...',
        duration: 3
      })
    );
  };

  const addTokenbyId = async () => {
    try {
      if (valueInput) {
        await chronikClient
          .token(valueInput)
          .then(rs => {
            const token = mapTokenInfo(rs) || null;
            setValueInput('');
            dispatch(postToken(token));
          })
          .catch(err => {
            if (err.message.includes('Token txid not found')) {
              dispatch(
                showToast('error', {
                  message: 'Error',
                  description: intl.get('token.tokenIdNotFound'),
                  duration: 5
                })
              );
            } else {
              dispatch(
                showToast('error', {
                  message: 'Error',
                  description: intl.get('token.tokenIdInvalid'),
                  duration: 5
                })
              );
            }
          });
      } else {
        dispatch(
          showToast('info', {
            message: 'Info',
            description: intl.get('token.inputTokenId'),
            duration: 2
          })
        );
      }
    } catch (error) {
      dispatch(
        showToast('error', {
          message: 'Error',
          description: error,
          duration: 5
        })
      );
    }
  };

  return (
    <>
      <StyledNavBarHeader>
        <NavBarHeader>
          <div className="path-name">
            <Link href="/" passHref>
              <LeftOutlined onClick={() => router.back()} />
            </Link>
            <PathDirection>
              <h2>Tokens</h2>
            </PathDirection>
          </div>
          <Button type="primary" className="outline-btn" onClick={() => setIsModalVisible(!isModalVisible)}>
            {intl.get('token.importToken')}
          </Button>
        </NavBarHeader>
      </StyledNavBarHeader>
      <StyledTokensListing>
        <Table
          scroll={{ x: true }}
          className="table-tokens"
          columns={columns}
          dataSource={tokenList}
          pagination={tokenList.length >= 30 ? {} : false}
        />
      </StyledTokensListing>

      <Modal
        title={intl.get('token.importToken')}
        visible={isModalVisible}
        onOk={addTokenbyId}
        onCancel={() => setIsModalVisible(!isModalVisible)}
        cancelButtonProps={{ type: 'primary' }}
      >
        <Input value={valueInput} placeholder={intl.get('token.inputTokenId')} onChange={e => handleInputTokenId(e)} />
      </Modal>
    </>
  );
};

export default TokensListing;
