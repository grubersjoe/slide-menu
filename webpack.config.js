const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, options) => ({
  entry: {
    slideMenu: './src/slideMenu.js',
    demo: './src/styles/demo.scss',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Slide Menu',
      template: 'src/index.html',
      minify: options.mode === 'production' ? { collapseWhitespace: true, minifyJS: true } : false,
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
});
