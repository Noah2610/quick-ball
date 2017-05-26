
import webpack from "webpack";
import path from "path";

module.exports = [
	{
		/*entry: {
			menu: path.resolve(__dirname, "app/menu.js"),
			game: path.resolve(__dirname, "app/game.js")
		},*/
		//entry: {
			//app: path.resolve(__dirname, "app/main.js"),
			//depend: ["webpack/buildin/global", "p5", "socket.io-client"]
		//},
		entry: path.resolve(__dirname, "app/main.js"),
		output: {
			filename: "bundle.js",
			path: path.resolve(__dirname, "public/")
		},
		module: {
			rules: [
				{ test: /\.js$/, exclude: [path.resolve(__dirname, "node_modules/"), path.resolve(__dirname, "app/lib/")],
					loader: "babel-loader",
					options: { presets: ["es2015"] }
				}//,
				//{
					//test: /depend\.bundle\.js/, loader: "uglify"
				//}
			]
		},
		plugins: [
			//new webpack.optimize.CommonsChunkPlugin({ name: "depend", filename: "depend.bundle.js" }),
			//new webpack.optimize.UglifyJsPlugin({
				//compress: { warnings: false },
				//output: { comments: false }
			//})
		],
		resolve: {
			modules: [ path.resolve(__dirname, "node_modules") ]
		},
	devtool: "source-map"
	}
];
