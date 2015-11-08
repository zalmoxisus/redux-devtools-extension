import path from 'path';
import webpack from 'webpack';

const extpath = path.join(__dirname, '../src/browser/extension/');

export default {
  entry: {
    background: [ extpath + 'background/index' ],
    window: [ extpath + 'window/index' ],
    devpanel: [ extpath + 'devpanel/index' ],
    devtools: [ extpath + 'devtools/index' ],
    content: [ extpath + 'inject/contentScript' ],
    page: [ extpath + 'inject/pageScript' ],
    inject: [ extpath + 'inject/index' ]
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/
    }, {
      test: /\.css?$/,
      loaders: ['style', 'raw']
    }]
  }
};