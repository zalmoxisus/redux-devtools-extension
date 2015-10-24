import configureStore from '../../../app/store/configureStore';
import createMenu from './contextMenus';

configureStore(store => {
  createMenu(store);
  
  require('./inject');

  window.store = store;
}, true);
