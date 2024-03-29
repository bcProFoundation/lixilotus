import React from 'react';
import { Button } from 'antd';
import styled, { DefaultTheme, ThemeProvider } from 'styled-components';
import intl from 'react-intl-universal';
import EmptyLayout from '@components/Layout/EmptyLayout';

const FourOhFourComponent = () => {
  const FourOhFour = styled.div`
    background: var(--bg-color-light-theme);
    .container {
      font-family: sans-serif;
      height: 100vh;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      img {
        margin-bottom: 5px;
      }
      h1 {
        font-weight: bold;
        font-size: 2.5em;
        margin-top: 1em;
        margin-bottom: 0px;
      }
      img {
        width: 100%;
        max-width: 1067px;
      }
      .button {
        margin-top: 0.5em;
        min-width: 150px;
      }
    }
  `;
  return (
    <FourOhFour>
      <div className="container">
        <img src="/images/404.png" alt="404" />
        <h1>{intl.get('general.notFoundTitle')}</h1>
        <h3>{intl.get('general.notFoundDescription')}</h3>
        <Button className="button" type="primary" onClick={() => window.open('/', '_self')}>
          {intl.get('general.goBackToHome')}
        </Button>
      </div>
    </FourOhFour>
  );
};

const FourOhFourPage = () => {
  return <FourOhFourComponent />;
};

FourOhFourPage.Layout = ({ children }) => <EmptyLayout children={children} />;

export default FourOhFourPage;
