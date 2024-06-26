import styled from 'styled-components';

const WalletName = styled.h4`
  font-size: 20px;
  font-weight: bold;
  display: inline-block;
  color: ${props => props.theme.primary};
  margin-bottom: 0px;
  @media (max-width: 400px) {
    font-size: 14px;
  }
`;

type WalletLabelProps = {
  name: string;
};

const WalletLabel = ({ name }: WalletLabelProps) => {
  return <>{name && typeof name === 'string' && <WalletName>{name}</WalletName>}</>;
};

export default WalletLabel;
