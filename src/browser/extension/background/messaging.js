import { MENU_DEVTOOLS } from '../../../app/constants/ContextMenus.js';
let connections = {};

function sendNAMessage(port) {
  port.postMessage({
    na: true,
    source: 'redux-page'
  });
}

// Listen to messages sent from the DevTools page
chrome.runtime.onConnect.addListener(function(port) {

  function extensionListener(message) {
    if (message.name === 'init') {
      connections[message.tabId] = port;
      if (message.tabId !== store.tabId) {
        sendNAMessage(port);
        return;
      }
      connections[message.tabId].postMessage({
        payload: store.liftedStore.getState(),
        source: 'redux-page'
      });
    }
  }

  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function(portDiscon) {
    portDiscon.onMessage.removeListener(extensionListener);

    Object.keys(connections).forEach(function(id) {
      if (connections[id] === portDiscon) {
        delete connections[id];
      }
    });
  });
});

// Receive message from content script and relay to the devTools page
function messaging(request, sender) {
  const tabId = sender.tab ? sender.tab.id : sender.id;
  if (tabId) {
    if (request.type === 'PAGE_UNLOADED') {
      if (connections[ tabId ]) sendNAMessage(connections[ tabId ]);
      return true;
    }
    if (request.payload) store.liftedStore.setState(request.payload);
    if (request.init) {
      store.tabId = tabId;
      if (typeof tabId === 'number') {
        chrome.contextMenus.update(MENU_DEVTOOLS, {documentUrlPatterns: [sender.url], enabled: true});
        chrome.pageAction.show(tabId);
      }
    }
    if (tabId in connections) {
      connections[ tabId ].postMessage(request);
    }
  }
  return true;
}

chrome.runtime.onMessage.addListener(messaging);
chrome.runtime.onMessageExternal.addListener(messaging);

export function toContentScript(action) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (store.tabId in connections) {
      connections[ store.tabId ].postMessage({action: action});
    } else {
      chrome.tabs.sendMessage(store.tabId, {action: action});
    }
  });
}
