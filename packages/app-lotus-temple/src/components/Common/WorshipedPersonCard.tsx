import React, { useState } from 'react';
import style from 'styled-components';
import { Space } from 'antd';
import { AvatarUser } from '@components/Common/AvatarUser';
import { PersonType } from '@components/WorshipedPerson/PersonDetail';
import moment from 'moment';
import { useRouter } from 'next/router';

type WorshipedPersonCardProp = {
  person: PersonType;
  isSpecialDate?: boolean;
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

const WorshipedPersonCard = ({ person, isSpecialDate }: WorshipedPersonCardProp) => {
  const history = useRouter();
  return (
    <React.Fragment>
      <StyledCard onClick={() => history.push(`/person/${person.id}`)}>
        <Space>
          <AvatarUser name={person.name} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ marginBottom: '5px', textAlign: 'left', fontWeight: 'bold' }}>{person.name}</p>
            <p style={{ marginBottom: '0', textAlign: 'left' }}>
              {isSpecialDate
                ? `Ngày giỗ: ${person.dateOfDeath ? moment(person.dateOfDeath).format('DD/MM/YYYY') : ''}`
                : `${person.achievement ? capitalizeFirstLetter(person.achievement) : ''}`}
            </p>
          </div>
        </Space>
      </StyledCard>
    </React.Fragment>
  );
};

export default WorshipedPersonCard;
