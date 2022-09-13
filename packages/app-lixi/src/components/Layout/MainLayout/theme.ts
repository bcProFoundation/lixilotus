import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  name: 'Default',
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  brandSecondary: 'var(--color-secondary)',
  grey: '#adaeae',
  greyLight: '#d5d5d5',
  greyDark: '#757575',
  contrast: '#fff',
  app: {
    sidebars: `url("/cashtab_bg.png")`,
    background: '#fbfbfd',
    gradient: 'linear-gradient(-225deg, #231557 0%, #44107A 29%, #FF1361 67%, #d38cad 100%)'
  },
  wallet: {
    background: '#fff',
    text: {
      primary: 'var(--color-primary)',
      secondary: '#6212f5'
    },
    switch: {
      activeCash: {
        shadow: 'inset 8px 8px 16px #44107A, inset -8px -8px 16px #6f2dbd'
      },
      activeToken: {
        background: 'var(--color-secondary)',
        shadow: 'inset 5px 5px 11px #FF21D0, inset -5px -5px 11px #CD0BC3'
      },
      inactive: {
        background: 'linear-gradient(145deg, #eeeeee, #c8c8c8)'
      }
    },
    borders: { color: '#e2e2e2' },
    shadow: 'rgba(0, 0, 0, 1)'
  },
  tokenListItem: {
    background: '#ffffff',
    color: '',
    boxShadow:
      'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px,rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
    border: '#ccc',
    hoverBorder: '#231F20'
  },
  listItem: {
    background: '#ffffff',
    color: '',
    boxShadow:
      'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px,rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px',
    border: '#ccc',
    hoverBorder: '#231F20'
  },
  forms: {
    error: '#FF21D0',
    border: '#e7edf3',
    text: 'var(--color-primary)',
    addonBackground: '#f4f4f4',
    addonForeground: 'var(--color-primary)',
    selectionBackground: '#fff'
  },
  footer: {
    background: '#fff',
    navIconInactive: '#949494',
    color: 'var(--text-color-1)'
  },
  icons: {
    outlined: 'var(--color-primary)',
    outlinedFaded: '#bb98ff',
    filled: 'var(--color-primary)',
    filledFaded: '#bb98ff'
  },
  modals: {
    buttons: { background: '#fff' }
  },
  settings: { delete: 'var(--color-secondary)' },
  qr: {
    copyBorderCash: '#00ABE7',
    copyBorderToken: '#FF21D0',
    background: '#fff',
    token: '#231F20',
    shadow:
      'rgba(0, 0, 0, 0.01) 0px 0px 1px, rgba(0, 0, 0, 0.04) 0px 4px 8px, rgba(0, 0, 0, 0.04) 0px 16px 24px, rgba(0, 0, 0, 0.01) 0px 24px 32px'
  },
  buttons: {
    primary: {
      backgroundImage: 'linear-gradient(270deg,#6f2dbd 0%, #CD0BC3 100%)',
      color: '#fff',
      hoverShadow: '0px 3px 10px -5px rgba(0, 0, 0, 0.75)'
    },
    secondary: {
      background: '#e9eaed',
      color: '#444',
      hoverShadow: '0px 3px 10px -5px rgba(0, 0, 0, 0.75)'
    }
  },
  collapses: {
    background: '#fbfcfd',
    border: '#eaedf3',
    color: '#3e3f42'
  },
  radio: {
    primary: 'var(--color-primary)',
    secondary: '#e8e8e8',
    borderRadius: '6px'
  },
  footerBackground: '#fff',
  tab: {
    background: '#ffffff'
  }
};

type ThemeType = typeof theme;

export type { ThemeType };
