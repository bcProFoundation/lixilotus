import React, { useState } from 'react';
import style from 'styled-components';
import { Space } from 'antd';
import { AvatarUser } from '@components/Common/AvatarUser';

const StyledCard = style.div`
   display: flex;
   width: 300px;
   height: 80px;
   background: #FDFCFC;
   border-radius: 15px;
   margin-top: 10px;
   margin-bottom: 10px;
   padding: 8px 16px;
`;

const WorshipedPersonCard = () => {
  return (
    <React.Fragment>
      <StyledCard>
        <Space>
          <AvatarUser name={'Lixi Lotus'} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ marginBottom: '5px' }}>Lixi Lotus</p>
            <p style={{ marginBottom: '0' }}>Ngày giỗ: 15/5</p>
          </div>
        </Space>
      </StyledCard>
    </React.Fragment>
  );
};

export default WorshipedPersonCard;
