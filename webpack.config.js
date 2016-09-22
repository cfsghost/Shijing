var configs = module.exports = {
	entry: {
		app: [
			'babel-polyfill',
			'./src/Shijing.js'
		]
	},
	output: {
		libraryTarget: 'commonjs2',
		path: __dirname + '/lib',
		publicPath: '/lib',
		filename: 'Shijing.js'
	},
	target: 'node',
	module: {
		loaders: [
			{
				test: /\.js?$/,
				loader: 'babel',
				exclude: /(node_modules|bower_components)/,
				query: {
					presets: [ 'es2015', 'es2017' ]
				}
			},
			{ test: /\.css$/, loader: 'style-loader!css-loader' }
		]
	}
};
