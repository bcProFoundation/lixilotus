import { Button, Checkbox, Col, Input, Modal, Row, Spin, Typography } from 'antd';
import { Lixi } from '@bcpros/lixi-models/lib/lixi';
import { useAppSelector } from 'src/store/hooks';
import { getIsGlobalLoading } from 'src/store/loading/selectors';
import { CashLoadingIcon } from '@bcpros/lixi-components/components/Common/CustomIcons';
import LixiListItem from './LixiListItem';
import styled from 'styled-components';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';

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
  }
`;

const StyledCol = styled(Col)`
  padding-top: 10px;
  padding-bottom: 10px;
`;

type LixiListProps = {
  lixies: Lixi[];
};

const LixiList = ({ lixies }: LixiListProps) => {
  const isLoading = useAppSelector(getIsGlobalLoading);
  const [isModalVisible, setModalVisible] = useState(false);

  const typeOfCodeOptions = ['Single code', 'One-time codes'];
  const valuePerRedeemOptions = ['Equal', 'Random', 'Divided'];
  const statusOptions = ['Waiting', 'Running', 'Ended', 'Archived'];

  const showFilterModal = () => {
    setModalVisible(true);
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
            onOk={() => setModalVisible(false)}
            okText={'Apply'}
            onCancel={() => setModalVisible(false)}
            cancelText={'Reset'}
            maskClosable={true}
            closable={false}
          >
            <Row>
              <StyledCol span={24}>
                <Text type="secondary">Type of code</Text>
              </StyledCol>
              {typeOfCodeOptions.map((item, index) => {
                return (
                  <StyledCol span={24}>
                    <Checkbox>{item}</Checkbox>
                  </StyledCol>
                );
              })}
              <StyledCol span={24}>
                <Text type="secondary">Value per redeem</Text>
              </StyledCol>
              {valuePerRedeemOptions.map((item, index) => {
                return index !== 2 ? (
                  <StyledCol span={12}>
                    <Checkbox>{item}</Checkbox>
                  </StyledCol>
                ) : (
                  <StyledCol span={24}>
                    <Checkbox>{item}</Checkbox>
                  </StyledCol>
                );
              })}
              <StyledCol span={24}>
                <Text type="secondary">Status</Text>
              </StyledCol>
              {statusOptions.map((item, index) => {
                return (
                  <StyledCol span={12}>
                    <Checkbox>{item}</Checkbox>
                  </StyledCol>
                );
              })}
            </Row>
          </StyledFilterModal>
        </Col>
      </Row>
      <Spin spinning={isLoading} indicator={CashLoadingIcon}>
        <div style={{ paddingTop: '20px' }}>
          {lixies && lixies.length > 0 && lixies.map(item => <LixiListItem key={item.id} lixi={item} />)}
        </div>
      </Spin>
    </>
  );
};

export default LixiList;
