import path from 'path';
import webpack from 'webpack';
import config from './base.config';

config.output.path = path.join(__dirname, '../build/extension/js');
config.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  }),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    comments: false,
    compressor: {
      warnings: false
    }
  })
];

export default config;