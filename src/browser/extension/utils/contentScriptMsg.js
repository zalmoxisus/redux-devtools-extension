import { stringify } from 'jsan';

const listeners = {};
export const source = '@devtools-page';

/*
function stringify(obj) {
   return jsan.stringify(obj, function(key, value) {
   if (value && value.toJS) { return value.toJS(); }
   return value;
   }, null, true);
}
*/

export function generateId(instanceId) {
  return instanceId || Math.random().toString(36).substr(2);
}

export function toContentScript(message, shouldStringify, serializeState, serializeAction) {
  if (shouldStringify) {
    if (message.payload) message.payload = stringify(message.payload, serializeState);
    if (message.action) message.action = stringify(message.action, serializeAction);
  }
  window.postMessage(message, '*');
}

export function sendMessage(action, state, shouldStringify, id) {
  const message = {
    payload: state,
    source,
    name: document.title,
    id
  };
  if (action) {
    message.type = 'ACTION';
    message.action = typeof action === 'object' ? action : { type: action };
  } else {
    message.type = 'STATE';
  }

  toContentScript(message, shouldStringify);
}

function handleMessages(event) {
  if (process.env.BABEL_ENV !== 'test' && (!event || event.source !== window)) return;
  const message = event.data;
  if (!message || message.source !== '@devtools-extension') return;
  Object.keys(listeners).forEach(id => {
    if (message.id && id !== message.id) return;
    if (typeof listeners[id] === 'function') listeners[id](message);
    else listeners[id].forEach(fn => { fn(message); });
  });
}

export function setListener(onMessage, instanceId) {
  listeners[instanceId] = onMessage;
  window.addEventListener('message', handleMessages, false);
}

export function disconnect() {
  window.removeEventListener('message', handleMessages);
  toContentScript({ type: 'DISCONNECT', source });
}

export function connect(config = {}) {
  const id = generateId(config.instanceId);

  const subscribe = (listener) => {
    if (!listener) return undefined;
    if (!listeners[id]) listeners[id] = [];
    listeners[id].push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners[id].splice(index, 1);
    };
  };

  const unsubscribe = (instanceId) => {
    delete listeners[instanceId];
  };

  const send = (action, state) => sendMessage(action, state, config.shouldStringify, id);

  window.addEventListener('message', handleMessages, false);


  return {
    subscribe,
    unsubscribe,
    send
  };
}

export function updateStore(stores) {
  return function(newStore, instanceId) {
    const store = stores[instanceId || Object.keys(stores)[0]];
    // Mutate the store in order to keep the reference
    store.liftedStore = newStore.liftedStore;
    store.getState = newStore.getState;
    store.dispatch = newStore.dispatch;
  };
}
