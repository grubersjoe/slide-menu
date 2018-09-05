const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, options) => ({
  entry: {
    'slide-menu': './src/SlideMenu.ts',
    demo: './src/styles/demo.scss',
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  watch: options.mode !== 'production',
  devtool: options.mode !== 'production' ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          ...(options.mode === 'production' ? ['postcss-loader'] : []),
          {
            loader: "sass-loader",
            options: {
              outputStyle: 'compressed',
            }
          }
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Slide Menu',
      template: 'src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
});
