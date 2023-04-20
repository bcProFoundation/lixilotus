import React, { useEffect, useState } from 'react';
import style from 'styled-components';
import { AvatarUser } from '@components/Common/AvatarUser';
import { Space } from 'antd';
import { WorshipedPersonQuery } from '@store/worship/worshipedPerson.generated';
import { FireOutlined } from '@ant-design/icons';
import { PersonType } from './PersonDetail';
import intl from 'react-intl-universal';
import moment from 'moment';

type PersonInfoProp = {
  person: PersonType;
};

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

const PersonInfo = ({ person }: PersonInfoProp) => {
  const personAlias = person.alias && person.alias.split(',');

  const getFallBackText = () => {
    return <span style={{ fontStyle: 'italic', textAlign: 'left' }}>{intl.get('worship.noInfo')}</span>;
  };

  return (
    <StyledItem>
      <StyledHeader>Thông tin</StyledHeader>
      {/* Achievement / Thành tựu */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="achievement" src="/images/achievement.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>{intl.get('worship.achievement')}</StyledSubHeader>
          <StyledText>{person.achievement || getFallBackText()}</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Also know as / Tên khác */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="aka" src="/images/aka.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>{intl.get('worship.alias')}</StyledSubHeader>
          {personAlias && personAlias.length > 0
            ? personAlias.map((alias, index) => {
                return <StyledText key={index}>{alias}</StyledText>;
              })
            : getFallBackText()}
        </StyledInfoContainer>
      </StyledSpace>
      {/* Country of citizenship / Nguyên quán */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="aka" src="/images/aka.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>{intl.get('worship.countryOfCitizenship')}</StyledSubHeader>
          <StyledText>{person.countryOfCitizenship || getFallBackText()}</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Religion / Tôn giáo */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="religion" src="/images/religion.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>{intl.get('worship.religion')}</StyledSubHeader>
          <StyledText>{person.religion || getFallBackText()}</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Date of birth / Ngày sinh */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="birth" src="/images/birth.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>{intl.get('worship.dateOfBirth')}</StyledSubHeader>
          <StyledText>
            {moment(person.dateOfBirth).locale('vi-vn').format('Do MMMM YYYY') || getFallBackText()}
          </StyledText>
          {/* Place of birth / Nơi sinh */}
          <StyledSubHeader>{intl.get('worship.placeOfBirth')}</StyledSubHeader>
          <StyledText>{person.placeOfBirth || getFallBackText()}</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
      {/* Date of death / Ngày an nghỉ */}
      <StyledSpace>
        <picture>
          <StyledIcon alt="tomb" src="/images/tomb.svg" />
        </picture>
        <StyledInfoContainer>
          <StyledSubHeader>{intl.get('worship.dateOfDeath')}</StyledSubHeader>
          <StyledText>
            {moment(person.dateOfDeath).locale('vi-vn').format('Do MMMM YYYY') || getFallBackText()}
          </StyledText>
          {/* Place of burial / Nơi an nghỉ */}
          <StyledSubHeader>{intl.get('worship.placeOfBurial')}</StyledSubHeader>
          <StyledText>{person.placeOfBurial}</StyledText>
        </StyledInfoContainer>
      </StyledSpace>
    </StyledItem>
  );
};

export default PersonInfo;
