import jsan from 'jsan';

const listeners = {};
export const source = '@devtools-page';

function stringify(obj, serialize) {
  if (typeof serialize === 'undefined') {
    return jsan.stringify(obj);
  }
  if (serialize === true) {
    return jsan.stringify(obj, function(key, value) {
      if (value && typeof value.toJS === 'function') return value.toJS();
      if (typeof value === 'symbol') return String(value);
      return value;
    }, null, true);
  }
  return jsan.stringify(obj, serialize.replacer, null, serialize.options);
}

export function generateId(instanceId) {
  return instanceId || Math.random().toString(36).substr(2);
}

function post(message) {
  window.postMessage(message, '*');
}

export function toContentScript(message, serializeState, serializeAction, shouldSerialize) {
  if (message.type === 'ACTION') {
    message.action = stringify(message.action, serializeAction);
    message.payload = stringify(message.payload, serializeState);
  } else if (message.type === 'STATE' || message.type === 'PARTIAL_STATE') {
    const { actionsById, computedStates, committedState, ...rest } = message.payload;
    message.payload = rest;
    message.actionsById = stringify(actionsById, serializeAction);
    message.computedStates = stringify(computedStates, serializeState);
    message.committedState = typeof committedState !== 'undefined';
  } else if (message.type === 'EXPORT') {
    message.payload = stringify(message.payload, serializeAction);
    message.committedState = stringify(message.committedState, serializeState);
  }
  message.serialize = shouldSerialize;
  post(message);
}

export function sendMessage(action, state, shouldStringify, id, name) {
  const message = {
    payload: state,
    source,
    name: name || '',
    instanceId: id
  };
  if (action) {
    message.type = 'ACTION';
    message.action = action.action ? action :
      { action: typeof action === 'object' ? action : { type: action } };
  } else {
    message.type = 'STATE';
  }

  toContentScript(message);
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
  post({ type: 'DISCONNECT', source });
}

export function connect(config = {}) {
  const id = generateId(config.instanceId);
  const name = config.name || document.title || id;

  const subscribe = (listener) => {
    if (!listener) return undefined;
    if (!listeners[id]) listeners[id] = [];
    listeners[id].push(listener);

    return function unsubscribe() {
      const index = listeners[id].indexOf(listener);
      listeners[id].splice(index, 1);
    };
  };

  const unsubscribe = () => {
    delete listeners[id];
  };

  const send = (action, state) => {
    sendMessage(action, state, true, id, name);
  };

  const init = (state, action) => {
    post(
      {
        type: 'INIT', payload: stringify(state),
        action: stringify(action || {}),
        instanceId: id, name, source
      }
    );
  };

  const error = (payload) => {
    post({ type: 'ERROR', payload, id, source });
  };

  window.addEventListener('message', handleMessages, false);

  post({ type: 'INIT_INSTANCE', instanceId: id, source });

  return {
    init,
    subscribe,
    unsubscribe,
    send,
    error
  };
}

export function updateStore(stores) {
  return function(newStore, instanceId) {
    /* eslint-disable no-console */
    console.warn('`devToolsExtension.updateStore` is deprecated, remove it and just use ' +
      '`__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` instead of the extension\'s store enhancer: ' +
      'https://github.com/zalmoxisus/redux-devtools-extension#12-advanced-store-setup');
    /* eslint-enable no-console */
    const store = stores[instanceId || Object.keys(stores)[0]];
    // Mutate the store in order to keep the reference
    store.liftedStore = newStore.liftedStore;
    store.getState = newStore.getState;
    store.dispatch = newStore.dispatch;
  };
}

export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}
