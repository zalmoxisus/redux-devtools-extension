import { stringify } from 'circular-json';
import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';

window.devToolsExtension = function(next) {
  let store = {};
  if (!window.devToolsOptions) window.devToolsOptions = {};
  let shouldSerialize = false;
  let shouldInit = true;
  let actionsCount = 0;
  let errorOccurred = false;

  function relay(type, state, action, nextActionId) {
    const message = {
      payload: state,
      action: action || '',
      nextActionId: nextActionId || '',
      type: type,
      source: 'redux-page',
      init: shouldInit
    };
    if (shouldInit) shouldInit = false;
    if (shouldSerialize || window.devToolsOptions.serialize) {
      message.payload = stringify(state);
      window.postMessage(message, '*');
    } else {
      try {
        window.postMessage(message, '*');
      } catch (err) {
        message.payload = stringify(state);
        window.postMessage(message, '*');
        shouldSerialize = true;
      }
    }
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
      const { whitelist, blacklist } = window.devToolsOptions;
      state.filter = { whitelist, blacklist };
    }
  }

  function isLimit() {
    if (window.devToolsOptions.limit && actionsCount > window.devToolsOptions.limit) {
      store.liftedStore.dispatch({type: 'COMMIT', timestamp: Date.now()});
      return true;
    }
    return false;
  }

  function subscriber(state = {}, action) {
    if (action && action.type) {
      setTimeout(() => {
        if (action.type === 'PERFORM_ACTION') {
          actionsCount++;
          if (isLimit() || isFiltered(action.action) || errorOccurred) return state;
          relay('ACTION', store.getState(), action, actionsCount);
        } else {
          let liftedState = store.liftedStore.getState();
          if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) errorOccurred = false;
          addFilter(liftedState);
          relay('STATE', liftedState);
          actionsCount = liftedState.nextActionId;
        }
      }, 0);
    }
    return state;
  }

  function init() {
    window.addEventListener('message', onMessage, false);
    window.devToolsExtension.notifyErrors(store, relay, () => { errorOccurred = true; });
  }

  if (next) {
    console.warn('Please use \'window.devToolsExtension()\' instead of \'window.devToolsExtension\' as store enhancer. The latter will not be supported.');
    return (reducer, initialState) => {
      store = configureStore(next, subscriber)(reducer, initialState);
      init();
      return store;
    };
  }
  return (next) => {
    return (reducer, initialState) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer, initialState);

      store = configureStore(next, subscriber)(reducer, initialState);
      init();
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

// Catch errors
window.devToolsExtension.notifyErrors = function(store, relay, onError) {
  function postError(message) {
    if (store && store.liftedStore && relay) {
      const state = store.liftedStore.getState();
      if (state.computedStates[state.currentStateIndex].error) {
        relay('STATE', state);
        if (onError) onError();
        return;
      }
    }
    window.postMessage({
      source: 'redux-page',
      type: 'ERROR',
      message: message
    }, '*');
  }
  function catchErrors(e) {
    if (window.devToolsOptions && !window.devToolsOptions.notifyErrors) return;
    postError(e.message);
  }
  window.addEventListener('error', catchErrors, false);
};
