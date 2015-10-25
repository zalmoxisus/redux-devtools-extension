import path from 'path';
import webpack from 'webpack';

export default {
  entry: {
    background: [ path.join(__dirname, '../src/browser/extension/background/index') ],
    window: [ path.join(__dirname, '../src/browser/window/index') ],
    devpanel: [ path.join(__dirname, '../src/browser/devpanel/index') ],
    devtools: [ path.join(__dirname, '../src/browser/extension/devtools/index') ],
    inject: [ path.join(__dirname, '../src/browser/extension/inject/index') ]
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