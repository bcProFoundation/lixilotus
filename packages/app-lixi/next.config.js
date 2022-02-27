/** @type {import('next').NextConfig} */

const path = require('path');
const webpack = require('webpack');

const withLess = require("next-with-less");

const lessToJS = require('less-vars-to-js');
const fs = require('fs');

const packageJson = require('./package.json');
const isProd = process.env.NODE_ENV === 'production';
const trueEnv = ['true', '1', 'yes'];

const NEXTJS_IGNORE_ESLINT = trueEnv.includes(
	process.env?.NEXTJS_IGNORE_ESLINT ?? 'false'
);
const NEXTJS_IGNORE_TYPECHECK = trueEnv.includes(
	process.env?.NEXTJS_IGNORE_TYPECHECK ?? 'false'
);

const disableSourceMaps = trueEnv.includes(
	process.env?.NEXT_DISABLE_SOURCEMAPS ?? 'false'
);

if (disableSourceMaps) {
	console.info(
		`${pc.green(
			'notice'
		)}- Sourcemaps generation have been disabled through NEXT_DISABLE_SOURCEMAPS`
	);
}

// Tell webpack to compile those packages
// @link https://www.npmjs.com/package/next-transpile-modules
const tmModules = [
	// for legacy browsers support (only in prod)
	...(isProd
		? [
			// '@bcpros/lixi-components',
			// '@bcpros/lixi-models'
			// ie: '@react-google-maps/api'...
			// '@bcpros/lixi-models',
			// '@bcpros/lixi-components'
		]
		: [
			// '@bcpros/lixi-models',
			// '@bcpros/lixi-components'
		]),
	// ESM only packages are not yet supported by NextJs if you're not
	// using experimental experimental esmExternals
	// @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
	// @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
	// @link https://github.com/vercel/next.js/issues/23725
	// @link https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
	...[
		// ie: newer versions of https://github.com/sindresorhus packages
	],
];


const antdVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, 'src/styles/variables.less'), 'utf8'));


const nextConfig = withLess({
	lessLoaderOptions: {
		lessOptions: {
			javascriptEnabled: true,
			modifyVars: {
				'hack': 'true;@import "~antd/lib/style/themes/compact.less";',
				...antdVariables,
			},
			localIdentName: '[path]___[local]___[hash:base64:5]'
		}
	},

	reactStrictMode: false,
	productionBrowserSourceMaps: !disableSourceMaps,
	optimizeFonts: true,
	httpAgentOptions: {
		// @link https://nextjs.org/blog/next-11-1#builds--data-fetching
		keepAlive: true,
	},
  compiler: {
    styledComponents: true
  },
	experimental: {
		// React 18 related
		// @link https://nextjs.org/docs/advanced-features/react-18
		// reactRoot: true,

		// Standalone build
		// @link https://nextjs.org/docs/advanced-features/output-file-tracing#automatically-copying-traced-files-experimental
		outputStandalone: true,
		// @link https://nextjs.org/docs/advanced-features/output-file-tracing#caveats
		outputFileTracingRoot: path.join(__dirname, '../../'),

		// Prefer loading of ES Modules over CommonJS
		// @link {https://nextjs.org/blog/next-11-1#es-modules-support|Blog 11.1.0}
		// @link {https://github.com/vercel/next.js/discussions/27876|Discussion}
		esmExternals: true,
		// Experimental monorepo support
		// @link {https://github.com/vercel/next.js/pull/22867|Original PR}
		// @link {https://github.com/vercel/next.js/discussions/26420|Discussion}
		externalDir: true
	},
	future: {
		// @link https://github.com/vercel/next.js/pull/20914
		// strictPostcssConfiguration: true,
	},
	// @link https://nextjs.org/docs/advanced-features/compiler#minification
	swcMinify: false,
	lessVarsFilePath: './src/styles/variables.less',
	lessVarsFilePathAppendToEndOfContent: true,
	// optional https://github.com/webpack-contrib/css-loader#object
	cssLoaderOptions: {
		modules: {
			localIdentName: process.env.NODE_ENV !== 'production' ? '[folder]__[local]__[hash:4]' : '[hash:8]',
		},
	},
	images: {
		loader: 'default',
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		disableStaticImages: false,
		// https://nextjs.org/docs/api-reference/next/image#caching-behavior
		minimumCacheTTL: 60,
		// Allowed domains for next/image
		domains: ['api.lixilotus.test', 'lixilotus.com', 'dev.lixilotus.com', 'staging.lixilotus.com', 'lixilotus.test'],
	},
	typescript: {
		ignoreBuildErrors: NEXTJS_IGNORE_TYPECHECK,
	},

	eslint: {
		ignoreDuringBuilds: NEXTJS_IGNORE_ESLINT,
		dirs: ['src'],
	},

	nextjs: {
		localIdentNameFollowDev: true, // default false, for easy to debug on PROD mode
	},

	// Other Config Here...

	webpack(config, { defaultLoaders, isServer }) {

		config.resolve.alias = {
			...config.resolve.alias,
			'@assets': path.resolve(__dirname, 'src/assets/'),
			'@images': path.resolve(__dirname, 'src/assets/images/'),
			'@icons': path.resolve(__dirname, 'src/assets/icons/'),
			'@utils': path.resolve(__dirname, 'src/utils/'),
			'@components': path.resolve(__dirname, 'src/components/'),
			'@hooks': path.resolve(__dirname, 'src/hooks/'),
			'@store': path.resolve(__dirname, 'src/store/'),
			'@bcpros/lixi-components': path.resolve(__dirname, '../lixi-components/src')
		};

		if (isServer) {
			// Till undici 4 haven't landed in prisma, we need this for docker/alpine
			// @see https://github.com/prisma/prisma/issues/6925#issuecomment-905935585
			config.externals.push('_http_common');
		}

		config.module.rules.push({
			type: 'asset',
			resourceQuery: /url/, // *.svg?url
		});

		config.module.rules.push({
			test: /\.svg$/,
			issuer: /\.(js|ts)x?$/,
			use: [
				{
					loader: '@svgr/webpack',
					// https://react-svgr.com/docs/webpack/#passing-options
					options: {
						prettier: false,
						svgo: false,
						titleProp: true,
					},
				},
				{
					loader: 'url-loader'
				}
			],
		});

		config.plugins.push(
			new webpack.EnvironmentPlugin({ ...process.env, 'THEME': { ...antdVariables } }),
		);

		return config;
	},
	env: {
		APP_NAME: packageJson.name,
		APP_VERSION: packageJson.version,
		BUILD_TIME: new Date().toISOString(),
	},
	serverRuntimeConfig: {
		// to bypass https://github.com/zeit/next.js/issues/8251
		PROJECT_ROOT: __dirname,
	},
});

let config;

if (tmModules.length > 0) {
	const withNextTranspileModules = require('next-transpile-modules')(
		tmModules,
		{
			resolveSymlinks: true,
			debug: true,
		}
	);
	config = withNextTranspileModules(nextConfig);
} else {
	config = nextConfig;
}

if (process.env.ANALYZE === 'true') {
	// @ts-ignore
	const withBundleAnalyzer = require('@next/bundle-analyzer')({
		enabled: true,
	});
	config = withBundleAnalyzer(config);
}

module.exports = config;
