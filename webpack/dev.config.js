import path from 'path';
import webpack from 'webpack';
import config from './base.config';

config.output.path = path.join(__dirname, '../dev/js');
config.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"development"'
    }
  }),
  new webpack.optimize.DedupePlugin()
];
config.devtool = 'eval';
config.watch = true;

export default config;