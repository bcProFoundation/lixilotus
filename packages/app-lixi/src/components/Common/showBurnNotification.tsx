import { Spin, Collapse, notification, Space } from 'antd';
import styled from 'styled-components';
import { FireTwoTone, LoadingOutlined } from '@ant-design/icons';
import { BurnForType, BurnType } from '@bcpros/lixi-models/lib/burn';
import intl from 'react-intl-universal';

const { Panel } = Collapse;
const antIcon = <LoadingOutlined style={{ fontSize: 20 }} spin />;

const StyledCollapse = styled(Collapse)`
  .ant-collapse-header {
    font-size: 16px;
    padding: 0px 0px 5px 0px !important;
  }
  .ant-collapse-content-box {
    padding: 5px 0px 5px 0px !important;
  }
`;

const StyledNotificationContent = styled.div`
  font-size: 14px;
`;

export const showBurnNotification = (toastType: any, burnQueue?, failQueue?) => {
  const getType = burnForType => {
    switch (burnForType) {
      case BurnForType.Post:
        return intl.get('burn.post');
      case BurnForType.Comment:
        return intl.get('burn.comment');
      case BurnForType.Token:
        return intl.get('burn.token');
    }
  };
  switch (toastType) {
    //TODO: Burn NOtification error
    case 'info':
      notification.open({
        type: toastType,
        key: 'burn',
        message: (
          <StyledCollapse ghost>
            <Panel header={intl.get('account.burning')} key="1" showArrow={false}>
              {burnQueue.map(burn => {
                return (
                  <Space key={burn.burnForId} size={60}>
                    <StyledNotificationContent>
                      {intl.get('account.burningList', {
                        burnForType: getType(burn.burnForType),
                        burnValue: burn.burnValue
                      })}
                    </StyledNotificationContent>
                    <Spin indicator={antIcon} />
                  </Space>
                );
              })}
            </Panel>
          </StyledCollapse>
        ),
        duration: null,
        icon: <FireTwoTone twoToneColor="#ff0000" />
      });
      break;
    case 'success':
      notification.open({
        type: toastType,
        key: 'burn',
        message: intl.get('burn.doneBurning'),
        duration: 2
      });
      break;
    case 'error':
      notification.open({
        type: toastType,
        key: 'burnFail',
        message: intl.get('account.insufficientBurningFunds'),
        duration: 2
      });
      break;
  }
};
