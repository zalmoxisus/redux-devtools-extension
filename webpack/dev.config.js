import path from 'path';
import config from './prod.config';

config.output.path = path.join(__dirname, '../dev/js');
config.watch = true;

export default config;