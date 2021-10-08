
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../../styles/GlobalStyle';
import { theme } from '../../styles/theme';

import GivingItem from './GivingItem';

GivingItem.defaultProps = {
  theme: theme
};

storiesOf('GivingItem', module)
  .addDecorator(story => (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {story()}
    </ThemeProvider>
  ))
  .add(
    'default',
    () => {
      const description = 'Lucky money for abcpros team';
      const givingDate = new Date();
      const givingAmount = '10002';
      const ticker = 'XPI';
      const giftNumber = 5;

      return (
        <GivingItem
          description={description}
          givingDate={givingDate}
          givingAmount={givingAmount}
          ticker={ticker}
          giftNumber={giftNumber}
        />
      );
    },
    {
      notes: 'Displaying a Giving Item',
    },
  );
