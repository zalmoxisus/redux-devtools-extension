import createDevStore from '../../../app/store/createDevStore.js';
import createMenu from './contextMenus';
import { toContentScript } from './messaging';

const store = createDevStore((action) => {
  toContentScript(action);
});

createMenu();

window.store = store;
