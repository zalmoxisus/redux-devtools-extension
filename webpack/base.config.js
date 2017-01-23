import path from 'path';
import webpack from 'webpack';

const extpath = path.join(__dirname, '../src/browser/extension/');
const mock = `${extpath}chromeAPIMock.js`;

const baseConfig = (params) => ({
  entry: params.input || {
    background: [ mock, `${extpath}background/index` ],
    options: [ mock, `${extpath}options/index` ],
    window: [ `${extpath}window/index` ],
    remote: [ `${extpath}window/remote` ],
    devpanel: [ mock, `${extpath}devpanel/index` ],
    devtools: [ `${extpath}devtools/index` ],
    content: [ mock, `${extpath}inject/contentScript` ],
    pagewrap: [ `${extpath}inject/pageScriptWrap` ],
    'redux-devtools-extension': [ `${extpath}inject/index` ],
    inject: [ `${extpath}inject/index`, `${extpath}inject/deprecatedWarn` ],
    ...params.inputExtra
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    ...params.output
  },
  plugins: [
    new webpack.DefinePlugin(params.globals),
    ...(params.plugins ? params.plugins :
      [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
          comments: false,
          compressor: {
            warnings: false
          },
          mangle: {
            screw_ie8: true,
            keep_fnames: true
          }
        })
      ])
  ],
  resolve: {
    alias: {
      app: path.join(__dirname, '../src/app'),
      tmp: path.join(__dirname, '../build/tmp')
    },
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      ...(params.loaders ? params.loaders : [{
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|tmp\/page\.bundle)/
      }]),
      {
        test: /\.css?$/,
        loaders: ['style', 'raw']
      }
    ]
  }
});

export default baseConfig;
