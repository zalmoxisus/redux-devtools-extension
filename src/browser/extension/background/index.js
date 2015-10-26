import configureStore from '../../../app/store/configureStore';
import createMenu from './contextMenus';


createMenu(store);

window.store = store;
