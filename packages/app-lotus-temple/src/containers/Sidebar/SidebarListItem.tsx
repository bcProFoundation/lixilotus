import React from 'react';
import style from 'styled-components';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Space } from 'antd';

const StyledItem = style.div`
   display: flex;
   margin-bottom: 5px;
   margin-top: 5px;
`;

const SidebarListItem = () => {
  return (
    <StyledItem>
      <Space>
        <AvatarUser name={'Lixi Lotus'} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <p style={{ marginBottom: '0' }}>Lixi Lotus</p>
          <p style={{ marginBottom: '0' }}>
            <picture>
              <img alt="burn-icon" src="/images/burn-icon.svg" width={20} />
            </picture>
            9999 XPI
          </p>
        </div>
      </Space>
    </StyledItem>
  );
};

export default SidebarListItem;
