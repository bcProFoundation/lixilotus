import React from 'react';
import styled from 'styled-components';

const SplashScreenContainer = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  @media (prefers-color-scheme: light) {
    background: #fff;
  }
  @media (prefers-color-scheme: dark) {
    background: var(--bg-color-dark-item);
  }
`;

const SplashScreen = () => {
  return (
    <SplashScreenContainer>
      <img width={'60px'} src="/images/lixilotus-logo.svg" alt="" />
    </SplashScreenContainer>
  );
};

export default SplashScreen;
