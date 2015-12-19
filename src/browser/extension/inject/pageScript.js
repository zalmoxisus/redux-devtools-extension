import { stringify } from 'circular-json';
import configureStore from '../../../app/store/configureStore';
import { ACTION, UPDATE, OPTIONS, COMMIT } from '../../../app/constants/ActionTypes';
import { isAllowed } from '../options/syncOptions';

window.devToolsExtension = function(next) {
  function devToolsInit(store) {
    if (!window.devToolsOptions) window.devToolsOptions = {};
    let timeout = { id: null, last: 0 };
    let filtered = { last: null, post: false, skip: false };
    let shouldSerialize = false;

    function relayChanges(state, init) {
      const message = {
        payload: state,
        source: 'redux-page',
        init: init || false
      };
      if (shouldSerialize) {
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

    function checkState() {
      filtered.post = true;
      const state = store.liftedStore.getState();
      if (window.devToolsOptions.filter) {
        if (filtered.skip) filtered.skip = false;
        else {
          const actionType = state.actionsById[state.nextActionId - 1].action.type;
          const { whitelist, blacklist } = window.devToolsOptions;
          if (
            whitelist && whitelist.indexOf(actionType) === -1 ||
            blacklist && blacklist.indexOf(actionType) !== -1
          ) filtered.post = false;
        }
      }
      return state;
    }

    function doChange(init) {
      const state = filtered.last || checkState();

      if (!filtered.post) return;
      filtered.last = null; filtered.post = false;

      if (window.devToolsOptions.limit && state.currentStateIndex > window.devToolsOptions.limit) {
        store.liftedStore.dispatch({type: COMMIT, timestamp: Date.now()});
        return;
      }

      if (window.devToolsOptions.filter) {
        const { whitelist, blacklist } = window.devToolsOptions;
        state.filter = { whitelist, blacklist };
      }

      relayChanges(state, init);

      window.devToolsExtension.notifyErrors();
    }

    function onChange(init) {
      if (window.devToolsOptions.filter) filtered.last = checkState();

      if (init || !window.devToolsOptions.timeout) doChange(init);
      else if (!timeout.last) {
        doChange();
        timeout.last = Date.now();
      } else {
        const timeoutValue = (window.devToolsOptions.timeout * 1000 - (Date.now() - timeout.last));
        window.clearTimeout(timeout.id);
        if (timeoutValue <= 0) {
          doChange();
          timeout.last = Date.now();
        }
        else timeout.id = setTimeout(() => { doChange(); timeout.last = Date.now(); }, timeoutValue);
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

      if (message.type === ACTION) {
        timeout.last = 0; filtered.skip = true;
        store.liftedStore.dispatch(message.payload);
      } else if (message.type === UPDATE) {
        onChange();
      }

    }

    store.liftedStore.subscribe(onChange);
    window.addEventListener('message', onMessage, false);

    onChange(true);
  }

  if (next) {
    console.warn('Please use \'window.devToolsExtension()\' instead of \'window.devToolsExtension\' as store enhancer. The latter will not be supported.');
    return (reducer, initialState) => {
      const store = configureStore(next)(reducer, initialState);
      devToolsInit(store);
      return store;
    };
  }
  return (next) => {
    return (reducer, initialState) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer, initialState);

      const store = configureStore(next)(reducer, initialState);
      devToolsInit(store);
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

// Catch non-reducer errors
window.devToolsExtension.notifyErrors = function() {
  let lastError = 0;
  function postError(message) {
    window.postMessage({
      source: 'redux-page',
      type: 'ERROR',
      message: message
    }, '*');
  }
  function catchErrors(e) {
    if (window.devToolsOptions && !window.devToolsOptions.notifyErrors) return;
    const timeout = (window.devToolsOptions.timeout || 1) * 1000;
    if (!lastError) {
      setTimeout(() => { postError(e.message); }, window.devToolsOptions.timeout ? timeout : 0);
    } else if (lastError + timeout < e.timeStamp) {
      postError(e.message);
    }
    lastError = e.timeStamp;
  }
  window.addEventListener('error', catchErrors, false);
};
