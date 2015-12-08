import createDevStore from '../../../app/store/createDevStore.js';
import openDevToolsWindow from './openWindow';
import createMenu from './contextMenus';
import { toContentScript } from './messaging';

const store = createDevStore((action) => {
  toContentScript(action);
});

createMenu();

window.store = store;

chrome.commands.onCommand.addListener(shortcut => {
  if (store.liftedStore.isSet()) {
    openDevToolsWindow(shortcut);
  }
});
