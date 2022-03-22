import { MenuOutlined } from "@ant-design/icons"
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { toggleCollapsedSideNav } from "@store/settings/actions";
import { getNavCollapsed } from "@store/settings/selectors";
import { Header } from "antd/lib/layout/layout";
import styled from 'styled-components';

export type TopbarProps = {
  className?: string,
}

const Topbar = ({
  className
}: TopbarProps) => {


  const dispatch = useAppDispatch();
  const navCollapsed = useAppSelector(getNavCollapsed);

  const handleMenuClick = (e) => {
    dispatch(toggleCollapsedSideNav(!navCollapsed));
  }

  return (
    <Header className={className}>
      {/* <MenuOutlined style={{fontSize: '32px'}} onClick={handleMenuClick} /> */}
      <img src='/images/lixilotus-logo.png' alt='lixilotus' />
      <img src='/images/lotus-logo-small.png' alt='lotus' />
    </Header>
  )
}

const StyledTopbar = styled(Topbar)`
  display: flex;
  align-items: center;
  justify-content: space-between !important;
  width: 100%;
  padding: 10px 0 15px;
  margin-bottom: 20px;
  justify-content: space-between;
  border-bottom: 1px solid ${props => props.theme.wallet.borders.color};

  a {
    color: ${props => props.theme.wallet.text.secondary};

    :hover {
      color: ${props => props.theme.primary};
    }
  }

  @media (max-width: 768px) {
    a {
      font-size: 12px;
    }
    padding: 20px 0 20px;
  }
`;

export default StyledTopbar;
