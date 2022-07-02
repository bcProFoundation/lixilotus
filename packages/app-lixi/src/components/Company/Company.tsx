import { Avatar, Card, Tabs } from 'antd';
import React from 'react';
import styled from 'styled-components';
import WalletLabel from '@bcpros/lixi-components/components/Common/WalletLabel';
import Meta from 'antd/lib/card/Meta';
import { SettingOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';

const Company: React.FC = () => {
  return (
    <>
      <WalletLabel name="Companies" />
      <Card
        type="inner"
        actions={[<SettingOutlined key="setting" />, <LikeOutlined key="upvote" />, <DislikeOutlined key="downvote" />]}
      >
        <Meta
          avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
          title="Card title"
          description="This is the description"
        />
      </Card>
      <Card style={{ marginTop: 16 }} type="inner">
        <Meta
          avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
          title="Card title"
          description="This is the description"
        />
      </Card>
    </>
  );
};

export default Company;
