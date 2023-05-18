import React, { useState } from 'react';
import style from 'styled-components';
import { Space, Typography } from 'antd';
import { AvatarUser } from '@components/Common/AvatarUser';
import moment from 'moment';
import { useRouter } from 'next/router';
import { TempleType } from '@components/Temple/TempleDetail';

const { Paragraph, Text } = Typography;

type WorshipedTempleCard = {
  temple: TempleType;
};

const StyledCard = style.div`
  display: flex;
  min-width: 300px;
  max-width: 640px;
  height: 80px;
  background: #FDFCFC;
  border-radius: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 8px 16px;
  cursor: pointer;

  transition: all 0.2s ease-in-out;

  &:hover {
    height: 95px;
  }
`;

const capitalizeFirstLetter = string => {
  return string[0].toUpperCase() + string.slice(1);
};

const WorshipedTempleCard = ({ temple }: WorshipedTempleCard) => {
  const history = useRouter();
  return (
    <React.Fragment>
      <StyledCard onClick={() => history.push(`/temple/${temple.id}`)}>
        <Space>
          <AvatarUser name={temple.name} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ marginBottom: '5px', textAlign: 'left', fontWeight: 'bold' }}>{temple.name}</p>
            <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginBottom: '0', textAlign: 'left' }}>
              {temple.description ? capitalizeFirstLetter(temple.description) : ''}
            </Paragraph>
          </div>
        </Space>
      </StyledCard>
    </React.Fragment>
  );
};

export default WorshipedTempleCard;
