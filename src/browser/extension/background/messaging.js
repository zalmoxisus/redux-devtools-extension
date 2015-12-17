import { onConnect, onMessage, sendToTab } from 'crossmessaging';
import parseJSON from '../utils/parseJSON';
import syncOptions from '../options/syncOptions';
import createMenu from './contextMenus';
import openDevToolsWindow from './openWindow';
let connections = {};
let catchedErrors = {};

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
    if (request.type === 'ERROR') {
      if (catchedErrors.last) return true;
      chrome.notifications.create('app-error', {
        type: 'basic',
        title: 'An error occurred in the app',
        message: request.message,
        iconUrl: 'img/logo/48x48.png',
        isClickable: false
      });
      return true;
    }

    const payload = parseJSON(request.payload);
    if (!payload) return true;
    store.liftedStore.setState(payload);
    if (request.init) {
      store.id = tabId;
      createMenu(sender.url, tabId);
    }
    if (tabId in connections) {
      connections[tabId].postMessage({ payload: request.payload });
    }

    // Notify when errors occur in the app
    syncOptions.get(options => {
      if (!options.notifyErrors) return;
      const error = payload.computedStates[payload.currentStateIndex].error;
      if (error) {
        chrome.notifications.create('redux-error', {
          type: 'basic',
          title: 'An error occurred in the reducer',
          message: error,
          iconUrl: 'img/logo/48x48.png',
          isClickable: true
        });
        if (typeof store.id === 'number') {
          chrome.pageAction.setIcon({tabId: store.id, path: 'img/logo/error.png'});
          catchedErrors.tab = store.id;
        }
      } else if (catchedErrors.last && typeof store.id === 'number' && catchedErrors.tab === store.id) {
        chrome.pageAction.setIcon({tabId: store.id, path: 'img/logo/38x38.png'});
      }
      catchedErrors.last = error;
    });
  }
  return true;
}

onMessage(messaging);
chrome.runtime.onMessageExternal.addListener(messaging);

chrome.notifications.onClicked.addListener(id => {
  chrome.notifications.clear(id);
  if (id === 'redux-error') openDevToolsWindow('devtools-right');
});

export function toContentScript(action) {
  if (store.id in connections) {
    connections[ store.id ].postMessage({action: action});
  } else {
    sendToTab(store.id, {action: action});
  }
}
