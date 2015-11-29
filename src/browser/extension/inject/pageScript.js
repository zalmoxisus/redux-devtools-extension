import stringify from 'json-stringify-safe';
import configureStore from '../../../app/store/configureStore';
import { ACTION, UPDATE, OPTIONS, COMMIT } from '../../../app/constants/ActionTypes';
import { isAllowed } from '../options/syncOptions';


window.devToolsInit = function(store) {
  const options = window.devToolsOptions || {};
  let timeout = { id: null, last: 0};

  function doChange(init) {
    const state = store.liftedStore.getState();
    if (options.limit && state.currentStateIndex > options.limit) {
      store.liftedStore.dispatch({type: COMMIT, timestamp: Date.now()});
      return;
    }
    window.postMessage({
      payload: typeof options.serialize === 'undefined' || options.serialize ? stringify(state) : state,
      source: 'redux-page',
      init: init || false
    }, '*');
  }

  function onChange(init) {
    if (init || !options.timeout) doChange(init);
    else if (!timeout.last) {
      doChange();
      timeout.last = Date.now();
    } else {
      const timeoutValue = (options.timeout * 1000 - (Date.now() - timeout.last));
      window.clearTimeout(timeout.id);
      if (timeoutValue <= 0) {
        doChange();
        timeout.last = Date.now();
      }
      else timeout.id = setTimeout(doChange, timeoutValue);
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
      timeout.last = 0;
      store.liftedStore.dispatch(message.payload);
    } else if (message.type === UPDATE) {
      onChange();
    }

  }

  store.liftedStore.subscribe(onChange);
  window.addEventListener('message', onMessage, false);

  onChange(true);
};

window.devToolsExtension = function(next) {
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

window.devToolsExtension.open = function() {
  window.postMessage({
    source: 'redux-page',
    type: 'OPEN'
  }, '*');
};
