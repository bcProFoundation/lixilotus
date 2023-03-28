import React from 'react';
import style from 'styled-components';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';

const StyledItem = style.div`
  display: flex;
  margin-bottom: 10px;
  margin-top: 5px;
  background: #FFFFFF;
  width: 100%;
  padding: 6px 32px 0px 32px;
  border-radius: 24px;
  justify-content: space-between;
`;

const StyledInfoContainer = style.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledName = style.span`
  margin-bottom: 0px;
  text-align: left;
  font-weight: bold;
`;

const StyledSubInfo = style.span`
  font-weight: normal;
  color: #4F4F4F;
  font-size: 11.5px;
`;

const WorshipCard = () => {
  return (
    <StyledItem>
      <Space>
        <AvatarUser name={'Lixi Lotus'} />
        <StyledInfoContainer>
          <StyledName>
            Lixi Lotus <StyledSubInfo> - 2 phút trước</StyledSubInfo>
          </StyledName>
          <p style={{ marginBottom: '0' }}>
            đã dâng một nến hương{' '}
            <StyledSubInfo>
              - <FireOutlined /> 100 XPI
            </StyledSubInfo>
          </p>
        </StyledInfoContainer>
      </Space>
      <picture>
        <img alt="incense-card" src="/images/incense-card.svg" />
      </picture>
    </StyledItem>
  );
};

export default WorshipCard;
