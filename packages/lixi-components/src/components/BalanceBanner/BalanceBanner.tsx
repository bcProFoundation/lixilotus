import React from 'react';
import styled, { DefaultTheme } from 'styled-components';
import BalanceBannerBackgroundImage from '../../assets/images/balance_banner_bg.png';

const BalanceBannerTitle = styled.span`
  display: block;
  margin-bottom: 2px;
`;

const BalanceBannerSubTitle = styled.p`
  display: block;
  margin-bottom: 2px;
  margin-top: 0;
`;

const BalanceBannerAmount = styled.h3`
  text-align: left;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 2px;
  margin-top: 0;
  color: white;
`;

const BalanceBannerText = styled.div`
  text-align: left;
  font-size: 12px;
  color: #cbcdd8;
`;

const BalanceBannerAction = styled.button`
  color: ${props => props.theme.buttons.primary.color};
  background-image: ${props => props.theme.buttons.primary.backgroundImage};
  font-size: 16px;
  padding: 10px 10px 10px 10px;
  border-radius: 4px;
  min-width: 108px;
  display: flex;
  justify-content: center;
  align-content: center;
`;

const BalanceBannerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-radius: 10px;
  background-image: url(${BalanceBannerBackgroundImage});
  background-color: ${props => props.theme.primary};
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: 50% 70%;
  border: 1px solid ${props => props.theme.listItem.border};
`;

// type BalanceBannerProps = {
//   title: string;
//   theme?: DefaultTheme;
// }

const BalanceBanner = (
  {
    title
  }) => {
  return (
    <>
      <BalanceBannerWrapper>
        <BalanceBannerText>
          <BalanceBannerTitle>{title}</BalanceBannerTitle>
          <BalanceBannerAmount>50.000 XPI</BalanceBannerAmount>
          <BalanceBannerSubTitle>Give 25 times</BalanceBannerSubTitle>
        </BalanceBannerText>
        <BalanceBannerAction>Give Now</BalanceBannerAction>
      </BalanceBannerWrapper>
    </>
  );
}

export default BalanceBanner;