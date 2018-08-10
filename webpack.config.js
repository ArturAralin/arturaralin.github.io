const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


const BASE_CONFIG = {
  entry: path.resolve(__dirname, './src/app.js'),
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'bundle.js',
  },
  watch: true,
};


const getStylesRules = isDevMode => ({
  test: /\.scss$/,
  use: [
    isDevMode ? { loader: 'style-loader' } : MiniCssExtractPlugin.loader,
    { loader: 'css-loader' },
    { loader: 'sass-loader' },
  ],
});

module.exports = (env, argv) => {
  const IS_DEV_MODE = argv.mode === 'development';
  const rules = [
    getStylesRules(IS_DEV_MODE),
  ].filter(Boolean);

  const plugins = [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ];

  return {
    ...BASE_CONFIG,
    module: { rules },
    plugins,
    watch: IS_DEV_MODE,
  };
};
