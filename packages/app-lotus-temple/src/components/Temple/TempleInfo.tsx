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
   padding: 20px 32px;
   border-radius: 24px;
   flex-direction: column
`;

const StyledInfoContainer = style.div`
   display: flex;
   flex-direction: column;
`;

const StyledSubHeader = style.span`
   margin-bottom: 0px;
   text-align: left;
   font-weight: bold;
   font-size: 16px;
`;

const StyledHeader = style.p`
   font-weight: bold;
   font-size: 24px;
   text-align: left;
   margin-bottom: 18px;
`;

const StyledText = style.p`
margin-bottom: 0px;
   text-align: left;
   color: #4F4F4F;
`;

const StyledSpace = style(Space)`
margin-bottom: 20px;
`;

const StyledIcon = style.img`
   min-width: 40px
`;

const TempleInfo = () => {
  return (
    <StyledItem>
      <StyledHeader>Thông tin</StyledHeader>
      {/* Achievement / Thành tựu */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="achievement" src="/images/achievement.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>Thành tựu</StyledSubHeader>
          <StyledText>Lorem ipsum dolor sit amet, consectetur adipiscing elit</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Also know as / Tên khác */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="aka" src="/images/aka.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>Tên khác</StyledSubHeader>
          <StyledText>Lorem ipsum</StyledText>
          <StyledText>Dolor sit amet</StyledText>
          <StyledText>Duis aute irure</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Country of citizenship / Nguyên quán */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="aka" src="/images/aka.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>Nguyên quán</StyledSubHeader>
          <StyledText>Reprehenderit</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Religion / Tôn giáo */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="religion" src="/images/religion.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>Tôn giáo</StyledSubHeader>
          <StyledText>Occaecat</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
    </StyledItem>
  );
};

export default TempleInfo;
