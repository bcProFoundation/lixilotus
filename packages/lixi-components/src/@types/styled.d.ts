// import original module declarations
import 'styled-components';
import { CSSProp } from 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    primary: string;
    secondary: string;
    brandSecondary: string;
    contrast: string;
    app: {
      sidebars: string;
      background: string;
    };
    wallet: {
      background: string;
      text: {
        primary: string;
        secondary: string;
      };
      switch: {
        activeCash: {
          shadow: string;
        };
        activeToken: {
          background: string;
          shadow: string;
        };
        inactive: {
          background: string;
        };
      };
      borders: {
        color: string;
      };
      shadow: string;
    };
    listItem: {
      background: string;
      color: string;
      boxShadow: string;
      border: string;
      hoverBorder: string;
    };
    footer: {
      background: string;
      navIconInactive: string;
    };
    forms: {
      error: string;
      border: string;
      text: string;
      addonBackground: string;
      addonForeground: string;
      selectionBackground: string;
    },
    icons: {
      outlined: string;
    };
    modals: {
      buttons: {
        background: string;
      }
    };
    settings: {
      delete: string;
    };
    qr: {
      copyBorderCash: string;
      copyBorderToken: string;
      background: string;
      token: string;
      shadow: string;
    };
    buttons: {
      primary: {
        backgroundImage: string;
        color: string;
        hoverShadow: string;
      };
      secondary: {
        background: string;
        color: string;
        hoverShadow: string;
      };
    };
    collapses: {
      background: string;
      border: string;
      color: string;
    };
  }
};

declare module 'react' {
  interface Attributes {
    css?: CSSProp | CSSObject;
  }
}