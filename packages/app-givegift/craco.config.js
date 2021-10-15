/* eslint-disable import/no-extraneous-dependencies */
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const ForkTSCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path = require("path");
const CracoLessPlugin = require("craco-less");
const { getLoader, loaderByName } = require("@craco/craco");

const packages = [];
packages.push(path.resolve(__dirname, "../givegift-components/src"));

module.exports = {
  eslint: { enable: false },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@layout-sider-background': '#131720',
              '@layout-trigger-background': '#20242D',
              '@light': '#7F7F7F',
              '@dark': '#000',
              '@heading-color': 'fade(@light, 85)',
              '@text-color': 'fade(@light, 65)',
              '@text-color-secondary': 'fade(@light, 45)',
              '@disabled-color': 'fade(@light, 25)',
              '@primary-5': '#40a9ff',
              '@primary-color': '#20242D',
              '@outline-color': '@primary-color',
              '@icon-color': 'fade(@light, 65)',
              '@icon-color-hover': 'fade(@light, 85)',
              '@primary-6': '#096dd9',
              '@border-color-base': '@border-color-split',
              '@btn-default-color': '@heading-color',
              '@btn-default-bg': '#444457',
              '@btn-default-border': '#444457',
              '@btn-ghost-color': 'fade(@light, 45)',
              '@btn-ghost-border': 'fade(@light, 45)',
              '@input-color': '@text-color',
              '@input-bg': '#3b3b4d',
              '@input-disabled-bg': '#4c4c61',
              '@input-placeholder-color': '@text-color-secondary',
              '@input-hover-border-color': 'fade(@light, 10)',
              '@checkbox-check-color': '#3b3b4d',
              '@checkbox-color': '@primary-color',
              '@select-border-color': '#3b3b4d',
              '@item-active-bg': '#272733',
              '@border-color-split': '#17171f',
              '@menu-dark-bg': '#131720',
              '@body-background': '#FBFBFD',
              '@component-background': '#FFFFFF',
              '@layout-body-background': '#FBFBFD',
              '@tooltip-bg': '#191922',
              '@tooltip-arrow-color': '#191922',
              '@popover-bg': '#2d2d3b',
              '@success-color': '#00a854',
              '@info-color': '@primary-color',
              '@warning-color': '#ffbf00',
              '@error-color': '#f04134',
              '@menu-bg': '#20242D',
              '@menu-item-active-bg': 'fade(@light, 5)',
              '@menu-highlight-color': '@light',
              '@card-background': '@component-background',
              '@card-hover-border': '#383847',
              '@card-actions-background': '#FBFCFD',
              '@tail-color': 'fade(@light, 10)',
              '@radio-button-bg': 'transparent',
              '@radio-button-checked-bg': 'transparent',
              '@radio-dot-color': '@primary-color',
              '@table-row-hover-bg': '#383847',
              '@item-hover-bg': '#383847',
              '@alert-text-color': 'fade(@dark, 65%)',

              '@tabs-horizontal-padding': '12px 0',

              // zIndex': 'notification > popover > tooltip
              '@zindex-notification': '1063',
              '@zindex-popover': '1061',
              '@zindex-tooltip': '1060',

              // width
              '@anchor-border-width': '1px',

              // margin
              '@form-item-margin-bottom': '24px',
              '@menu-item-vertical-margin': '0px',
              '@menu-item-boundary-margin': '0px',

              // size
              '@font-size-base': '14px',
              '@font-size-lg': '16px',
              '@screen-xl': '1208px',
              '@screen-lg': '1024px',
              '@screen-md': '768px',

              // 移动
              '@screen-sm': '767.9px',
              // 超小屏
              '@screen-xs': '375px',
              '@alert-message-color': '@popover-bg',
              '@background-color-light': '@popover-bg',
              '@layout-header-background': '@menu-dark-bg',

              // 官网
              '@site-text-color': '@text-color',
              '@site-border-color-split': 'fade(@light, 5)',
              '@site-heading-color': '@heading-color',
              '@site-header-box-shadow':
                '0 0.3px 0.9px rgba(0, 0, 0, 0.12), 0 1.6px 3.6px rgba(0, 0, 0, 0.12)',
              '@home-text-color': '@text-color',

              //自定义需要找设计师
              '@gray-8': '@text-color',
              '@background-color-base': '#FBFBFD',
              '@skeleton-color': 'rgba(0,0,0,0.8)',

              // pro
              '@pro-header-box-shadow': '@site-header-box-shadow',
            },
            javascriptEnabled: true,
          },
        },
      },
    }
  ],
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
      //   config,
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