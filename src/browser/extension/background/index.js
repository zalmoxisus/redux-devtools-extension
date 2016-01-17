import createDevStore from 'remotedev-app/lib/store/createDevStore';
import openDevToolsWindow from './openWindow';
import { toContentScript } from './messaging';

const store = createDevStore((action) => {
  toContentScript(action);
});

window.store = store;

chrome.commands.onCommand.addListener(shortcut => {
  if (store.liftedStore.isSet()) {
    openDevToolsWindow(shortcut);
  }
});
