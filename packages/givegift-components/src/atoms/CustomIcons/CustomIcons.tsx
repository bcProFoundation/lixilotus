import styled from 'styled-components';
import {
  CopyOutlined,
  DollarOutlined,
  LoadingOutlined,
  WalletOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { Image } from 'antd';

type ReceivedNotificationIconProps = {
  currencyLogo: string
}

export const LoadingIcon = <LoadingOutlined className="loadingIcon" />;

export const ReceivedNotificationIcon: React.FC<ReceivedNotificationIconProps> = ({ currencyLogo }) => (
  <Image height={'33px'} width={'30px'} src={currencyLogo} preview={false} />
);

export const ThemedCopyOutlined = styled(CopyOutlined)`
  color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedDollarOutlined = styled(DollarOutlined)`
  color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedWalletOutlined = styled(WalletOutlined)`
  color: ${props => props.theme.icons.outlined} !important;
`;
export const ThemedQrcodeOutlined = styled(QrcodeOutlined)`
  color: ${props => props.theme.icons.outlined} !important;
`;

export const LoadingBlock = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  flex-direction: column;
  svg {
    width: 50px;
    height: 50px;
    fill: ${props => props.theme.primary};
  }
`;

export const CashLoader = () => (
  <LoadingBlock>
    <LoadingOutlined />
  </LoadingBlock>
);
