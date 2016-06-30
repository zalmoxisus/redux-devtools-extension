import updateState from 'remotedev-app/lib/store/updateState';
import syncOptions from '../options/syncOptions';
import openDevToolsWindow from './openWindow';
let panelConnections = {};
let tabConnections = {};
let monitorConnections = {};
let instancesConn = {};
let catchedErrors = {};
let monitors = 0;
let isMonitored = false;

window.syncOptions = syncOptions(toAllTabs); // Used in the options page

const naMessage = { type: 'NA' };

function handleInstancesChanged(instance, name) {
  window.store.instances[instance] = name || instance;
}

function updateMonitors() {
  Object.keys(monitorConnections).forEach(id => {
    monitorConnections[id].postMessage({ type: 'UPDATE' });
  });
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

    if (!instancesConn[request.id]) instancesConn[request.id] = tabId;
    const payload = updateState(window.store, request, handleInstancesChanged, window.store.instance);
    if (!payload) return true;

    // Relay the message to the devTools panel
    if (tabId in panelConnections) {
      panelConnections[tabId].postMessage(request);
    }

    updateMonitors();

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
        if (typeof window.store.id === 'number') {
          // chrome.pageAction.setIcon({tabId: window.store.id, path: 'img/logo/error.png'});
          catchedErrors.tab = window.store.id;
        }
      } else if (
        catchedErrors.last && typeof window.store.id === 'number' && catchedErrors.tab === window.store.id
      ) {
        chrome.pageAction.setIcon({tabId: window.store.id, path: 'img/logo/38x38.png'});
      }
      catchedErrors.last = error;
    });
  }
  return true;
}

function getId(port) {
  return port.sender.tab ? port.sender.tab.id : port.sender.id;
}

function initInstance(port, id) {
  if (typeof id === 'number') chrome.pageAction.show(id);
  if (isMonitored) port.postMessage({ type: 'START' });
}

function onConnect(port) {
  let connections;
  let id;
  let listener;
  let disconnect;

  if (port.name === 'tab') {
    connections = tabConnections; id = getId(port);
    listener = msg => {
      if (msg.name === 'INIT_INSTANCE') initInstance(port, id);
      else if (msg.name === 'RELAY') messaging(msg.message, port.sender);
    };
    disconnect = () => {
      port.onMessage.removeListener(listener);
      if (panelConnections[id]) panelConnections[id].postMessage(naMessage);
      delete tabConnections[id];
      Object.keys(instancesConn).forEach(instance => {
        if (instancesConn[instance] === id) {
          window.store.liftedStore.deleteInstance(instance);
          delete window.store.instances[instance];
          delete instancesConn[instance];
        }
      });
      updateMonitors();
    };
  } else if (port.name === 'monitor') {
    connections = monitorConnections; id = getId(port);
    monitors++;
    monitorInstances(true);
    disconnect = () => {
      monitors--;
      if (Object.getOwnPropertyNames(panelConnections).length === 0) {
        monitorInstances(false);
      }
    };
  } else {
    connections = panelConnections; id = port.name;
    monitorInstances(true);
    if (id !== window.store.id) port.postMessage(naMessage);
    disconnect = () => {
      monitorInstances(false);
    };
  }

  connections[id] = port;
  if (listener) port.onMessage.addListener(listener);

  port.onDisconnect.addListener(() => {
    disconnect();
    delete connections[id];
  });
}

chrome.runtime.onConnect.addListener(onConnect);
chrome.runtime.onConnectExternal.addListener(onConnect);
chrome.runtime.onMessage.addListener(messaging);
chrome.runtime.onMessageExternal.addListener(messaging);

chrome.notifications.onClicked.addListener(id => {
  chrome.notifications.clear(id);
  if (id === 'redux-error') openDevToolsWindow('devtools-right');
});

export function toContentScript(type, action, id, state) {
  const message = { type, action, state, id };
  if (id in panelConnections) {
    panelConnections[id].postMessage(message);
  }
  if (instancesConn[id] in tabConnections) {
    tabConnections[instancesConn[id]].postMessage(message);
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
  if (!shouldMonitor) window.store.clear();
  isMonitored = shouldMonitor;
}
