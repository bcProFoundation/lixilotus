import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OpenBrowserHint from '@assets/images/open_browser.jpg';
import Arrow from '@assets/images/arrow.png';
import IosOpenBrowserHint from '@assets/images/open_browser_IOS.png';
import BottomArrow from '@assets/images/bottom_arrow.png';
import InApp from '@utils/inapp';

export const Overlay = styled.div`
  position: fixed; /* Sit on top of the page content */
  display: block; /* Hidden by default */
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 10; /* Specify a stack order in case you're using a different order for other elements */
`;

export const H2Center = styled.h2`
  width: 100%;
  text-align: center;
  color: white;
`;

export const H2CenterBottom = styled.h2`
  width: 100%;
  margin-top: 60%;
  text-align: center;
  color: white;
`;

export const FullWidthImg = styled.img`
  width: 80%;
  margin: auto;
  margin-top: 15%;
  display: block;
`;

export const Bottom = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column-reverse;
  height: 100%;
`;

export const FullWidthBottomImg = styled.img`
  width: 80%;
  margin: auto;
  margin-bottom: 15%;
  display: block;
`;

export const TopImg = styled.img`
  width: 10%;
  display: block;
  position: absolute;
  height: auto;
  right: 0px;
  top: 0px;
  margin-right: 3%;
  margin-top: 10px;
`;

export const BottomImg = styled.img`
  width: 10%;
  display: block;
  position: absolute;
  height: auto;
  right: 0px;
  bottom: 0px;
  margin-right: 3%;
  margin-bottom: 10px;
`;

const CheckBrowser = () => {
  const [inapp, setInapp] = useState(null);
  const [loadedArrow, setLoadedArrow] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const inapp = new InApp(navigator.userAgent || navigator.vendor);
    setInapp(inapp);
  }, []);

  return (
    <>
      {inapp?.isInApp && (
        <Overlay style={loaded && loadedArrow ? {} : { display: 'none' }}>
          {inapp?.isIOS ? (
            <Bottom>
              <FullWidthBottomImg src={IosOpenBrowserHint} onLoad={() => setLoaded(true)} />
              <H2CenterBottom>Open browser to continue...</H2CenterBottom>
              <BottomImg src={BottomArrow} onLoad={() => setLoadedArrow(true)} />
            </Bottom>
          ) : (
            <>
              <TopImg src={Arrow} onLoad={() => setLoadedArrow(true)} />
              <FullWidthImg src={OpenBrowserHint} onLoad={() => setLoaded(true)} />
              <H2Center>Open browser to continue...</H2Center>
            </>
          )}
        </Overlay>
      )}
    </>
  );
};

export default CheckBrowser;
