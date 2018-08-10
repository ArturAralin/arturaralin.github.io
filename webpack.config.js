const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StaticServer = require('static-server');

const DEV_SERVER_PORT = 8000;

const { log } = console;

const BASE_CONFIG = {
  entry: path.resolve(__dirname, './src/app.js'),
  output: {
    path: path.resolve(__dirname, './'),
    filename: 'bundle.js',
  },
  watch: true,
};

const server = new StaticServer({
  rootPath: __dirname,
  port: DEV_SERVER_PORT,
  host: '0.0.0.0',
  cors: '*',
  followSymlink: true,
  templates: {
    index: 'index.html',
  },
});


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

  server.start(() => {
    log(`Dev server has been started on http://localhost:${DEV_SERVER_PORT}`);
  });

  return {
    ...BASE_CONFIG,
    module: { rules },
    plugins,
    watch: IS_DEV_MODE,
  };
};
