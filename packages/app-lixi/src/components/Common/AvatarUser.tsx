import { useEffect, useState } from 'react';
import { Avatar } from 'antd';
import styled from 'styled-components';

const StyledAvatar = styled(Avatar)`
  width: 46px;
  height: 46px;
  font-size: 18px;
  display: flex !important;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  .ant-avatar-string {
    position: absolute;
    left: 50%;
    transform-origin: 0 center;
  }
  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  .avatar-anonymous {
    width: 46px !important;
    height: 46px !important;
  }
`;

type AvatarUserProps = {
  name?: string;
  isMarginRight?: boolean;
  icon?: string;
};

export const transformShortName = (name: string) => {
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

export const AvatarUser = (props: AvatarUserProps) => {
  const { name, isMarginRight, icon } = props;

  return (
    <>
      {name && (
        <StyledAvatar src={icon} style={{ marginRight: `${isMarginRight ? '10px' : '0'}` }}>
          {transformShortName(name)}
        </StyledAvatar>
      )}
      {!name && <img className="avatar-anonymous" src="/images/anonymous-ava.svg" alt="" />}
    </>
  );
};
