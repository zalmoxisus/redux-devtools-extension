import createStore from '../../../app/store/createStore';
import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';
import { getLocalFilter, isFiltered, filterState } from '../utils/filters';
import notifyErrors from '../utils/notifyErrors';
import importState from '../utils/importState';
import openWindow from '../utils/openWindow';
import {
  updateStore, toContentScript, sendMessage, setListener, connect, disconnect, generateId
} from '../utils/contentScriptMsg';

let stores = {};

window.devToolsExtension = function(reducer, preloadedState, config) {
  /* eslint-disable no-param-reassign */
  if (typeof reducer === 'object') {
    config = reducer; reducer = undefined;
  } else if (typeof config !== 'object') config = {};
  /* eslint-enable no-param-reassign */
  if (!window.devToolsOptions) window.devToolsOptions = {};

  let store;
  let shouldSerialize = config.serializeState || config.serializeAction;
  let lastAction;
  let lastTime;
  let waitingTimeout;
  let errorOccurred = false;
  let isMonitored = false;
  let isExcess;
  const instanceId = generateId(config.instanceId);
  const localFilter = getLocalFilter(config);
  const { statesFilter, actionsFilter } = config;

  function relay(type, state, action, nextActionId) {
    const message = {
      type,
      payload: filterState(state, type, localFilter, statesFilter, actionsFilter, nextActionId),
      source: '@devtools-page',
      id: instanceId
    };

    if (type === 'ACTION') {
      message.action = !actionsFilter ? action : actionsFilter(action.action, nextActionId - 1);
      message.isExcess = isExcess;
      message.nextActionId = nextActionId;
    } else if (action) {
      message.action = action;
    } else {
      message.name = config.name || document.title;
    }

    if (shouldSerialize || window.devToolsOptions.serialize) {
      toContentScript(message, true, config.serializeState, config.serializeAction);
    } else {
      try {
        toContentScript(message);
      } catch (err) {
        toContentScript(message, true);
        shouldSerialize = true;
      }
    }
  }

  function relayState() {
    relay('STATE', store.liftedStore.getState());
  }

  function start() {
    isMonitored = true;
    relayState();
  }

  function stop() {
    isMonitored = false;
    clearTimeout(waitingTimeout);
  }

  function onMessage(message) {
    switch (message.type) {
      case 'DISPATCH':
        store.liftedStore.dispatch(message.payload);
        return;
      case 'ACTION':
        store.dispatch(message.payload);
        return;
      case 'IMPORT':
        const nextLiftedState = importState(message.state, config);
        if (!nextLiftedState) return;
        store.liftedStore.dispatch({type: 'IMPORT_STATE', nextLiftedState});
        relayState();
        return;
      case 'UPDATE':
        relayState();
        return;
      case 'START':
        start();
        return;
      case 'STOP':
        stop();
    }
  }

  function init() {
    setListener(onMessage, instanceId);
    notifyErrors(() => {
      errorOccurred = true;
      const state = store.liftedStore.getState();
      if (state.computedStates[state.currentStateIndex].error) {
        relay('STATE', state);
        return false;
      }
      return true;
    });

    relay('INIT_INSTANCE');
  }

  function monitorReducer(state = {}, action) {
    if (!isMonitored) return state;
    lastAction = action.type;
    if (lastAction === '@@redux/INIT' && store.liftedStore) {
      // Send new lifted state on hot-reloading
      setTimeout(relayState, 0);
    }
    return state;
  }

  const monitorActions = [
    'TOGGLE_ACTION', 'SWEEP', 'SET_ACTIONS_ACTIVE', 'IMPORT_STATE'
  ];
  function isWaiting() {
    const currentTime = Date.now();
    if (lastTime && currentTime - lastTime < 200) { // no more frequently than once in 200ms
      stop();
      waitingTimeout = setTimeout(start, 1000);
      return true;
    }
    lastTime = currentTime;
    return false;
  }

  function handleChange(state, liftedState) {
    if (!isMonitored) return;
    const nextActionId = liftedState.nextActionId;
    const liftedAction = liftedState.actionsById[nextActionId - 1];
    const action = liftedAction.action;
    if (action.type === '@@INIT') {
      relay('INIT', state, { timestamp: Date.now() });
    } else if (!errorOccurred && monitorActions.indexOf(lastAction) === -1) {
      if (lastAction === 'JUMP_TO_STATE' || isFiltered(action, localFilter) || isWaiting()) return;
      const { maxAge } = window.devToolsOptions;
      relay('ACTION', state, liftedAction, nextActionId);
      if (!isExcess && maxAge) isExcess = liftedState.stagedActionIds.length >= maxAge;
    } else {
      if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) {
        errorOccurred = false;
      }
      relay('STATE', liftedState);
    }
  }

  const enhance = () => (next) => {
    return (reducer_, initialState_, enhancer_) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer_, initialState_, enhancer_);

      store = stores[instanceId] =
        configureStore(next, monitorReducer, config)(reducer_, initialState_, enhancer_);

      init();
      store.subscribe(() => {
        handleChange(store.getState(), store.liftedStore.getState());
      });
      return store;
    };
  };

  if (!reducer) return enhance();
  return createStore(reducer, preloadedState, enhance);
};

window.devToolsExtension.open = openWindow;
window.devToolsExtension.updateStore = updateStore(stores);
window.devToolsExtension.notifyErrors = notifyErrors;
window.devToolsExtension.send = sendMessage;
window.devToolsExtension.listen = setListener;
window.devToolsExtension.connect = connect;
window.devToolsExtension.disconnect = disconnect;
