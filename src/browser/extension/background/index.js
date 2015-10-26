import createDevStore from '../../../app/store/createDevStore.js';
import createMenu from './contextMenus';

var store = createDevStore((action) => {
  console.log('action', action);
});

createMenu();

window.store = store;
