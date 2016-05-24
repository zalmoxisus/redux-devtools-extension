import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';
import { getLocalFilter, isFiltered, filterState } from '../utils/filters';
import notifyErrors from '../utils/notifyErrors';
import importState from '../utils/importState';
import toContentScript from '../utils/toContentScript';

const monitorActions = [
  'TOGGLE_ACTION', 'SWEEP', 'SET_ACTIONS_ACTIVE', 'IMPORT_STATE'
];

window.devToolsExtension = function(config = {}) {
  if (!window.devToolsOptions) window.devToolsOptions = {};

  let store;
  let liftedStore;
  let shouldSerialize = false;
  let lastAction;
  let errorOccurred = false;
  let isMonitored = false;
  let isExcess;
  const localFilter = getLocalFilter(config);
  const { statesFilter, actionsFilter } = config;

  function relay(type, state, action, nextActionId) {
    const message = {
      type,
      payload: filterState(state, type, localFilter, statesFilter, actionsFilter, nextActionId),
      source: 'redux-page',
      name: config.name || document.title
    };

    if (type === 'ACTION') {
      message.action = !actionsFilter ? action : actionsFilter(action.action, nextActionId - 1);
      message.isExcess = isExcess;
      message.nextActionId = nextActionId;
    } else if (action) {
      message.action = action;
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

  function onMessage(event) {
    if (!event || event.source !== window) return;
    const message = event.data;
    if (!message || message.source !== 'redux-cs') return;

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
    if (window.devToolsExtension.__listener) {
      window.removeEventListener('message', window.devToolsExtension.__listener);
    }
    window.devToolsExtension.__listener = onMessage; // Prevent applying listener multiple times
    window.addEventListener('message', onMessage, false);

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

    // Detect when the tab is reactivated
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && isMonitored) {
        relay('STATE', liftedStore.getState());
      }
    }, false);
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
      if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) errorOccurred = false;
      relay('STATE', liftedState);
    }
  }

  return (next) => {
    return (reducer, initialState, enhancer) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer, initialState, enhancer);

      const { deserializeState, deserializeAction } = config;
      store = configureStore(next, monitorReducer, {
        deserializeState,
        deserializeAction
      })(reducer, initialState, enhancer);
      liftedStore = store.liftedStore;

      init();
      store.subscribe(() => {
        if (liftedStore !== store.liftedStore) liftedStore = store.liftedStore;
        handleChange(store.getState(), liftedStore.getState());
      });
      return store;
    };
  };
};

window.devToolsExtension.open = function(position) {
  window.postMessage({
    source: 'redux-page',
    type: 'OPEN',
    position: position || ''
  }, '*');
};

window.devToolsExtension.notifyErrors = notifyErrors;
