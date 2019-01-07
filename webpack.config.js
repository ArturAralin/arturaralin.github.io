const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const jsRules = () => ({
  test: /\.m?js$/,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env'],
    },
  },
});

const styleRules = env => ({
  test: /\.s?css$/,
  use: [
    env === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
    'css-loader',
    'sass-loader',
  ],
});

const plugins = mode === 'production'
  ? [
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ]
  : [];

module.exports = {
  mode,
  watch: mode === 'development',
  devtool: 'source-map',
  entry: path.resolve(__dirname, './src/main.js'),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'app.js',
  },
  module: {
    rules: [
      jsRules(),
      styleRules(mode),
    ],
  },
  plugins,
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          discardComments: {
            removeAll: true,
          },
        },
      }),
    ],
  },
  devServer: {
    host: '0.0.0.0',
    contentBase: path.join(__dirname, 'build'),
    compress: true,
    port: 9000,
  },
};
