import syncOptions from '../../browser/extension/options/syncOptions';
import openDevToolsWindow from '../../browser/extension/background/openWindow';
import { getReport } from '../../browser/extension/background/logging';
import { UPDATE_STATE, REMOVE_INSTANCE, LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';

const CONNECTED = 'socket/CONNECTED';
const DISCONNECTED = 'socket/DISCONNECTED';
const naMessage = { type: 'NA' };
const connections = {
  tab: {},
  panel: {},
  monitor: {}
};
let monitors = 0;
let isMonitored = false;

const getId = sender => sender.tab ? sender.tab.id : sender.id;

function toMonitors(action) {
  Object.keys(connections.monitor).forEach(id => {
    connections.monitor[id].postMessage(action.type === 'ERROR' ? action : { type: UPDATE_STATE });
  });
  Object.keys(connections.panel).forEach(id => {
    connections.panel[id].postMessage(action);
  });
}

function toContentScript({ message: type, action, id, instanceId, state }) {
  connections.tab[id].postMessage({ type, action, state, id: instanceId });
}

function toAllTabs(msg) {
  const tabs = connections.tab;
  Object.keys(tabs).forEach(id => {
    tabs[id].postMessage(msg);
  });
}

function monitorInstances(shouldMonitor) {
  if (isMonitored === shouldMonitor) return;
  toAllTabs({ type: shouldMonitor ? 'START' : 'STOP' });
  isMonitored = shouldMonitor;
}

function getReducerError() {
  const instancesState = window.store.getState().instances;
  const payload = instancesState.states[instancesState.current];
  const computedState = payload.computedStates[payload.currentStateIndex];
  if (!computedState) return false;
  return computedState.error;
}

// Receive messages from content scripts
function messaging(request, sender, sendResponse) {
  const tabId = getId(sender);
  if (!tabId) return;

  if (request.type === 'STOP') {
    window.store.dispatch({ type: DISCONNECTED });
    return;
  }
  if (request.type === 'GET_OPTIONS') {
    window.syncOptions.get(options => {
      sendResponse({ options });
    });
    return;
  }
  if (request.type === 'GET_REPORT') {
    getReport(request.payload, request.id);
    return;
  }
  if (request.type === 'OPEN') {
    let position = 'devtools-left';
    if (['remote', 'panel', 'left', 'right', 'bottom'].indexOf(request.position) !== -1) {
      position = 'devtools-' + request.position;
    }
    openDevToolsWindow(position);
    return;
  }
  if (request.type === 'ERROR') {
    if (request.payload) {
      toMonitors(request, tabId);
      return;
    }
    if (!request.message) return;
    const reducerError = getReducerError();
    chrome.notifications.create('app-error', {
      type: 'basic',
      title: reducerError ? 'An error occurred in the reducer' : 'An error occurred in the app',
      message: reducerError || request.message,
      iconUrl: 'img/logo/48x48.png',
      isClickable: !!reducerError
    });
    return;
  }

  const action = { type: UPDATE_STATE, request, id: tabId };
  window.store.dispatch(action);
  toMonitors(action, tabId);
}

function onConnect(port) {
  let id;
  let listener;
  let disconnect;

  window.store.dispatch({ type: CONNECTED, port });

  if (port.name === 'tab') {
    if (port.sender.tab) { // from the browser's tab
      id = port.sender.tab.id;
      chrome.pageAction.show(id);
    } else { // from inside other extension
      id = port.sender.id;
    }
    connections.tab[id] = port;
    listener = msg => {
      if (msg.name === 'INIT_INSTANCE') {
        if (isMonitored) port.postMessage({ type: 'START' });
        return;
      }
      if (msg.name === 'RELAY') {
        messaging(msg.message, port.sender, id);
      }
    };
    disconnect = () => {
      const p = connections.tab[id];
      p.onMessage.removeListener(listener);
      p.onDisconnect.removeListener(disconnect);
      delete connections.tab[id];
      window.store.dispatch({ type: REMOVE_INSTANCE, id });
      toMonitors(naMessage);
    };
    port.onMessage.addListener(listener);
    port.onDisconnect.addListener(disconnect);
  } else {
    let type;
    if (port.name === 'monitor') {
      id = getId(port.sender);
      type = 'monitor';
    } else {
      id = port.name;
      type = 'panel';
    }
    connections[type][id] = port;
    monitorInstances(true);
    monitors++;
    disconnect = () => {
      monitors--;
      connections[type][id].onDisconnect.removeListener(disconnect);
      delete connections[type][id];
      if (!monitors) {
        monitorInstances(false);
      }
    };
    port.onDisconnect.addListener(disconnect);
  }
}

chrome.runtime.onConnect.addListener(onConnect);
chrome.runtime.onConnectExternal.addListener(onConnect);
chrome.runtime.onMessage.addListener(messaging);
chrome.runtime.onMessageExternal.addListener(messaging);

chrome.notifications.onClicked.addListener(id => {
  chrome.notifications.clear(id);
  openDevToolsWindow('devtools-right');
});

window.syncOptions = syncOptions(toAllTabs); // Expose to the options page

export default function api() {
  return next => action => {
    if (action.type === LIFTED_ACTION) toContentScript(action);
    return next(action);
  };
}
