const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const package = require('./package.json');

const extensions = ['.ts', '.js'];
const rules = [
  {
    test: /\.ts$/,
    use: 'babel-loader',
    exclude: /node_modules/,
  },
  {
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'sass-loader',
        options: {
          sassOptions: {
            outputStyle: 'compressed',
          },
        },
      },
    ],
  },
];

module.exports = [
  // SlideMenu
  (env, options) => ({
    entry: './src/SlideMenu.ts',
    resolve: {
      extensions,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'slide-menu.js',
    },
    devtool: options.mode === 'production' ? false : 'source-map',
    module: {
      rules,
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'slide-menu.css',
      }),
    ],
  }),

  // Demo
  () => ({
    entry: './src/demo/demo.ts',
    resolve: {
      extensions,
    },
    output: {
      path: path.resolve(__dirname, 'docs/'),
      publicPath: '/',
      filename: 'demo.js',
    },
    devServer: {
      publicPath: '/',
    },
    module: {
      rules,
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './src/demo/index.html',
        templateParameters: {
          version: package.version,
          title: `Slide Menu`,
          description: package.description,
        },
        meta: {
          charset: 'utf-8',
          description: package.description,
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        },
        favicon: './src/demo/favicon.png',
      }),
      new MiniCssExtractPlugin({
        filename: 'demo.css',
      }),
    ],
  }),
];
