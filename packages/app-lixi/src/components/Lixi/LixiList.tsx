import { Button, Checkbox, Col, Input, Modal, Row, Spin, Typography } from 'antd';
import { Lixi } from '@bcpros/lixi-models/lib/lixi';
import { useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import LixiListItem from './LixiListItem';
import styled from 'styled-components';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import intl from 'react-intl-universal';

const { Text } = Typography;

const StyledSearchLixi = styled(Input)`
  border-radius: 5px;
`;

const StyledFilterButton = styled(Button)`
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
  const isLoading = useAppSelector(getIsGlobalLoading);
  const [isModalVisible, setModalVisible] = useState(false);

  const [isChecked, setChecked] = useState(false);

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

  const handleApplyFilter = () => {
    lixies = lixies.filter(item => {
      if ('checkedStatusValues' in selectedFilterList && item.status == selectedFilterList['checkedStatusValues']) {
      }
    });
    setModalVisible(false);
  };

  return (
    <>
      <Row>
        <Col span={21}>
          <StyledSearchLixi placeholder="Search lixi" suffix={<SearchOutlined />} />
        </Col>
        <Col span={2} offset={1}>
          <StyledFilterButton onClick={showFilterModal} type="primary" icon={<FilterOutlined />}></StyledFilterButton>
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
                <Text type="secondary">Status</Text>
              </StyledCol>
              <StyledCheckboxGroup onChange={getSelectedStatus}>
                <Row>
                  <StyledCol span={12}>
                    <Checkbox value="active">Active</Checkbox>
                  </StyledCol>
                  <StyledCol span={12}>
                    <Checkbox value="locked">Archived</Checkbox>
                  </StyledCol>
                </Row>
              </StyledCheckboxGroup>
            </Row>
          </StyledFilterModal>
        </Col>
      </Row>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
        <div style={{ paddingTop: '20px' }}>
          {lixies && lixies.length > 0 && lixies && lixies.map(item => <LixiListItem key={item.id} lixi={item} />)}
        </div>
      </Spin>
    </>
  );
};

export default LixiList;
