module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app",
    "storybook-addon-styled-components-themes/register"
  ],
  babel: async (options) => ({
    ...options,
    plugins: [
      "babel-plugin-styled-components"
    ]
  }),
}