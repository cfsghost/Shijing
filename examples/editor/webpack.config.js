var path = require('path')
var webpack = require('webpack')

module.exports = {
//	devtool: 'cheap-module-eval-source-map',
	entry: [
		'./index'
	],
	output: {
		path: path.join(__dirname, 'static'),
		filename: 'bundle.js',
		publicPath: '/static/'
	},
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				loaders: [ 'babel' ],
				exclude: /node_modules/,
				include: __dirname
			}
		]
	}
}
