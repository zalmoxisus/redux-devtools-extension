import { stringify } from 'jsan';
import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';
import notifyErrors from '../utils/notifyErrors';

window.devToolsExtension = function(config = {}) {
  let store = {};
  if (!window.devToolsOptions) window.devToolsOptions = {};
  let shouldSerialize = false;
  let shouldInit = true;
  let lastAction;
  let errorOccurred = false;

  function relaySerialized(message) {
    message.payload = stringify(message.payload);
    if (message.action !== '') message.action = stringify(message.action);
    window.postMessage(message, '*');
  }

  function relay(type, state, action, nextActionId) {
    setTimeout(() => {
      const message = {
        payload: state,
        action: action || '',
        nextActionId: nextActionId || '',
        type: type,
        source: 'redux-page',
        name: config.name || document.title,
        init: shouldInit
      };
      if (shouldInit) shouldInit = false;
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
      store.liftedStore.dispatch(message.payload);
    } else if (message.type === 'UPDATE') {
      relay('STATE', store.liftedStore.getState());
    }
  }

  function isFiltered(action) {
    if (!window.devToolsOptions.filter) return false;
    const { whitelist, blacklist } = window.devToolsOptions;
    return (
      whitelist && whitelist.indexOf(action.type) === -1 ||
      blacklist && blacklist.indexOf(action.type) !== -1
    );
  }

  function addFilter(state) {
    if (window.devToolsOptions.filter) {
      if (window.devToolsOptions.whitelist) state.whitelist = window.devToolsOptions.whitelist;
      else if (window.devToolsOptions.blacklist) state.blacklist = window.devToolsOptions.blacklist;
    }
  }

  function isLimit(nextActionId) {
    if (
      window.devToolsOptions.limit && window.devToolsOptions.limit !== '0'
      && nextActionId - 1 > window.devToolsOptions.limit
    ) {
      store.liftedStore.dispatch({type: 'COMMIT', timestamp: Date.now()});
      return true;
    }
    return false;
  }

  function init() {
    window.addEventListener('message', onMessage, false);
    relay('STATE', store.liftedStore.getState());
    notifyErrors(() => {
      errorOccurred = true;
      const state = store.liftedStore.getState();
      if (state.computedStates[state.currentStateIndex].error) {
        relay('STATE', state);
        return false;
      }
      return true;
    });

    // Detect when the tab is reactivated
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        shouldInit = true;
        relay('STATE', store.liftedStore.getState());
      }
    }, false);
  }

  function monitorReducer(state = {}, action) {
    lastAction = action.type;
    return state;
  }

  function handleChange(state, liftedState) {
    const nextActionId = liftedState.nextActionId;
    const liftedAction = liftedState.actionsById[nextActionId - 1];
    const action = liftedAction.action;
    if (action.type === '@@INIT') {
      relay('INIT', state, { timestamp: Date.now() });
    } else if (!errorOccurred && lastAction !== 'TOGGLE_ACTION' && lastAction !== 'SWEEP') {
      if (lastAction === 'JUMP_TO_STATE' || isLimit(nextActionId) || isFiltered(action)) return;
      relay('ACTION', state, liftedAction, nextActionId);
    } else {
      if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) errorOccurred = false;
      addFilter(liftedState);
      relay('STATE', liftedState);
    }
  }

  return (next) => {
    return (reducer, initialState, enhancer) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer, initialState, enhancer);

      store = configureStore(next, monitorReducer)(reducer, initialState, enhancer);
      init();
      store.subscribe(() => { handleChange(store.getState(), store.liftedStore.getState()); });
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
