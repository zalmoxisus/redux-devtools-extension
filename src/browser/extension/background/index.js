import createDevStore from 'remotedev-app/lib/store/createDevStore';
import openDevToolsWindow from './openWindow';
import { toContentScript } from './messaging';
import createMenu from './contextMenus';

const store = createDevStore(toContentScript);

// Expose objects globally in order to use them from windows via chrome.runtime.getBackgroundPage
window.store = store;
window.store.liftedStore.instances = {};

chrome.commands.onCommand.addListener(shortcut => {
  openDevToolsWindow(shortcut);
});
setTimeout(createMenu, 0);
