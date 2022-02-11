import { GlobalStyle } from '../src/styles/GlobalStyle';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  babel: async (options) => ({
    ...options,
    plugins: [
      "babel-plugin-styled-components"
    ]
  }),
  // styledComponentsThemes: {
  //   /**
  //    * Themes
  //    */
  //   themes: [theme, theme],
  //   /**
  //    *  Key for show name of theme - optional
  //    */
  //   label: 'name', // optional
  // },
}

export const decorator = [
  (Story) => (
    <>
      <GlobalStyle />
      <Story />
    </>
  ),
];