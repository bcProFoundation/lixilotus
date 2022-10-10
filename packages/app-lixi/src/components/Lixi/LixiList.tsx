import { Button, Checkbox, Col, Input, Modal, Row, Spin, Typography } from 'antd';
import { Lixi } from '@bcpros/lixi-models/lib/lixi';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import LixiListItem from './LixiListItem';
import styled from 'styled-components';
import { FilterOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import intl from 'react-intl-universal';
import _ from 'lodash';
import { refreshLixiList } from '@store/account/actions';
import { getSelectedAccount } from 'src/store/account/selectors';
import { openModal } from '@store/modal/actions';

const { Text } = Typography;

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

const LixiList = ({ lixies }: LixiListProps) => {
  const dispatch = useAppDispatch();
  const selectedAccount = useAppSelector(getSelectedAccount);
  const isLoading = useAppSelector(getIsGlobalLoading);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [queryLixi, setQueryLixi] = useState('');
  const [searchLixiParams] = useState(['name', 'amount', 'claimedNum', 'status']);

  useEffect(() => {
    if (selectedAccount) {
      dispatch(refreshLixiList(selectedAccount.id));
    }
  }, []);

  const showFilterModal = () => {
    setModalVisible(true);
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
              {/* {lixies && lixies.length > 0 && lixies.map(item => <LixiListItem key={item.id} lixi={item} />)} */}

              {lixies &&
                lixies.length > 0 &&
                searchLixi(lixies).map(item => <LixiListItem key={item.id} lixi={item} />)}
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
