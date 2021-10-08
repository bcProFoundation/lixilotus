/* eslint-disable import/no-extraneous-dependencies */
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const ForkTSCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path = require("path");
const { getLoader, loaderByName } = require("@craco/craco");

const packages = [];
packages.push(path.resolve(__dirname, "../givegift-components/src"));

module.exports = {
  eslint: { enable: false },
  webpack: {
    configure: (config) => {
      // Remove ModuleScopePlugin which throws when we try to import something
      // outside of src/.
      config.resolve.plugins.pop();

      // Resolve the path aliases.
      config.resolve.plugins.push(new TsconfigPathsPlugin());

      // Let Babel compile outside of src/.
      const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
      const tsRule = oneOfRule.oneOf.find((rule) =>
        rule.test.toString().includes("ts|tsx")
      );

      tsRule.include = undefined;
      tsRule.exclude = /node_modules/;

      // const { isFound, match } = getLoader(
      //   webpackConfig,
      //   loaderByName("babel-loader")
      // );
      // if (isFound) {
      //   const include = Array.isArray(match.loader.include)
      //     ? match.loader.include
      //     : [match.loader.include];

      //   match.loader.include = include.concat(packages);
      // }

      return config;
    },
    plugins: {
      remove: [
        // This plugin is too old and causes problems in monorepos. We'll
        // replace it with a newer version.
        "ForkTsCheckerWebpackPlugin",
      ],
      add: [
        // Use newer version of ForkTSCheckerWebpackPlugin to type check
        // files across the monorepo.
        new ForkTSCheckerWebpackPlugin({
          issue: {
            // The exclude rules are copied from CRA.
            exclude: [
              {
                file: "**/src/**/__tests__/**",
              },
              {
                file: "**/src/**/?(*.)(spec|test).*",
              },
              {
                file: "**/src/setupProxy.*",
              },
              {
                file: "**/src/setupTests.*",
              },
            ],
          }
        })
      ]
    },
    // alias: {
    //   '@assets': path.resolve(__dirname, 'src/assets/'),
    //   '@images': path.resolve(__dirname, 'src/assets/images/'),
    //   '@icons': path.resolve(__dirname, 'src/assets/icons/'),
    //   '@utils': path.resolve(__dirname, 'src/utils/'),
    //   '@components': path.resolve(__dirname, 'src/components/'),
    //   '@hooks': path.resolve(__dirname, 'src/hooks/'),
    //   '@abcpros/givegift-components': path.resolve(__dirname, '../givegift-components/src')
    // }
  },
  babel: {
    plugins: [
      ["babel-plugin-styled-components", { "displayName": true }]
    ]
  }
};