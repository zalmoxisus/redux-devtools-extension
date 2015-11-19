import { onConnect, onMessage, sendToTab } from 'crossmessaging';
import getOptions from '../options/getOptions';
import { MENU_DEVTOOLS } from '../../../app/constants/ContextMenus';
import { openDevToolsWindow } from './contextMenus';
let connections = {};

const naMessage = {
  na: true,
  source: 'redux-page'
};

// Connect to devpanel
onConnect((tabId) => {
  if (tabId !== store.id) return naMessage;
  return {
    payload: window.store.liftedStore.getState(),
    source: 'redux-page'
  };
}, {}, connections);

function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    // console.error(data + 'is not a valid JSON', e);
    return null;
  }
}

// Receive message from content script and relay to the devTools page
function messaging(request, sender, sendResponse) {
  const tabId = sender.tab ? sender.tab.id : sender.id;
  if (tabId) {
    if (request.type === 'PAGE_UNLOADED') {
      if (connections[ tabId ]) connections[ tabId ].postMessage(naMessage);
      return true;
    }
    if (request.type === 'GET_OPTIONS') {
      getOptions(options => {
        sendResponse({options: options});
      });
      return true;
    }
    if (request.type === 'OPEN') {
      openDevToolsWindow();
      return true;
    }

    const payload = typeof request.payload === 'string' ? parseJSON(request.payload) : request.payload;
    if (!payload) return true;
    store.liftedStore.setState(payload);
    if (request.init) {
      store.id = tabId;
      if (typeof tabId === 'number') {
        let url = sender.url;
        let hash = url.indexOf('#');
        if (hash !== -1) url = url.substr(0, hash);
        chrome.contextMenus.update(MENU_DEVTOOLS, {documentUrlPatterns: [url], enabled: true});
        chrome.pageAction.show(tabId);
      }
    }
    if (tabId in connections) {
      connections[ tabId ].postMessage({payload: payload});
    }
  }
  return true;
}

onMessage(messaging);
chrome.runtime.onMessageExternal.addListener(messaging);

export function toContentScript(action) {
  if (store.id in connections) {
    connections[ store.id ].postMessage({action: action});
  } else {
    sendToTab(store.id, {action: action});
  }
}
