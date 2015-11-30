import path from 'path';
import webpack from 'webpack';
import baseConfig from './base.config';

let config = baseConfig({
  output: { path: path.join(__dirname, '../dev/js') },
  globals: {
    'process.env': {
      NODE_ENV: '"development"'
    }
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ]
});

config.watch = true;

export default config;
