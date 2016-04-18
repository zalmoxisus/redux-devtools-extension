import jsan from 'jsan';
import logMonitorReducer from 'redux-devtools-log-monitor/lib/reducers';
import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';
import notifyErrors from '../utils/notifyErrors';

const monitorActions = [
  'TOGGLE_ACTION', 'SWEEP', 'SET_ACTIONS_ACTIVE',
  '@@redux-devtools-log-monitor/START_CONSECUTIVE_TOGGLE'
];

window.devToolsExtension = function(config = {}) {
  let liftedStore;
  if (!window.devToolsOptions) window.devToolsOptions = {};

  let localFilter;
  if (config.actionsBlacklist || config.actionsWhitelist) {
    localFilter = {
      whitelist: config.actionsWhitelist && config.actionsWhitelist.join('|'),
      blacklist: config.actionsBlacklist && config.actionsBlacklist.join('|')
    };
  }

  let shouldSerialize = false;
  let lastAction;
  let errorOccurred = false;
  let isMonitored = false;

  function stringify(obj) {
    return jsan.stringify(obj);
    /*
    return jsan.stringify(obj, function(key, value) {
      if (value && value.toJS) { return value.toJS(); }
      return value;
    }, null, true);
    */
  }

  function relaySerialized(message) {
    if (message.payload) message.payload = stringify(message.payload);
    if (message.action !== '') message.action = stringify(message.action);
    window.postMessage(message, '*');
  }

  function relay(type, state, action, nextActionId, isExcess) {
    setTimeout(() => {
      const message = {
        payload: type === 'STATE' && shouldFilter() ? filterActions(state) : state,
        action: action || '',
        nextActionId: nextActionId || '',
        isExcess,
        type,
        source: 'redux-page',
        name: config.name || document.title
      };
      if (shouldSerialize || window.devToolsOptions.serialize) {
        relaySerialized(message);
      } else {
        try {
          window.postMessage(message, '*');
        } catch (err) {
          relaySerialized(message);
          shouldSerialize = true;
        }
      }
    }, 0);
  }

  function onMessage(event) {
    if (!event || event.source !== window) {
      return;
    }

    const message = event.data;

    if (!message || message.source !== 'redux-cs') {
      return;
    }

    if (message.type === 'DISPATCH') {
      liftedStore.dispatch(message.payload);
    } else if (message.type === 'UPDATE') {
      relay('STATE', liftedStore.getState());
    } else if (message.type === 'START') {
      isMonitored = true;
      relay('STATE', liftedStore.getState());
    } else if (message.type === 'STOP') {
      isMonitored = false;
    }
  }

  const shouldFilter = () => localFilter || window.devToolsOptions.filter;
  function isFiltered(action) {
    if (!localFilter && !window.devToolsOptions.filter) return false;
    const { whitelist, blacklist } = localFilter || window.devToolsOptions;
    return (
      whitelist && !action.type.match(whitelist) ||
      blacklist && action.type.match(blacklist)
    );
  }
  function filterActions(state) {
    const filteredStagedActionIds = [];
    const filteredComputedStates = [];
    state.stagedActionIds.forEach((id, idx) => {
      if (!isFiltered(state.actionsById[id].action)) {
        filteredStagedActionIds.push(id);
        filteredComputedStates.push(state.computedStates[idx]);
      }
    });

    return { ...state,
      stagedActionIds: filteredStagedActionIds,
      computedStates: filteredComputedStates
    };
  }

  function init() {
    window.addEventListener('message', onMessage, false);
    relay('INIT_INSTANCE');
    notifyErrors(() => {
      errorOccurred = true;
      const state = liftedStore.getState();
      if (state.computedStates[state.currentStateIndex].error) {
        relay('STATE', state);
        return false;
      }
      return true;
    });

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
    return logMonitorReducer({}, state, action);
  }

  function handleChange(state, liftedState) {
    if (!isMonitored) return;
    const nextActionId = liftedState.nextActionId;
    const liftedAction = liftedState.actionsById[nextActionId - 1];
    const action = liftedAction.action;
    if (action.type === '@@INIT') {
      relay('INIT', state, { timestamp: Date.now() });
    } else if (!errorOccurred && monitorActions.indexOf(lastAction) === -1) {
      if (lastAction === 'JUMP_TO_STATE' || shouldFilter() && isFiltered(action)) return;
      const { maxAge } = window.devToolsOptions;
      const isExcess = maxAge && liftedState.stagedActionIds.length === maxAge;
      relay('ACTION', state, liftedAction, nextActionId, isExcess);
    } else {
      if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) errorOccurred = false;
      relay('STATE', liftedState);
    }
  }

  function extEnhancer(next) {
    return (reducer, initialState, enhancer) => {
      init();
      const store = next(reducer, initialState, enhancer);
      liftedStore = store.liftedStore;
      store.subscribe(() => {
        if (liftedStore !== store.liftedStore) liftedStore = store.liftedStore;
        handleChange(store.getState(), liftedStore.getState());
      });
      return store;
    };
  }

  if (!isAllowed(window.devToolsOptions)) return f => f;
  const { deserializeState, deserializeAction } = config;
  return configureStore(extEnhancer, monitorReducer, {
    deserializeState,
    deserializeAction
  });
};

window.devToolsExtension.open = function(position) {
  window.postMessage({
    source: 'redux-page',
    type: 'OPEN',
    position: position || ''
  }, '*');
};

window.devToolsExtension.notifyErrors = notifyErrors;
