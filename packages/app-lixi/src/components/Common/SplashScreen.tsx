import React from 'react';
import styled from 'styled-components';

const SplashScreenContainer = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const SplashScreen = () => {
  return (
    <SplashScreenContainer>
      <img width="200px" src="/images/lixilotus-logo.svg" alt="" />
    </SplashScreenContainer>
  );
};

export default SplashScreen;
