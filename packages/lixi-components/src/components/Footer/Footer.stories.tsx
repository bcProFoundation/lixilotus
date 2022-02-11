
import { HomeOutlined, GiftOutlined, WalletOutlined, UserOutlined } from '@ant-design/icons';
import { storiesOf } from '@storybook/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../styles/theme';
import { NavButton } from '../NavButton/NavButton';
import Footer from './Footer';

storiesOf('Footer', module)
  .addDecorator(story => (
    <ThemeProvider theme={theme}>
      {story()}
    </ThemeProvider>
  ))
  .add(
    'Footer',
    () => {
      return (
        <Footer>
          <NavButton active={true}>
            <HomeOutlined />
            Home
          </NavButton>
          <NavButton>
            <GiftOutlined />
            My Giving
          </NavButton>
          <NavButton>
            <WalletOutlined />
            My Receive
          </NavButton>
          <NavButton active={false}>
            <UserOutlined />
            Profile
          </NavButton>
        </Footer>
      );
    },
    {
      notes: 'Displaying a Home NavButton',
    },
  );
