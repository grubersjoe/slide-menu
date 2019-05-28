const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const packageMeta = require('./package.json');

module.exports = [
  (env, options) => ({
    entry: {
      'slide-menu': './src/ts/SlideMenu.ts',
      demo: './src/styles/demo.scss',
    },
    resolve: {
      extensions: ['.ts', '.js'],
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
    devtool: options.mode !== 'production' ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/env',
                    {
                      targets: {
                        browsers: ['> 1%', 'not ie > 0']
                      },
                      useBuiltIns: 'usage',
                      corejs: "3",
                    }
                  ],
                ],
              }
            },
            {
              loader: 'ts-loader',
            }
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            ...(options.mode === 'production' ? ['postcss-loader'] : []),
            {
              loader: 'sass-loader',
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
        template: 'src/index.html',
        templateParameters: {
          version: packageMeta.version,
          title: `Slide Menu`,
          description: packageMeta.description,
        },
        meta: {
          charset: 'utf-8',
          description: packageMeta.description,
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        },
        favicon: './src/favicon.png',
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
  }),

  // Build code for legacy browsers seperately
  (env, options) => ({
    entry: {
      'slide-menu.ie': './src/ts/SlideMenu.legacy.ts',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      path: `${__dirname}/dist`,
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/env',
                    {
                      targets: {
                        browsers: ['> 1%', 'ie > 11']
                      },
                      useBuiltIns: 'usage',
                      corejs: "3",
                    }
                  ],
                ],
              }
            },
            {
              loader: 'ts-loader',
            }
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: [
            'css-loader',
            ...(options.mode === 'production' ? ['postcss-loader'] : []),
            {
              loader: 'sass-loader',
              options: {
                outputStyle: 'compressed',
              }
            }
          ],
        },
      ],
    },
  }),
];
