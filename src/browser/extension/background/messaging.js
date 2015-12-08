import { onConnect, onMessage, sendToTab } from 'crossmessaging';
import syncOptions from '../options/syncOptions';
import createMenu from './contextMenus';
import openDevToolsWindow from './openWindow';
let connections = {};

window.syncOptions = syncOptions; // Used in the options page

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
      syncOptions.get(options => {
        sendResponse({options: options});
      });
      return true;
    }
    if (request.type === 'OPEN') {
      let position = 'devtools-left';
      if (['panel', 'left', 'right', 'bottom'].indexOf(request.position) !== -1) position = 'devtools-' + request.position;
      openDevToolsWindow(position);
      return true;
    }

    const payload = typeof request.payload === 'string' ? parseJSON(request.payload) : request.payload;
    if (!payload) return true;
    store.liftedStore.setState(payload);
    if (request.init) {
      store.id = tabId;
      createMenu(sender.url, tabId);
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
