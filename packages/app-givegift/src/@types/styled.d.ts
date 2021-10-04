// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    primary: string;
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
    footer: {
      background: string;
      navIconInactive: string;
    };
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
}