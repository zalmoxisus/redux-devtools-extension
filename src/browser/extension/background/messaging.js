import { onConnect, onMessage, sendToTab } from 'crossmessaging';
import updateState from 'remotedev-app/lib/store/updateState';
import syncOptions from '../options/syncOptions';
import openDevToolsWindow from './openWindow';
let panelConnections = {};
let tabConnections = {};
let catchedErrors = {};
let monitors = 0;
let isMonitored = false;

window.syncOptions = syncOptions(toAllTabs); // Used in the options page

const naMessage = { type: 'NA' };

function initPanel(msg, port) {
  monitorInstances(true);
  panelConnections[msg.tabId] = port;
  if (msg.tabId !== store.id) return naMessage;
}

function getId(port) {
  return port.sender.tab ? port.sender.tab.id : port.sender.id;
}

function initInstance(msg, port) {
  const id = getId(port);
  tabConnections[id] = port;
  store.liftedStore.instances[id] = msg.instance;
  store.id = id;
  if (typeof id === 'number') chrome.pageAction.show(id);
  if (isMonitored) return { type: 'START' };
}

function disconnect(port) {
  if (!port.sender.tab && !port.sender.id) {
    monitorInstances(false);
    return;
  }
  const id = getId(port);
  delete tabConnections[id];
  if (panelConnections[id]) panelConnections[id].postMessage(naMessage);
  if (window.store.liftedStore.instances[id]) {
    delete window.store.liftedStore.instances[id];
    window.store.liftedStore.deleteInstance(id);
  }
}

onConnect(undefined, {
  INIT_PANEL: initPanel,
  INIT_INSTANCE: initInstance,
  RELAY: (msg, port) => { messaging(msg.message, port.sender); }
}, panelConnections, disconnect);

function handleInstancesChanged(instance, name) {
  window.store.liftedStore.instances[instance] = name || instance;
}

// Receive message from content script
function messaging(request, sender, sendResponse) {
  const tabId = sender.tab ? sender.tab.id : sender.id;
  if (tabId) {
    if (request.type === 'GET_OPTIONS') {
      window.syncOptions.get(options => {
        sendResponse({options: options});
      });
      return true;
    }
    if (request.type === 'OPEN') {
      let position = 'devtools-left';
      if (['remote', 'panel', 'left', 'right', 'bottom'].indexOf(request.position) !== -1) position = 'devtools-' + request.position;
      openDevToolsWindow(position);
      return true;
    }
    if (request.type === 'ERROR') {
      chrome.notifications.create('app-error', {
        type: 'basic',
        title: 'An error occurred in the app',
        message: request.message,
        iconUrl: 'img/logo/48x48.png',
        isClickable: false
      });
      return true;
    }

    request.id = tabId;
    const payload = updateState(store, request, handleInstancesChanged, store.liftedStore.instance);
    if (!payload) return true;

    // Relay the message to the devTools panel
    if (tabId in panelConnections) {
      panelConnections[tabId].postMessage(request);
    }

    // Notify when errors occur in the app
    window.syncOptions.get(options => {
      if (!options.notifyErrors) return;
      const computedState = payload.computedStates[payload.currentStateIndex];
      if (!computedState) return;
      const error = computedState.error;
      if (error === 'Interrupted by an error up the chain') return;
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

chrome.notifications.onClicked.addListener(id => {
  chrome.notifications.clear(id);
  if (id === 'redux-error') openDevToolsWindow('devtools-right');
});

export function toContentScript(action, id) {
  const message = { type: 'DISPATCH', action: action };
  if (id in panelConnections) {
    panelConnections[id].postMessage(message);
  } else {
    tabConnections[id].postMessage(message);
  }
}

function toAllTabs(msg) {
  Object.keys(tabConnections).forEach(id => {
    tabConnections[id].postMessage(msg);
  });
}

function monitorInstances(shouldMonitor) {
  if (
    !shouldMonitor && monitors !== 0
    || isMonitored === shouldMonitor
  ) return;
  toAllTabs({ type: shouldMonitor ? 'START' : 'STOP' });
  isMonitored = shouldMonitor;
}

const unsubscribeMonitor = (unsubscribeList) => () => {
  monitors--;
  unsubscribeList.forEach(unsubscribe => { unsubscribe(); });
  if (Object.getOwnPropertyNames(panelConnections).length === 0) {
    monitorInstances(false);
  }
};

// Expose store to extension's windows (monitors)
window.getStore = () => {
  monitors++;
  monitorInstances(true);
  let unsubscribeList = [];
  return {
    store: {
      ...store,
      liftedStore: {
        ...store.liftedStore,
        subscribe(...args) {
          const unsubscribe = store.liftedStore.subscribe(...args);
          unsubscribeList.push(unsubscribe);
          return unsubscribe;
        }
      }
    },
    unsubscribe: unsubscribeMonitor(unsubscribeList)
  };
};
