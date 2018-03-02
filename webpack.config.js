"use strict";
var webpack = require("webpack");
var path = require("path");
var loaders = require("./webpack.loaders");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var DashboardPlugin = require("webpack-dashboard/plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

// loaders.push({
//   test: /\.scss$/,
//   use: [
//     {
//       loader: "style-loader?sourceMap"
//     },
//     {
//       loader:
//         "css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]&sourceMap"
//     },
//     {
//       loader: "sass-loader"
//     }
//   ],
//   exclude: ["node_modules"]
// });

// local scss modules
loaders.push({
  test: /\.scss$/,
  loader: ExtractTextPlugin.extract({
    fallback: "style-loader",
    use:
      "css-loader?modules&sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded"
  }),
  exclude: ["node_modules"]
});

module.exports = {
  mode: "development",
  entry: [
    "react-hot-loader/patch",
    "./src/index.jsx" // your app's entry point
  ],
  devtool: process.env.WEBPACK_DEVTOOL || "eval-source-map",
  output: {
    publicPath: "./",
    path: path.join(__dirname, "public"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: loaders
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),

    // new webpack.NamedModulesPlugin(),
    // new webpack.HotModuleReplacementPlugin(),

    new ExtractTextPlugin({
      filename: "style.css",
      allChunks: true
    }),
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/template.html",
      files: {
        css: ["style.css"],
        js: ["bundle.js"]
      }
    })
  ]
};
