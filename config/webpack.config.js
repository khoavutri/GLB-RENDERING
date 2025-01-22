const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const config = {
  entry: {
    khoadev: path.resolve(__dirname, "../src/index.ts"),
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "../dist"),
    publicPath: "/",
    libraryTarget: "umd",
    clean: true,
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html",
      filename: "index.html",
    }),
    new webpack.BannerPlugin({
      banner: "The product is owned by Vu Tri Khoa",
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, "../public"), to: "public" },
        ],
      }),
    ],
  },
  devtool: false,
  mode: "production",
  watch: false,
};

config.devServer = {
  static: {
    directory: path.join(__dirname, "../dist"),
  },
  open: true,
  host: "0.0.0.0",
  port: 8080,
};

module.exports = config;
