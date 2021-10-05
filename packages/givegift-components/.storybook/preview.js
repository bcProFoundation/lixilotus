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
  })
}