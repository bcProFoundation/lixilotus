import { HomeOutlined, GiftOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../styles/theme';
import { NavButton } from './NavButton';

storiesOf('NavButton', module)
  .addDecorator(story => <ThemeProvider theme={theme}>{story()}</ThemeProvider>)
  .add(
    'Home NavButton',
    () => {
      return (
        <NavButton active={true}>
          <HomeOutlined />
          Home
        </NavButton>
      );
    },
    {
      notes: 'Displaying a Home NavButton'
    }
  )
  .add(
    'My Giving NavButton',
    () => {
      return (
        <NavButton active={true}>
          <GiftOutlined />
          My Giving
        </NavButton>
      );
    },
    {
      notes: 'Displaying a Home NavButton'
    }
  )
  .add(
    'My Receive',
    () => {
      return (
        <NavButton active={true}>
          <WalletOutlined />
          My Receive
        </NavButton>
      );
    },
    {
      notes: 'Displaying a MyReceive NavButton'
    }
  )
  .add(
    'Profile NavButton',
    () => {
      return (
        <NavButton active={false}>
          <UserOutlined />
          Profile
        </NavButton>
      );
    },
    {
      notes: 'Displaying a Home NavButton'
    }
  );
