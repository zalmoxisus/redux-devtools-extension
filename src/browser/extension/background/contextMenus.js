import openDevToolsWindow from './openWindow';
import { MENU_DEVTOOLS } from '../../../app/constants/ContextMenus.js';

function addToMenu(id, title, contexts, onClick) {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: contexts,
    enabled: false,
    onclick: onClick
  });
}

export default function createMenu() {
  addToMenu(MENU_DEVTOOLS, 'Open Redux DevTools', ['all'], openDevToolsWindow);
}
