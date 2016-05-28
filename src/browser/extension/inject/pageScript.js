import createStore from '../../../app/store/createStore';
import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';
import { getLocalFilter, isFiltered, filterState } from '../utils/filters';
import notifyErrors from '../utils/notifyErrors';
import importState from '../utils/importState';
import openWindow from '../utils/openWindow';
import {
  toContentScript, sendMessage, setListener, connect, disconnect, generateId
} from '../utils/contentScriptMsg';

window.devToolsExtension = function(reducer, initialState, config) {
  /* eslint-disable no-param-reassign */
  if (typeof reducer === 'object') config = reducer;
  else if (typeof config !== 'object') config = {};
  /* eslint-enable no-param-reassign */
  if (!window.devToolsOptions) window.devToolsOptions = {};

  let store;
  let liftedStore;
  let shouldSerialize = false;
  let lastAction;
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
      toContentScript(message, true);
    } else {
      try {
        toContentScript(message);
      } catch (err) {
        toContentScript(message, true);
        shouldSerialize = true;
      }
    }
  }

  function onMessage(message) {
    switch (message.type) {
      case 'DISPATCH':
        liftedStore.dispatch(message.payload);
        return;
      case 'ACTION':
        store.dispatch(message.payload);
        return;
      case 'IMPORT':
        const nextLiftedState = importState(message.state, config);
        if (!nextLiftedState) return;
        liftedStore.dispatch({type: 'IMPORT_STATE', nextLiftedState});
        relay('STATE', liftedStore.getState());
        return;
      case 'UPDATE':
        relay('STATE', liftedStore.getState());
        return;
      case 'START':
        isMonitored = true;
        relay('STATE', liftedStore.getState());
        return;
      case 'STOP':
        isMonitored = false;
    }
  }

  function init() {
    setListener(onMessage, instanceId);
    notifyErrors(() => {
      errorOccurred = true;
      const state = liftedStore.getState();
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
    if (lastAction === '@@redux/INIT' && liftedStore) {
      // Send new lifted state on hot-reloading
      setTimeout(() => {
        relay('STATE', liftedStore.getState());
      }, 0);
    }
    return state;
  }

  const monitorActions = [
    'TOGGLE_ACTION', 'SWEEP', 'SET_ACTIONS_ACTIVE', 'IMPORT_STATE'
  ];

  function handleChange(state, liftedState) {
    if (!isMonitored) return;
    const nextActionId = liftedState.nextActionId;
    const liftedAction = liftedState.actionsById[nextActionId - 1];
    const action = liftedAction.action;
    if (action.type === '@@INIT') {
      relay('INIT', state, { timestamp: Date.now() });
    } else if (!errorOccurred && monitorActions.indexOf(lastAction) === -1) {
      if (lastAction === 'JUMP_TO_STATE' || isFiltered(action, localFilter)) return;
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

      store = configureStore(next, monitorReducer, config)(reducer_, initialState_, enhancer_);
      liftedStore = store.liftedStore;

      init();
      store.subscribe(() => {
        if (liftedStore !== store.liftedStore) liftedStore = store.liftedStore;
        handleChange(store.getState(), liftedStore.getState());
      });
      return store;
    };
  };

  if (!reducer) return enhance();
  return createStore(reducer, initialState, enhance);
};

window.devToolsExtension.open = openWindow;
window.devToolsExtension.notifyErrors = notifyErrors;
window.devToolsExtension.send = sendMessage;
window.devToolsExtension.listen = setListener;
window.devToolsExtension.connect = connect;
window.devToolsExtension.disconnect = disconnect;
