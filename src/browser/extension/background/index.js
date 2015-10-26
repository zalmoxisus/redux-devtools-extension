import createDevStore from '../../../app/store/createDevStore.js';
import createMenu from './contextMenus';
import { toContentScript } from './messaging';

var store = createDevStore((action) => {
  if (action.type[0]==='@') return;
  toContentScript(action);
});

createMenu();

window.store = store;
