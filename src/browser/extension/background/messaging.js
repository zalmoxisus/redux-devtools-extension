var connections = {};

// Listen to messages sent from the DevTools page
chrome.runtime.onConnect.addListener(function (port) {

  function extensionListener(message) {
    if (message.name == 'init') {
      connections[message.tabId] = port;
      connections[message.tabId].postMessage({
        payload: store.liftedStore.getState(),
        source: 'redux-page'
      });
    }
  }

  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    Object.keys(connections).forEach(function (id) {
      if (connections[id] == port) {
        delete connections[id];
      }
    })
  })
});

// Receive message from content script and relay to the devTools page
chrome.runtime.onMessage.addListener(function (request, sender) {
  store.liftedStore.setState(request.payload);
  if (sender.tab) {
    var tabId = sender.tab.id;
    if (store.tabId !== tabId) {
      store.tabId = tabId;
      chrome.pageAction.show(tabId);
    }
    if (tabId in connections) {
      connections[ tabId ].postMessage(request);
    }
  }
  return true;
});

export function toContentScript(action) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(store.tabId, {action: action}, function(response) {});
  });
}
