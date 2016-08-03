var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	devtool: 'cheap-module-source-map',
	entry: [
		// 'webpack-hot-middleware/client',
		'./public/js/main.js'
	],
	output: {
		path: path.join(__dirname, 'build'),
		filename: 'all.js'
	},
	plugins: [
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
		new ExtractTextPlugin('all.css', {
            allChunks: true
        }),
		new HtmlWebpackPlugin({
	    	template: 'public/index.pug'
	    })
	],
	resolve: {
		alias: {
			webworkify: 'webworkify-webpack'
		}
	},
	module: {
		loaders: [
			{
	            test: /\.js$/,
	            include: path.resolve('node_modules/mapbox-gl-shaders/index.js'),
	            loader: 'transform/cacheable?brfs'
	        },
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/,
				include: path.join(__dirname, 'public')
			},
			{
				test: /\.monk$/,
				exclude: /node_modules/,
				loader: 'monkberry-loader'
			},
			{
				test: /\.scss?$/,
				loader: ExtractTextPlugin.extract('style', 'css', 'sass'),
				exclude: /node_modules/,
				include: path.join(__dirname, 'public')
			},
			{
				test: /\.json$/,
				loader: "json-loader"
			},
			{
				test: /\.pug$/,
				exclude: /node_modules/,
				loader: 'pug-loader'
			}
		],
		postLoaders: [
			{
				include: /node_modules\/mapbox-gl-shaders/,
				loader: 'transform',
				query: 'brfs'
			}
	    ]
	}
};
