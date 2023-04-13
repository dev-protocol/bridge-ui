// craco.config.js
module.exports = {
	style: {
		postcss: {
			plugins: [require('tailwindcss'), require('autoprefixer')]
		}
	},
	webpack: {
		configure: webpackConfig => {
			// We're currently on Webpack 4.x that doesn't support the `exports` field in package.json.
			// See https://github.com/webpack/webpack/issues/9509.
			//
			// In case you need to add more modules, make sure to remap them to the correct path.
			//
			// Map @uniswap/conedison to its dist folder.
			// This is required because conedison uses * to redirect all imports to its dist.
			webpackConfig.resolve.alias['@uniswap/conedison'] = '@uniswap/conedison/dist';

			return webpackConfig;
		}
	}
};
