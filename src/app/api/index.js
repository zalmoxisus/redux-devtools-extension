import jsan from 'jsan';
import throttle from 'lodash/throttle';
import seralizeImmutable from 'remotedev-serialize/immutable/serialize';
import { getLocalFilter, isFiltered } from './filters';
import importState from './importState';
import generateId from './generateInstanceId';

const listeners = {};
export const source = '@devtools-page';

function tryCatchStringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    /* eslint-disable no-console */
    if (process.env.NODE_ENV !== 'production') console.log('Failed to stringify', err);
    /* eslint-enable no-console */
    return jsan.stringify(obj, null, null, { circular: '[CIRCULAR]' });
  }
}

function stringify(obj, serialize) {
  if (typeof serialize === 'undefined') {
    return tryCatchStringify(obj);
  }
  return jsan.stringify(obj, serialize.replacer, null, serialize.options);
}

export function getSeralizeParameter(config, param) {
  const serialize = config.serialize;
  if (serialize) {
    if (serialize === true) return { options: true };
    if (serialize.immutable) {
      return {
        replacer: seralizeImmutable(serialize.immutable, serialize.refs).replacer,
        options: serialize.options || true
      };
    }
    if (!serialize.replacer) return { options: serialize.options };
    return { replacer: serialize.replacer, options: serialize.options || true };
  }

  const value = config[param];
  if (typeof value === 'undefined') return undefined;
  console.warn(`\`${param}\` parameter for Redux DevTools Extension is deprecated. Use \`serialize\` parameter instead: https://github.com/zalmoxisus/redux-devtools-extension/releases/tag/v2.12.1`); // eslint-disable-line

  if (typeof serializeState === 'boolean') return { options: value };
  if (typeof serializeState === 'function') return { replacer: value };
  return value;
}

function post(message) {
  window.postMessage(message, '*');
}

function amendActionType(action, serialize) {
  if (typeof action === 'string') return { action: { type: action }, timestamp: Date.now() };
  if (!action.type) return { action: { type: 'update' }, timestamp: Date.now() };
  if (action.action) return action;
  return {
    action: !serialize && typeof action.type === 'symbol' ?
      { ...action, type: action.type.toString() } : action,
    timestamp: Date.now()
  };
}

export function toContentScript(message, serializeState, serializeAction) {
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
    if (typeof message.committedState !== 'undefined') {
      message.committedState = stringify(message.committedState, serializeState);
    }
  }
  post(message);
}

export function sendMessage(action, state, config, instanceId, name) {
  let amendedAction = action;
  if (typeof config !== 'object') {
    // Legacy: sending actions not from connected part
    config = {}; // eslint-disable-line no-param-reassign
    if (action) amendedAction = amendActionType(action);
  }
  const message = {
    type: action ? 'ACTION' : 'STATE',
    action: amendedAction,
    payload: state,
    maxAge: config.maxAge,
    source,
    name: config.name || name,
    instanceId: config.instanceId || instanceId || 1
  };
  toContentScript(message, config.serialize, config.serialize);
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

const liftListener = (listener, config) => message => {
  let data = {};
  if (message.type === 'IMPORT') {
    data.type = 'DISPATCH';
    data.payload = {
      type: 'IMPORT_STATE',
      ...importState(message.state, config)
    };
  } else {
    data = message;
  }
  listener(data);
};

export function disconnect() {
  window.removeEventListener('message', handleMessages);
  post({ type: 'DISCONNECT', source });
}

export function connect(preConfig) {
  const config = preConfig || {};
  const id = generateId(config.instanceId);
  if (!config.instanceId) config.instanceId = id;
  if (!config.name) config.name = document.title && id === 1 ? document.title : `Instance ${id}`;
  if (config.serialize) config.serialize = getSeralizeParameter(config);
  const latency = config.latency;
  const predicate = config.predicate;
  const localFilter = getLocalFilter(config);
  const autoPause = config.autoPause;
  let isPaused = autoPause;
  let delayedActions = [];
  let delayedStates = [];

  const rootListiner = action => {
    if (autoPause) {
      if (action.type === 'START') isPaused = false;
      else if (action.type === 'STOP') isPaused = true;
    }
    if (action.type === 'DISPATCH') {
      const payload = action.payload;
      if (payload.type === 'PAUSE_RECORDING') {
        isPaused = payload.status;
        toContentScript({
          type: 'LIFTED',
          liftedState: { isPaused },
          instanceId: id,
          source
        });
      }
    }
  };

  listeners[id] = [rootListiner];

  const subscribe = (listener) => {
    if (!listener) return undefined;
    const liftedListener = liftListener(listener, config);
    listeners[id].push(liftedListener);

    return function unsubscribe() {
      const index = listeners[id].indexOf(liftedListener);
      listeners[id].splice(index, 1);
    };
  };

  const unsubscribe = () => {
    delete listeners[id];
  };

  const sendDelayed = throttle(() => {
    sendMessage(delayedActions, delayedStates, config);
    delayedActions = [];
    delayedStates = [];
  }, latency);

  const send = (action, state) => {
    if (isPaused || isFiltered(action, localFilter) || predicate && !predicate(state, action)) {
      return;
    }

    let amendedAction = action;
    const amendedState = config.stateSanitizer ? config.stateSanitizer(state) : state;
    if (action) {
      if (config.getActionType) {
        amendedAction = config.getActionType(action);
        if (typeof amendedAction !== 'object') {
          amendedAction = { action: { type: amendedAction }, timestamp: Date.now() };
        }
      }
      else if (config.actionSanitizer) amendedAction = config.actionSanitizer(action);
      amendedAction = amendActionType(amendedAction, config.serialize);
      if (latency) {
        delayedActions.push(amendedAction);
        delayedStates.push(amendedState);
        sendDelayed();
        return;
      }
    }
    sendMessage(amendedAction, amendedState, config);
  };

  const init = (state, liftedData) => {
    const message = {
      type: 'INIT',
      payload: stringify(state),
      instanceId: id,
      source
    };
    if (liftedData && Array.isArray(liftedData)) { // Legacy
      message.action = stringify(liftedData);
      message.name = config.name;
    } else {
      if (liftedData) {
        message.liftedState = liftedData;
        if (liftedData.isPaused) isPaused = true;
      }
      message.libConfig = {
        name: config.name || document.title,
        features: config.features,
        serialize: !!config.serialize,
        type: config.type
      };
      // TODO: add actionCreators
    }
    post(message);
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
