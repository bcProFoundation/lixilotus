import { Button, Checkbox, Col, Dropdown, Input, Menu, Modal, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import { Lixi } from '@bcpros/lixi-models/lib/lixi';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import LixiListItem, { MoreIcon, typeLixi } from './LixiListItem';
import styled from 'styled-components';
import { FilterOutlined, MoreOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import intl from 'react-intl-universal';
import _ from 'lodash';
import { refreshLixiList } from '@store/account/actions';
import { getSelectedAccount } from 'src/store/account/selectors';
import { openModal } from '@store/modal/actions';
import { getEnvelopes } from 'src/store/envelope/actions';
import { ColumnsType } from 'antd/lib/table';
import { fromSmallestDenomination } from '@utils/cashMethods';
import { archiveLixi, exportSubLixies, renameLixi, selectLixi, unarchiveLixi, withdrawLixi } from '@store/lixi/actions';
import {
  ArchiveLixiCommand,
  ClaimType,
  RenameLixiCommand,
  UnarchiveLixiCommand,
  WithdrawLixiCommand
} from '@bcpros/lixi-models/lib/lixi';
import { RenameLixiModalProps } from './RenameLixiModal';

const { Text } = Typography;

const StyledTable = styled(Table)`
  &.display-table {
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const CreateLixiBtn = styled(Button)``;

const StyledSearchLixi = styled(Input)`
  border-radius: 5px;
`;

const StyledButton = styled(Button)`
  height: 32px;
  background: white;
  border-color: black;
  border-radius: 5px;
`;

const StyledFilterModal = styled(Modal)`
  position: absolute;
  top: auto;
  left: auto;
  right: auto;
  bottom: 0;
  padding-bottom: 0px;
  margin-bottom: 0px;
  max-width: 100%;

  .ant-modal-content {
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;
  }

  .ant-modal-header {
    border-bottom: none;
    border-top-left-radius: 25px;
    border-top-right-radius: 25px;
    padding-bottom: 5px;
  }

  .ant-modal-header {
    padding-top: 10px;

    .ant-modal-title {
      font-size: 23px;
    }
  }

  .ant-modal-footer {
    border-top: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom 20px;

    .btnReset {
      border: none;
      color: #9E2A9C;
      font-size: 17px;
    }

    .btnApply {
      color: #fff;
      background-color: #9E2A9C;
      padding: 24px 30px;
      font-size: 17px;
      display: flex;
      align-items: center;
      border-radius: 20px;
    }
  }
`;

const StyledCol = styled(Col)`
  padding-top: 10px;
  padding-bottom: 10px;
`;

const StyledCheckboxGroup = styled(Checkbox.Group)`
  width: 100%;
`;

type LixiListProps = {
  lixies: Lixi[];
};

interface LixiType {
  id: number;
  name: string;
  type: string;
  value: any;
  budget: string | number;
  redeemed: string | number;
  remaining: string | number;
  status: string;
}

const LixiList = ({ lixies }: LixiListProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const isLoading = useAppSelector(getIsGlobalLoading);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [queryLixi, setQueryLixi] = useState('');
  const [searchLixiParams] = useState(['name', 'amount', 'claimedNum', 'status']);
  const [listMapData, setListMapData] = useState([]);

  useEffect(() => {
    dispatch(getEnvelopes());
    if (selectedAccount) {
      dispatch(refreshLixiList(selectedAccount.id));
    }
  }, []);

  useEffect(() => {
    mapDataListItem();
  }, [lixies]);

  const showFilterModal = () => {
    setModalVisible(true);
  };

  const mapDataListItem = () => {
    let newListLixiType = [];
    lixies.forEach(lixi => {
      let objLixiType: LixiType = {
        id: lixi.id,
        name: lixi.name,
        type: lixi.claimType == ClaimType.Single ? 'Single Code' : 'One-Time Codes',
        value: typeLixi(lixi),
        redeemed:
          lixi.claimType == ClaimType.Single
            ? fromSmallestDenomination(lixi.totalClaim)
            : fromSmallestDenomination(lixi.subLixiTotalClaim),
        remaining:
          lixi.claimType == ClaimType.Single
            ? fromSmallestDenomination(lixi.balance)
            : lixi.subLixiBalance != undefined
            ? lixi.subLixiBalance - fromSmallestDenomination(lixi.subLixiTotalClaim)
            : 0.0,
        budget: lixi.claimType == ClaimType.Single ? lixi.amount : lixi.subLixiBalance,
        status: lixi.status
      };
      newListLixiType.push(objLixiType);
    });
    setListMapData(newListLixiType);
  };

  console.log(lixies);

  const mapActionLixi = lixi => {
    let actionLixi = null;
    let defaultActionLixi = ['Withdraw', 'Rename', 'Export'];
    lixi.status === 'locked' ? defaultActionLixi.unshift('Unarchive') : defaultActionLixi.unshift('Archive');
    actionLixi = defaultActionLixi.map(option => <Menu.Item key={option}>{option}</Menu.Item>);
    return actionLixi;
  };

  let selectedFilterList = {};

  const getSelectedClaimType = (checkedClaimTypeValues: CheckboxValueType[]) => {
    selectedFilterList['checkedClaimTypeValues'] = [...checkedClaimTypeValues];
  };
  const getSelectedLixiType = (checkedLixiTypeValues: CheckboxValueType[]) => {
    selectedFilterList['checkedLixiTypeValues'] = [...checkedLixiTypeValues];
  };
  const getSelectedStatus = (checkedStatusValues: CheckboxValueType[]) => {
    selectedFilterList['checkedStatusValues'] = [...checkedStatusValues];
  };

  // lixies = _.sortBy(lixies, (lixi) => {
  //   return moment(lixi.updatedAt).format('YYYYMMDD');
  // }, ['desc']);

  lixies = _.orderBy(lixies, lixi => lixi.updatedAt, ['desc']);

  const createLixiBtn = () => {
    dispatch(openModal('CreateLixiFormModal', { account: selectedAccount }));
  };

  const handleApplyFilter = () => {
    lixies = lixies.filter(item => {
      if ('checkedStatusValues' in selectedFilterList && item.status == selectedFilterList['checkedStatusValues']) {
      }
    });
    setModalVisible(false);
  };

  const refreshList = () => {
    dispatch(refreshLixiList(selectedAccount.id));
  };

  const searchLixi = lixies => {
    return lixies.filter(lixi => {
      if (lixi.name == '') {
        searchLixiParams.some(newItem => {
          return lixi[newItem].toString().toLowerCase().indexOf(queryLixi.toLowerCase()) > -1;
        });
      } else {
        return searchLixiParams.some(newItem => {
          return lixi[newItem].toString().toLowerCase().indexOf(queryLixi.toLowerCase()) > -1;
        });
      }
    });
  };

  const handleSelectLixi = (lixiId: number) => {
    dispatch(selectLixi(lixiId));
  };

  const handleClickMenu = (e, lixi) => {
    e.domEvent.stopPropagation();
    const postLixiData = {
      id: lixi.id,
      mnemonic: selectedAccount?.mnemonic,
      mnemonicHash: selectedAccount?.mnemonicHash
    };

    const exportLixiData = {
      id: lixi.id,
      mnemonicHash: selectedAccount?.mnemonicHash
    };
    switch (e.key) {
      case 'Archive':
        return dispatch(archiveLixi(postLixiData as ArchiveLixiCommand));
      case 'Unarchive':
        return dispatch(unarchiveLixi(postLixiData as UnarchiveLixiCommand));
      case 'Withdraw':
        return dispatch(withdrawLixi(postLixiData as WithdrawLixiCommand));
      case 'Rename':
        return showPopulatedRenameLixiModal(lixi as Lixi);
      case 'Export':
        return dispatch(exportSubLixies(exportLixiData));
    }
  };

  const showPopulatedRenameLixiModal = (lixi: Lixi) => {
    const command: RenameLixiCommand = {
      id: lixi.id,
      name: lixi.name,
      mnemonic: selectedAccount?.mnemonic,
      mnemonicHash: selectedAccount?.mnemonicHash
    };
    const renameLixiModalProps: RenameLixiModalProps = {
      lixi: lixi,
      onOkAction: renameLixi(command)
    };
    dispatch(openModal('RenameLixiModal', renameLixiModalProps));
  };

  const columns: ColumnsType<LixiType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      onFilter: (value: string, record) => record.name.indexOf(value) === 0,
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend']
    },
    {
      title: 'Type of code',
      dataIndex: 'type',
      key: 'type',
      filters: [
        {
          text: 'Single Code',
          value: 'Single Code'
        },
        {
          text: 'One-time codes',
          value: 'One-Time Codes'
        }
      ],
      onFilter: (value: string, record) => record.type.indexOf(value) === 0
    },
    {
      title: 'Value per redeem',
      dataIndex: 'value',
      key: 'value'
    },
    {
      title: 'Budget (XPI)',
      dataIndex: 'budget',
      key: 'budget'
    },
    {
      title: 'Redeemed (XPI)',
      dataIndex: 'redeemed',
      key: 'redeemed'
    },
    {
      title: 'Remaining (XPI)',
      dataIndex: 'remaining',
      key: 'remaining'
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (_, { status }) => (
        <>
          {status === 'active' ? (
            <Tag color={'green'} key={status}>
              {status.toUpperCase()}
            </Tag>
          ) : (
            <Tag color={'red'} key={status}>
              {status.toUpperCase()}
            </Tag>
          )}
        </>
      ),
      filters: [
        {
          text: 'Actived',
          value: 'active'
        },
        {
          text: 'Failed',
          value: 'failed'
        }
      ],
      onFilter: (value: string, record) => record.status.indexOf(value) === 0
    },
    {
      title: '',
      key: 'action',
      render: lixi => {
        return (
          <Dropdown
            trigger={['click']}
            overlay={<Menu onClick={e => handleClickMenu(e, lixi)}>{mapActionLixi(lixi)}</Menu>}
          >
            <MoreIcon onClick={e => e.stopPropagation()} icon={<MoreOutlined />} size="large"></MoreIcon>
          </Dropdown>
        );
      },
      width: 60
    }
  ];

  return (
    <>
      {selectedAccount ? (
        <>
          <Row>
            <Col span={3}>
              <CreateLixiBtn type="primary" className="outline-btn" onClick={createLixiBtn}>
                New lixi
              </CreateLixiBtn>
            </Col>
            <Col span={16} offset={1}>
              <StyledSearchLixi
                placeholder="Search lixi"
                value={queryLixi}
                onChange={e => setQueryLixi(e.target.value)}
                suffix={<SearchOutlined />}
              />
            </Col>
            <Col span={1} offset={1}>
              <StyledButton
                className="outline-btn"
                onClick={showFilterModal}
                type="primary"
                icon={<FilterOutlined />}
              ></StyledButton>
              <StyledFilterModal
                title="Filter"
                width={'100%'}
                visible={isModalVisible}
                closable={false}
                onOk={() => setModalVisible(false)}
                onCancel={() => setModalVisible(false)}
                footer={[
                  <Button className="btnReset" onClick={() => setModalVisible(false)}>
                    Reset
                  </Button>,
                  <Button className="btnApply" onClick={handleApplyFilter}>
                    Apply
                  </Button>
                ]}
              >
                <Row>
                  <StyledCol span={24}>
                    <Text type="secondary">{intl.get('lixi.claimType')}</Text>
                  </StyledCol>
                  <StyledCheckboxGroup onChange={getSelectedClaimType}>
                    <Row>
                      <StyledCol span={24}>
                        <Checkbox value="0">{intl.get('account.singleCode')}</Checkbox>
                      </StyledCol>
                      <StyledCol span={24}>
                        <Checkbox value="1">{intl.get('account.oneTimeCode')}</Checkbox>
                      </StyledCol>
                    </Row>
                  </StyledCheckboxGroup>
                  <StyledCol span={24}>
                    <Text type="secondary">Value per redeem</Text>
                  </StyledCol>
                  <StyledCheckboxGroup onChange={getSelectedLixiType}>
                    <Row>
                      <StyledCol span={12}>
                        <Checkbox value="0">{intl.get('account.equal')}</Checkbox>
                      </StyledCol>
                      <StyledCol span={12}>
                        <Checkbox value="1">{intl.get('account.random')}</Checkbox>
                      </StyledCol>
                      <StyledCol span={12}>
                        <Checkbox value="2">{intl.get('account.divided')}</Checkbox>
                      </StyledCol>
                    </Row>
                  </StyledCheckboxGroup>
                  <StyledCol span={24}>
                    <Text type="secondary">{intl.get('lixi.status')}</Text>
                  </StyledCol>
                  <StyledCheckboxGroup onChange={getSelectedStatus}>
                    <Row>
                      <StyledCol span={12}>
                        <Checkbox value="active">{intl.get('lixi.active')}</Checkbox>
                      </StyledCol>
                      <StyledCol span={12}>
                        <Checkbox value="locked">{intl.get('lixi.archived')}</Checkbox>
                      </StyledCol>
                    </Row>
                  </StyledCheckboxGroup>
                </Row>
              </StyledFilterModal>
            </Col>
            <Col span={1} offset={1}>
              <StyledButton
                className="outline-btn"
                onClick={refreshList}
                type="primary"
                icon={<ReloadOutlined />}
              ></StyledButton>
            </Col>
          </Row>

          <Spin spinning={isLoading} indicator={CashLoadingIcon}>
            <div style={{ paddingTop: '20px' }}>
              {lixies &&
                lixies.length > 0 &&
                searchLixi(lixies).map(item => <LixiListItem key={item.id} lixi={item} />)}
              <StyledTable
                className="display-table"
                columns={columns}
                dataSource={listMapData}
                onRow={(lixi, rowIndex) => {
                  return {
                    onClick: e => {
                      handleSelectLixi(lixi['id']);
                    } // click row
                  };
                }}
              />
            </div>
          </Spin>
        </>
      ) : (
        intl.get('account.selectLixiFirst')
      )}
    </>
  );
};

export default LixiList;
