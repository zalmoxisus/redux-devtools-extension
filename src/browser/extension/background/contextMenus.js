import { MENU_DEVTOOLS } from '../../../app/constants/ContextMenus.js';
let windows = {devtools: 0};

function addToMenu(id, title, contexts, onClick) {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: contexts,
    enabled: false,
    onclick: onClick
  });
}

function focusIfExist(type, callback) {
  if (!windows[type]) {
    callback();
  } else {
    chrome.windows.update(windows[type], {focused: true}, () => {
      if (chrome.runtime.lastError) callback();
    });
  }
}

function popWindow(action, url, type, customOptions) {
  focusIfExist(type, () => {
    let options = {
      type: 'panel',
      left: 5, top: 100,
      width: 800, height: 700,
      ...customOptions
    };
    if (action === 'open') {
      options.url = chrome.extension.getURL(url);
      chrome.windows.create(options, (win) => {
        windows[type] = win.id;
      });
    }
  });
}

export function openDevToolsWindow() {
  popWindow('open', 'window.html', 'devtools', {width: 320});
}

export default function createMenu() {
  addToMenu(MENU_DEVTOOLS, 'Open Redux DevTools', ['all'], openDevToolsWindow);
}
