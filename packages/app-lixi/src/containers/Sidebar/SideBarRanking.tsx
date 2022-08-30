import { Layout } from 'antd';
import { FieldNumberOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Sider } = Layout;
let HeightHeader;
if (typeof window !== 'undefined') {
  // Client-side-only code
  HeightHeader = (window.document.querySelector('.ant-layout-header')?.clientHeight || 64) + 'px';
} else {
  HeightHeader = '64px';
}

const RankingSideBar = styled(Sider)`
  position: fixed !important;
  height: 100vh;
  right: 0;
  top: ${HeightHeader};
  max-width: inherit !important;
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 2rem 1rem;
  box-shadow: rgb(0 0 0 / 4%) 0px 1px 2px, rgb(0 0 0 / 8%) 0px 2px 6px 2px;
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    h3 {
      align-self: center;
    }
  }
  @media (max-width: 1000px) {
    display: none;
  }
  @media (min-width: 1001px) and (max-width: 1150px) {
    width: 200px !important;
  }
  @media (min-width: 1151px) and (max-width: 1300px) {
    width: 300px !important;
  }
  @media (min-width: 1301px) {
    width: 350px !important;
  }
`;

const SidebarRanking = () => {
  return (
    <RankingSideBar>
      <h3>Ranking</h3>
      <p>
        <FieldNumberOutlined />
        <span>1</span> Lotusia Shop
      </p>
      <p>
        <FieldNumberOutlined />
        <span>2</span> Grandma Lu
      </p>
      <p>
        <FieldNumberOutlined />
        <span>3</span> The Coffee House
      </p>
      <p>
        <FieldNumberOutlined />
        <span>4</span> King Coffee
      </p>
      <p>
        <FieldNumberOutlined />
        <span>5</span> Katinat
      </p>
    </RankingSideBar>
  );
};

export default SidebarRanking;
