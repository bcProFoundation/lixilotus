
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../../styles/GlobalStyle';
import { theme } from '../../styles/theme';

import BalanceBanner from './BalanceBanner';

BalanceBanner.defaultProps = {
  theme: theme
};

storiesOf('BalanceBanner', module)
  .addDecorator(story => (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {story()}
    </ThemeProvider>
  ))
  .add(
    'default',
    () => {
      const title = 'My Giving';

      return (
        <BalanceBanner
          title={title}
        />
      );
    },
    {
      notes: 'Displaying a BalanceBanner',
    },
  );
