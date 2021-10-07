import React from 'react';

import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../../styles/GlobalStyle';
import { theme } from '../../styles/theme';
import ApiError from './ApiError';

storiesOf('ApiError', module)
  .addDecorator(story => (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {story()}
    </ThemeProvider>
  ))
  .add('default',
    () => {
      return (
        <ApiError></ApiError>
      )
    })