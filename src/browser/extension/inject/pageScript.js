import { stringify } from 'jsan';
import configureStore from '../../../app/store/configureStore';
import { isAllowed } from '../options/syncOptions';
import notifyErrors from '../utils/notifyErrors';

window.devToolsExtension = function(next) {
  let store = {};
  if (!window.devToolsOptions) window.devToolsOptions = {};
  let shouldSerialize = false;
  let shouldInit = true;
  let actionsCount = 0;
  let errorOccurred = false;
  let reducedState;

  function relaySerialized(message) {
    message.payload = stringify(message.payload, null, null, true);
    if (message.action !== '') message.action = stringify(message.action, null, null, true);
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

  function isLimit() {
    if (window.devToolsOptions.limit && actionsCount > window.devToolsOptions.limit) {
      store.liftedStore.dispatch({type: 'COMMIT', timestamp: Date.now()});
      return true;
    }
    return false;
  }

  function init() {
    window.addEventListener('message', onMessage, false);
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

  function subscriber(state = {}, action) {
    if (action && action.type) {
      if (action.type === '@@redux/INIT') {
        actionsCount = 1;
        relay('INIT', reducedState, { timestamp: Date.now() });
      } else if (action.type === 'PERFORM_ACTION') {
        actionsCount++;
        if (isLimit() || isFiltered(action.action) || errorOccurred) return state;
        relay('ACTION', reducedState, action, actionsCount);
      } else {
        setTimeout(() => {
          let liftedState = store.liftedStore.getState();
          if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) errorOccurred = false;
          addFilter(liftedState);
          relay('STATE', liftedState);
        }, 0);
      }
    }
    return state;
  }

  function createReducer(reducer) {
    return (state, action) => {
      reducedState = reducer(state, action);
      return reducedState;
    };
  }

  if (next) {
    console.warn('Please use \'window.devToolsExtension()\' instead of \'window.devToolsExtension\' as store enhancer. The latter will not be supported.');
    return (reducer, initialState) => {
      store = configureStore(next, subscriber)(createReducer(reducer), initialState);
      init();
      return store;
    };
  }
  return (next) => {
    return (reducer, initialState) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer, initialState);

      store = configureStore(next, subscriber)(createReducer(reducer), initialState);
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

window.devToolsExtension.notifyErrors = notifyErrors;
