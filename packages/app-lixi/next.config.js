/** @type {import('next').NextConfig} */

const path = require('path');
const webpack = require('webpack');

const withAntdLess = require('next-plugin-antd-less');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

const lessToJS = require('less-vars-to-js');
const fs = require('fs');

const antdVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, 'src/styles/variables.less'), 'utf8'));

module.exports = withBundleAnalyzer(withAntdLess({
	// modifyVars: {
	// 	'hack': 'true;@import "~antd/lib/style/themes/compact.less";',
	// 	...antdVariables,
	// },
	productionBrowserSourceMaps: true,
	lessVarsFilePath: './src/styles/variables.less',
	lessVarsFilePathAppendToEndOfContent: true,
	// optional https://github.com/webpack-contrib/css-loader#object
	cssLoaderOptions: {
		modules: {
			localIdentName: process.env.NODE_ENV !== 'production' ? '[folder]__[local]__[hash:4]' : '[hash:8]',
		},
	},
	images: {
		disableStaticImages: true
	},

	// Other Config Here...

	webpack(config, { defaultLoaders }) {
		// Resolve the path aliases.
		// config.resolve.plugins.push(new TsconfigPathsPlugin());

		// Let Babel compile outside of src/.
		// const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
		// const tsRule = oneOfRule.oneOf.find((rule) =>
		// 	rule.test.toString().includes("ts|tsx")
		// );

		// tsRule.include = undefined;
		// tsRule.exclude = /node_modules/;

		// config.module.rules.push({
		// 	test: /\.(js|jsx|ts|tsx)$/,
		// 	use: [defaultLoaders.babel],
		// });

		// config.module.rules.push({
		// 	test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
		// 	use: ['url-loader'],
		// });

		// config.module.rules.push({
		// 	test: /\.svg$/,
		// 	use: ['@svgr/webpack']
		// });

		config.plugins.push(
			new webpack.EnvironmentPlugin({ ...process.env, 'THEME': { ...antdVariables } }),
		);

		return config;
	},
}));
