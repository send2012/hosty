import 'babel-polyfill'
import fs from 'fs'
import webpack from 'webpack'

const env = process.env.NODE_ENV || 'development'
const debug = env === 'development'
const devtool = debug ? 'cheap-source-map' : 'source-map'

export default {
  devtool,
  target: 'electron',
  entry: './src/main.js',
  output: {
    path: __dirname + '/app/assets/',
    filename: '../../main.js',
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(env),
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          plugins: ['transform-decorators-legacy'],
          presets: ['es2015', 'stage-0', 'react'],
        },
      },
    ],
  },
  externals: fs.readdirSync('node_modules').filter(dir => dir !== '.bin'),
  node: {
    __dirname: false,
    __filename: false,
  },
}
