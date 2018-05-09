const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, options) => ({
  entry: './src/SlideMenu.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'slide-menu.js',
  },
  module: {
    rules: [{
      test: /\.scss$/,
      use: [
        options.mode === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
        'css-loader',
        'sass-loader',
      ],
    }],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'slide-menu.css',
    }),
  ],
});
