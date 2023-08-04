import Icon, { CopyOutlined, FilterOutlined, RightOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import BurnSvg from '@assets/icons/burn.svg';
import UpVoteSvg from '@assets/icons/upVotePurple.svg';
import { BurnForType, BurnQueueCommand, BurnType } from '@bcpros/lixi-models/lib/burn';
import { Counter } from '@components/Common/Counter';
import InfoCardUser from '@components/Common/InfoCardUser';
import { currency } from '@components/Common/Ticker';
import { InfoSubCard } from '@components/Lixi';
import { WalletContext } from '@context/walletProvider';
import useXPI from '@hooks/useXPI';
import { IconBurn } from '@components/Posts/PostDetail';
import { AuthorizationContext } from '@context/index';
import { CreateTokenInput, OrderDirection, TokenEdge, TokenOrderField } from '@generated/types.generated';
import useDidMountEffectNotification from '@local-hooks/useDidMountEffectNotification';
import { setTransactionReady } from '@store/account/actions';
import { addBurnQueue, addBurnTransaction, clearFailQueue, getFailQueue } from '@store/burn';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { openModal } from '@store/modal/actions';
import { getCurrentThemes } from '@store/settings';
import { showToast } from '@store/toast/actions';
import { useCreateTokenMutation, useTokenQuery, useTokensQuery } from '@store/token/tokens.api';
import { getAllWalletPaths, getSlpBalancesAndUtxos, getWalletStatus } from '@store/wallet';
import { formatBalance, fromSmallestDenomination } from '@utils/cashMethods';
import { Button, Form, Image, Input, InputRef, Modal, Space, Table, Tooltip, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ColumnType } from 'antd/lib/table';
import { FilterConfirmProps } from 'antd/lib/table/interface';
import { push } from 'connected-next-router';
import makeBlockie from 'ethereum-blockies-base64';
import moment from 'moment';
import Link from 'next/link';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Highlighter from 'react-highlight-words';
import { Controller, useForm } from 'react-hook-form';
import intl from 'react-intl-universal';
import styled from 'styled-components';
import { BurnTokenData, TokenItem } from './TokensFeed';
import { getSelectedAccountId } from '@store/account';
import { useCreateFollowTokenMutation, useDeleteFollowTokenMutation } from '@store/follow/follows.api';
import FollowSvg from '@assets/icons/follow.svg';
import { OPTION_BURN_TYPE, OPTION_BURN_VALUE } from '@bcpros/lixi-models/constants';
import { BurnData } from '@components/Posts/PostDetail';
import ReactionToken from '@components/Common/ReactionToken';
import useAuthorization from '../Common/Authorization/use-authorization.hooks';
import { useRouter } from 'next/router';
import { CreateFollowTokenInput, DeleteFollowTokenInput } from '@bcpros/lixi-models';

const StyledTokensListing = styled.div`
  .table-tokens {
    display: block;
    @media (max-width: 768px) {
      display: none;
    }

    .follow-btn {
      width: 28px;
      display: flex;
      flex-wrap: nowrap;
      justify-content: center;
      align-items: center;

      span {
        svg {
          width: 28px;
          height: 28px;
          letter-spacing: 0.25px;
          margin: 0;
          filter: var(--filter-svg-gray-color);
        }

        &.isFollowed {
          svg {
            filter: var(--filter-color-primary);
          }
        }
      }
    }
  }
  .ant-btn {
    background: none !important;
    &:hover {
      background: transparent !important;
    }
  }
`;

const StyledTokensListingMobile = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const CardItemToken = styled.div`
  padding: 1rem;
  background: #fff;
  border: 1px solid var(--boder-item-light);
  border-radius: 18px;
  margin-bottom: 1rem;
  .ant-avatar {
    margin-right: 8px !important;
    width: 40px;
    height: 40px;
  }
  .card-info {
    .name {
      margin-bottom: 4px !important;
    }
  }
  .ant-space {
    margin-bottom: 8px;
  }
  .detail-token {
    margin: 1rem 0;
  }
  .group-action-btn {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    .ant-space {
      margin-bottom: 0;
    }
    button {
      padding: 0;
      &.open-detail {
        min-height: fit-content;
        flex-grow: 1;
        text-align: end;
        align-self: center;
      }
    }
  }
`;

const StyledNavBarHeader = styled.div`
  .navbar-token {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    margin-top: 1rem;
  }
  h2 {
    font-size: 32px;
    line-height: 40px;
  }
`;

const TokensListing = () => {
  const dispatch = useAppDispatch();
  const selectedAccountId = useAppSelector(getSelectedAccountId);
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const slpBalancesAndUtxos = useAppSelector(getSlpBalancesAndUtxos);
  const walletPaths = useAppSelector(getAllWalletPaths);
  const failQueue = useAppSelector(getFailQueue);
  const walletStatus = useAppSelector(getWalletStatus);
  const slpBalancesAndUtxosRef = useRef(slpBalancesAndUtxos);
  const currentTheme = useAppSelector(getCurrentThemes);
  const [hasFollowed, setHasFollowed] = useState([]);

  const authorization = useContext(AuthorizationContext);
  const askAuthorization = useAuthorization();

  const { currentData: tokens, isLoading } = useTokensQuery({
    orderBy: {
      direction: OrderDirection.Desc,
      field: TokenOrderField.CreatedDate
    }
  });

  const [
    createTokenTrigger,
    {
      isLoading: isLoadingCreateToken,
      isSuccess: isSuccessCreateToken,
      isError: isErrorCreateToken,
      error: errorOnCreate
    }
  ] = useCreateTokenMutation();

  const [
    createFollowTokenTrigger,
    {
      isLoading: isLoadingCreateFollowToken,
      isSuccess: isSuccessCreateFollowToken,
      isError: isErrorCreateFollowToken,
      error: errorOnCreateFollowToken
    }
  ] = useCreateFollowTokenMutation();

  const [
    deleteFollowTokenTrigger,
    {
      isLoading: isLoadingDeleteFollowToken,
      isSuccess: isSuccessDeleteFollowToken,
      isError: isErrorDeleteFollowToken,
      error: errorOnDelete
    }
  ] = useDeleteFollowTokenMutation();

  const {
    handleSubmit,
    formState: { errors },
    control
  } = useForm();

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
    onFilter: (value: string, record: TokenEdge) => {
      return record.node.name.toString().toLowerCase().includes(value.toLowerCase());
    },
    render: (text, record) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        <Link href={'/token/' + record.tokenId} passHref>
          <a onClick={() => handleNavigateToken(record)}>{text}</a>
        </Link>
      )
  });

  const handleOnCopy = (id: string) => {
    dispatch(
      showToast('info', {
        message: intl.get('token.copyId'),
        description: id
      })
    );
  };

  const columns: ColumnsType<TokenEdge> = [
    {
      title: '#',
      dataIndex: 'serial',
      key: 'serial',
      render: (_, { node: record }, index) => index + 1
    },
    {
      key: 'image',
      className: 'token-img',
      render: (_, { node: token }) => (
        // eslint-disable-next-line react/jsx-no-undef, @next/next/no-img-element
        <Image
          alt="tokenIcon"
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
      render: (_, { node: token }) => (
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
      ...getColumnSearchProps('ticker'),
      render: (_, { node: token }) => (
        <a style={{ marginTop: '0px', marginBottom: '0px' }} onClick={() => handleNavigateToken(token)}>
          {token.ticker}
        </a>
      )
    },
    {
      title: intl.get('label.name'),
      dataIndex: 'name',
      key: 'name',
      // fixed: 'left',
      ...getColumnSearchProps('name'),
      render: (_, { node: token }) => (
        <a style={{ marginTop: '0px', marginBottom: '0px' }} onClick={() => handleNavigateToken(token)}>
          {token.name}
        </a>
      )
    },
    {
      title: intl.get('general.dana'),
      key: 'lotusBurn',
      sorter: ({ node: a }, { node: b }) => a.lotusBurnScore - b.lotusBurnScore,
      defaultSortOrder: 'descend',
      render: (_, { node: record }) => <Counter num={formatBalance(record.lotusBurnScore)} />
    },
    {
      title: intl.get('label.comment'),
      key: 'comments',
      render: (_, { node: record }) => moment(record.comments).format('DD-MM-YYYY HH:mm')
    },
    {
      title: intl.get('label.created'),
      key: 'createdDate',
      render: (_, { node: record }) => moment(record.createdDate).format('DD-MM-YYYY HH:mm')
    },
    {
      title: intl.get('label.action'),
      key: 'action',
      // fixed: 'right',
      render: (_, { node: record }) => (
        <Space size="middle">
          <ReactionToken token={record} handleBurnForToken={handleBurnForToken} />

          <Tooltip title={intl.get('general.follow')}>
            <Button type="text" className="follow-btn">
              <Icon
                component={() => <FollowSvg />}
                className={hasFollowed.includes(record.tokenId) ? 'isFollowed' : ''}
                onClick={
                  hasFollowed.includes(record.tokenId)
                    ? () => handleUnfollowToken(record.tokenId)
                    : () => handleFollowToken(record.tokenId)
                }
              />
            </Button>
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

  const handleNavigateToken = token => {
    dispatch(push(`/token/${token.tokenId}`));
  };

  useDidMountEffectNotification();

  const handleBurnForToken = async (isUpVote: boolean, token: any, optionBurn?: string) => {
    handleBurn(isUpVote ? true : false, { data: token, burnForType: BurnForType.Token }, optionBurn);
  };

  const handleBurn = async (isUpVote: boolean, burnData: BurnTokenData, optionBurn?: string) => {
    try {
      const burnValue = optionBurn ? OPTION_BURN_VALUE[optionBurn] : '1';
      const { data, burnForType } = burnData;
      if (failQueue.length > 0) dispatch(clearFailQueue());
      const fundingFirstUtxo = slpBalancesAndUtxos.nonSlpUtxos[0];
      const currentWalletPath = walletPaths.filter(acc => acc.xAddress === fundingFirstUtxo.address).pop();
      const { hash160, xAddress } = currentWalletPath;
      const burnType = isUpVote ? BurnType.Up : BurnType.Down;
      const burnedBy = hash160;
      const burnForId = data.tokenId;
      let tipToAddresses: { address: string; amount: string }[] = [];

      if (
        slpBalancesAndUtxos.nonSlpUtxos.length == 0 ||
        fromSmallestDenomination(walletStatus.balances.totalBalanceInSatoshis) < parseInt(burnValue)
      ) {
        throw new Error(intl.get('account.insufficientFunds'));
      }

      const burnCommand: BurnQueueCommand = {
        defaultFee: currency.defaultFee,
        burnType,
        burnForType: burnForType,
        burnedBy,
        burnForId: burnForId,
        tipToAddresses: tipToAddresses,
        burnValue,
        extraArguments: {
          tokenId: data.tokenId,
          minBurnFilter: 0
        }
      };

      dispatch(addBurnQueue(burnCommand));
      dispatch(addBurnTransaction(burnCommand));
    } catch (e) {
      const errorMessage = e.message || intl.get('post.unableToBurn');
      dispatch(
        showToast('error', {
          message: intl.get('toast.error'),
          description: errorMessage,
          duration: 3
        })
      );
    }
  };

  const burnToken = (id: string, tokenId: string) => {
    if (authorization.authorized) {
      handleBurnForToken(true, id, tokenId);
    } else {
      askAuthorization();
    }
  };

  const openBurnModal = (token: TokenItem) => {
    if (authorization.authorized) {
      dispatch(openModal('BurnModal', { burnForType: BurnForType.Token, id: token.tokenId }));
    } else {
      askAuthorization();
    }
  };

  const handleFollowToken = async (tokenId: string) => {
    const createFollowTokenInput: CreateFollowTokenInput = {
      accountId: selectedAccountId,
      tokenId: tokenId
    };
    setHasFollowed(prevState => [...prevState, tokenId]);

    await createFollowTokenTrigger({ input: createFollowTokenInput });
    if (isErrorCreateFollowToken || errorOnCreateFollowToken) {
      setHasFollowed(prevState => prevState.filter(item => item !== tokenId));
    }
  };

  const handleUnfollowToken = async (tokenId: string) => {
    const deleteFollowTokenInput: DeleteFollowTokenInput = {
      accountId: selectedAccountId,
      tokenId: tokenId
    };
    setHasFollowed(prevState => prevState.filter(item => item !== tokenId));

    await deleteFollowTokenTrigger({ input: deleteFollowTokenInput });
    if (isErrorDeleteFollowToken || errorOnDelete) {
      setHasFollowed(prevState => [...prevState, tokenId]);
    }
  };

  const addTokenbyId = async data => {
    const createTokenInput: CreateTokenInput = {
      tokenId: data.tokenId
    };

    try {
      if (createTokenInput) {
        const tokenCreated = await createTokenTrigger({ input: createTokenInput }).unwrap();
        dispatch(
          showToast('success', {
            message: 'Success',
            description: intl.get('token.createTokenSuccessful'),
            duration: 5
          })
        );
        dispatch(push(`/token/${tokenCreated.createToken.tokenId}`));
      }
    } catch (error) {
      const message = errorOnCreate?.message ?? intl.get('token.unableCreateTokenServer');

      dispatch(
        showToast('error', {
          message: 'Error',
          description: message,
          duration: 5
        })
      );
    }

    setIsModalVisible(false);
  };

  const UpvoteIcon = () => {
    return (
      <>
        <UpVoteSvg />
      </>
    );
  };

  useEffect(() => {
    if (slpBalancesAndUtxos === slpBalancesAndUtxosRef.current) return;
    dispatch(setTransactionReady());
  }, [slpBalancesAndUtxos.nonSlpUtxos]);

  useEffect(() => {
    tokens &&
      tokens.allTokens.edges.map(token => {
        if (token.node.isFollowed === true) {
          setHasFollowed(prevState => [...prevState, token.node.tokenId]);
        }
      });
  }, [tokens, isSuccessCreateFollowToken, isSuccessDeleteFollowToken]);

  useDidMountEffectNotification();

  return (
    <>
      <div className="container-token-listing">
        <StyledNavBarHeader>
          <div className="navbar-token">
            <h2></h2>
            <Button type="primary" className="outline-btn" onClick={() => setIsModalVisible(!isModalVisible)}>
              {intl.get('token.importToken')}
            </Button>
          </div>
        </StyledNavBarHeader>
        <StyledTokensListing>
          <Table
            loading={isLoading}
            className="table-tokens"
            columns={columns}
            scroll={{ x: true }}
            dataSource={tokens && tokens.allTokens.edges}
            pagination={tokens && tokens.allTokens.totalCount >= 30 ? {} : false}
            rowKey={record => {
              return record.node.id;
            }}
          />
          <StyledTokensListingMobile>
            {tokens &&
              tokens.allTokens.edges.length > 0 &&
              tokens.allTokens.edges.map(({ node: token }) => {
                return (
                  <React.Fragment key={token.id}>
                    <CardItemToken className="card-item-token">
                      <InfoCardUser
                        name={token.ticker}
                        title={token.name}
                        imgUrl={`${currency.tokenIconsUrl}/32/${token.tokenId}.png`}
                        isDropdown={false}
                      />
                      <div className="detail-token">
                        <InfoSubCard
                          typeName={'Short ID:'}
                          content={token.id.slice(0, 4) + '...' + token.id.slice(-4)}
                          icon={CopyOutlined}
                          onClickIcon={() => handleOnCopy(token.tokenId)}
                        />
                        <InfoSubCard typeName={'Total Quantity:'} content={formatBalance(token.initialTokenQuantity)} />
                        <InfoSubCard
                          typeName={'Created:'}
                          content={moment(token.createdDate).format('YYYY-MM-DD HH:MM')}
                        />
                      </div>
                      <div className="group-action-btn">
                        <Button type="text" onClick={() => openBurnModal(token)}>
                          <img src="/images/ico-burn-up.svg" alt="" />
                        </Button>

                        <Button type="text" className="follow-btn">
                          <Icon
                            component={() => <FollowSvg />}
                            className={token.isFollowed ? 'isFollowed' : ''}
                            onClick={
                              token.isFollowed ? () => handleUnfollowToken(token.id) : () => handleFollowToken(token.id)
                            }
                          />
                        </Button>

                        <Button
                          type="primary"
                          className="no-border-btn open-detail"
                          onClick={() => handleNavigateToken(token)}
                        >
                          {intl.get('general.open')} <RightOutlined />
                        </Button>
                      </div>
                    </CardItemToken>
                  </React.Fragment>
                );
              })}
          </StyledTokensListingMobile>
        </StyledTokensListing>
      </div>

      <Modal
        className={`${currentTheme === 'dark' ? 'ant-modal-dark' : ''} modal-import-token`}
        title={intl.get('token.importToken')}
        transitionName=''
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
