import Icon, {
  CopyOutlined,
  FilterOutlined,
  FireOutlined,
  LeftOutlined,
  SearchOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Token } from '@bcpros/lixi-models';
import { BurnCommand, BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import { currency } from '@components/Common/Ticker';
import { NavBarHeader, PathDirection } from '@components/Layout/MainLayout';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { burnForUpDownVote, getLatestBurnForToken } from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { showToast } from '@store/toast/actions';
import {
  burnForToken,
  burnForTokenSucceses,
  fetchAllTokens,
  postToken,
  selectToken,
  selectTokens
} from '@store/tokens';
import { getAllWalletPaths, getSlpBalancesAndUtxos } from '@store/wallet';
import { formatBalance } from '@utils/cashMethods';
import { Button, Form, Image, Input, InputRef, message, Modal, notification, Space, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';
import { FilterConfirmProps } from 'antd/lib/table/interface';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Highlighter from 'react-highlight-words';
import { Controller, useForm } from 'react-hook-form';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import makeBlockie from 'ethereum-blockies-base64';
import BurnSvg from '@assets/icons/burn.svg';
import UpVoteSvg from '@assets/icons/upVotePurple.svg';
import { Counter } from '@components/Common/Counter';
import { openModal } from '@store/modal/actions';

const StyledTokensListing = styled.div``;

const StyledNavBarHeader = styled.div`
  .navbar-token {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  h2 {
    font-size: 32px;
    line-height: 40px;
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

  const Wallet = React.useContext(WalletContext);
  const { XPI, chronik } = Wallet;
  const { burnXpi } = useXPI();
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const latestBurnForToken = useAppSelector(getLatestBurnForToken);
  const burnValue = '1';

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

  const handleOnCopy = (id: string) => {
    notification.info({
      message: intl.get('token.copyId'),
      description: id,
      placement: 'top'
    });
  };

  const columns: ColumnsType<Token> = [
    {
      key: 'image',
      className: 'token-img',
      render: (_, token) => (
        // eslint-disable-next-line react/jsx-no-undef, @next/next/no-img-element
        <Image
          width={32}
          height={32}
          src={`${currency.tokenIconsUrl}/32/${token.tokenId}.png`}
          fallback={makeBlockie(token.id)}
          preview={false}
          style={{
            borderRadius: '50%'
          }}
        />
      )
    },
    {
      title: intl.get('label.shortId'),
      key: 'id',
      // fixed: 'left',
      render: (_, token) => (
        <CopyToClipboard text={token.tokenId} onCopy={() => handleOnCopy(token.tokenId)}>
          <p style={{ marginTop: '0px', marginBottom: '0px' }}>
            {token.tokenId.substring(token.tokenId.length - 8).slice(0, 4)}
            <b>{token.tokenId.substring(token.tokenId.length - 4)}</b>
            &nbsp; <CopyOutlined style={{ fontSize: '14px', color: 'rgba(30, 26, 29, 0.6)' }} />
          </p>
        </CopyToClipboard>
      )
    },
    {
      title: intl.get('label.ticker'),
      dataIndex: 'ticker',
      key: 'ticker',
      // fixed: 'left',
      ...getColumnSearchProps('ticker')
    },
    {
      title: intl.get('label.name'),
      dataIndex: 'name',
      key: 'name',
      // fixed: 'left',
      ...getColumnSearchProps('name')
    },
    {
      title: intl.get('label.burnXPI'),
      key: 'lotusBurn',
      sorter: (a, b) => a.lotusBurnUp + a.lotusBurnDown - (b.lotusBurnUp + b.lotusBurnDown),
      defaultSortOrder: 'descend',
      render: (_, record) => <Counter num={formatBalance(record.lotusBurnUp + record.lotusBurnDown)} />
    },
    {
      title: intl.get('label.comment'),
      key: 'comments',
      render: (_, record) => moment(record.comments).format('DD-MM-YYYY HH:mm')
    },
    {
      title: intl.get('label.created'),
      key: 'createdDate',
      render: (_, record) => moment(record.createdDate).format('DD-MM-YYYY HH:mm')
    },
    {
      title: intl.get('label.action'),
      key: 'action',
      // fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={intl.get('general.burnUp')}>
            <Button
              type="text"
              className="outline-btn"
              icon={<UpVoteSvg />}
              style={{ fontSize: '27px', color: '#9E2A9C' }}
              onClick={() => burnToken(record.id)}
            />
          </Tooltip>
          <Tooltip title={intl.get('general.customBurn')}>
            <Button
              type="text"
              className="outline-btn"
              icon={<BurnSvg />}
              style={{ fontSize: '27px' }}
              onClick={() => openBurnModal(record)}
            />
          </Tooltip>
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

  const handleBurnForToken = async (isUpVote: boolean, tokenId: string) => {
    try {
      if (slpBalancesAndUtxos.nonSlpUtxos.length == 0) {
        throw new Error('Insufficient funds');
      }
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { fundingWif, hash160 } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = tokenId;

      const txHex = await burnXpi(
        XPI,
        walletPaths,
        slpBalancesAndUtxos.nonSlpUtxos,
        currency.defaultFee,
        burnType,
        BurnForType.Token,
        burnedBy,
        burnForId,
        burnValue
      );

      const burnCommand: BurnCommand = {
        txHex,
        burnType,
        burnForType: BurnForType.Token,
        burnedBy,
        burnForId,
        burnValue
      };

      dispatch(burnForUpDownVote(burnCommand));
    } catch (e) {
      dispatch(
        showToast('error', {
          message: intl.get('post.unableToBurn'),
          duration: 5
        })
      );
    }
  };

  const burnToken = (id: string) => {
    handleBurnForToken(true, id);
  };

  const openBurnModal = (token: Token) => {
    dispatch(openModal('BurnModal', { isToken: true, token: token }));
  };

  const addTokenbyId = async data => {
    dispatch(postToken(data.tokenId));
    setIsModalVisible(false);
  };

  return (
    <>
      <StyledNavBarHeader>
        <div className="navbar-token">
          <h2>Tokens</h2>
          <Button type="primary" className="outline-btn" onClick={() => setIsModalVisible(!isModalVisible)}>
            {intl.get('token.importToken')}
          </Button>
        </div>
      </StyledNavBarHeader>
      <StyledTokensListing>
        <Table
          className="table-tokens"
          columns={columns}
          scroll={{ x: true }}
          dataSource={tokenList}
          pagination={tokenList.length >= 30 ? {} : false}
        />
      </StyledTokensListing>

      <Modal
        className="modal-import-token"
        title={intl.get('token.importToken')}
        open={isModalVisible}
        onOk={handleSubmit(addTokenbyId)}
        onCancel={() => setIsModalVisible(!isModalVisible)}
        cancelButtonProps={{ type: 'primary' }}
        destroyOnClose={true}
      >
        <Form>
          <Form.Item name="tokenId" style={{ marginBottom: '4px' }}>
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
          <p style={{ color: 'var(--color-danger)' }}>{errors.tokenId && errors.tokenId.message}</p>
        </Form>
      </Modal>
    </>
  );
};

export default TokensListing;
