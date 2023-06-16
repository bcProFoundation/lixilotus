import { useEffect, useState } from 'react';
import { Avatar } from 'antd';
import styled from 'styled-components';

const StyledAvatar = styled(Avatar)`
  width: 46px;
  height: 46px;
  font-size: 18px;
  display: flex;
  align-items: center;
`;

type AvatarUserProps = {
  name?: string;
  isMarginRight?: boolean;
  icon?: string;
};

export const AvatarUser = (props: AvatarUserProps) => {
  const { name, isMarginRight, icon } = props;

  const transformShortName = (name: string) => {
    let shortName = '';
    let nameArr = name.split(' ');
    if (nameArr.length > 1) {
      nameArr = [nameArr[0], nameArr[nameArr.length - 1]];
    }
    shortName = nameArr.reduce((rs, name) => {
      return (rs += name.charAt(0).toUpperCase());
    }, '');
    return shortName;
  };

  return (
    <>
      {name && (
        <StyledAvatar src={icon} style={{ marginRight: `${isMarginRight ? '10px' : '0'}` }}>
          {transformShortName(name)}
        </StyledAvatar>
      )}
      {!name && <img width={50} height={50} src="/images/anonymous-ava.svg" alt="" />}
    </>
  );
};
