import { Button, Input, InputRef, Modal, Space, Table, Form } from 'antd';
import intl from 'react-intl-universal';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { fetchAllTokens, selectTokens, postToken, selectToken } from '@store/tokens';
import { showToast } from '@store/toast/actions';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { FilterOutlined, FireOutlined, LeftOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { ColumnType } from 'antd/lib/table';
import { FilterConfirmProps } from 'antd/lib/table/interface';
import Highlighter from 'react-highlight-words';
import { Token } from '@bcpros/lixi-models';
import { useForm, Controller } from 'react-hook-form';

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
  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm();

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
        <Link href="/token/feed" passHref>
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

  const burnToken = () => {
    dispatch(
      showToast('info', {
        message: 'Info',
        description: 'Feature is coming soon...',
        duration: 3
      })
    );
  };

  const addTokenbyId = async data => {
    dispatch(postToken(data.tokenId));
    setIsModalVisible(false);
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
          className="table-tokens"
          columns={columns}
          dataSource={tokenList}
          pagination={tokenList.length >= 30 ? {} : false}
        />
      </StyledTokensListing>

      <Modal
        title={intl.get('token.importToken')}
        visible={isModalVisible}
        onOk={handleSubmit(addTokenbyId)}
        onCancel={() => setIsModalVisible(!isModalVisible)}
        cancelButtonProps={{ type: 'primary' }}
        destroyOnClose={true}
      >
        <Form>
          <Form.Item name="tokenId">
            <Controller
              name="tokenId"
              control={control}
              rules={{
                required: {
                  value: true,
                  message: intl.get('token.tokenIdNotFound')
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input onChange={onChange} onBlur={onBlur} value={value} placeholder={intl.get('token.inputTokenId')} />
              )}
            />
          </Form.Item>
          <p>{errors.tokenId && errors.tokenId.message}</p>
        </Form>
      </Modal>
    </>
  );
};

export default TokensListing;
