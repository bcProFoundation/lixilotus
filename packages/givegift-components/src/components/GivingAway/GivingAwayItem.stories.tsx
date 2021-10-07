
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from '../../styles/GlobalStyle';
import { theme } from '../../styles/theme';

import GivingAwayItem from './GivingAwayItem';

GivingAwayItem.defaultProps = {
  theme: theme
};

storiesOf('GivingAway Item', module)
  .addDecorator(story => (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {story()}
    </ThemeProvider>
  ))
  .add(
    'Default Item',
    () => {
      const description = 'Lucky money for abcpros team';
      const givingDate = new Date();
      const givingAmount = '10002';
      const ticker = 'XPI';
      const giftNumber = 5;

      return (
        <GivingAwayItem
          description={description}
          givingDate={givingDate}
          givingAmount={givingAmount}
          ticker={ticker}
          giftNumber={giftNumber}
        />
      );
    },
    {
      notes: 'Displaying a Giving Away Item',
    },
  );
