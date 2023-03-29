import React from 'react';
import style from 'styled-components';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Space } from 'antd';

const StyledName = style.p`
  font-size: 15px;
  margin-bottom: 0px;
  font-weight: bold;
`;

const StyledDesc = style.p`
  display: flex;
  gap: 3px;
`;

const StyledBurnedAmount = style.p`
  margin-bottom: 0px;
  font-size: 14px;
  color: #201A1999;
  padding-top: 1px;
`;

const StyledItem = style.div`
  display: flex;
  margin-bottom: 5px;
  margin-top: 5px;
  gap: 8px;
`;

const StyledContainer = style.div`
display: flex;
flex-direction: column;
gap: 5px;
padding-top: 5px;
`;

const SidebarListItem = () => {
  return (
    <StyledItem>
      <AvatarUser name={'Lixi Lotus'} />
      <StyledContainer>
        <StyledName>Lixi Lotus</StyledName>
        <StyledDesc>
          <picture>
            <img alt="burn-icon" src="/images/burn-icon.svg" width={15} />
          </picture>
          <StyledBurnedAmount>999 XPI</StyledBurnedAmount>
        </StyledDesc>
      </StyledContainer>
    </StyledItem>
  );
};

export default SidebarListItem;
