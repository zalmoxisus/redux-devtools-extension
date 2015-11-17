import stringify from 'json-stringify-safe';
import configureStore from '../../../app/store/configureStore';
import { ACTION, UPDATE, OPTIONS } from '../../../app/constants/ActionTypes';

window.devToolsInit = function(store) {
  let options = {};
  let timeout = { id: null, last: 0};
  
  function doChange(init) {
    const state = store.liftedStore.getState();
    window.postMessage({
      payload: options.serialize ? stringify(state) : state,
      source: 'redux-page',
      init: init || false
    }, '*');
  }
  
  function onChange(init) {
    if (init || !options.timeout) doChange(init);
    else if(!timeout.last) {
      doChange();
      timeout.last = Date.now() / 1000 | 0;
    }
    else {
      const timeoutValue = (options.timeout - ((Date.now() / 1000 | 0) - timeout.last)) * 1000;
      window.clearTimeout(timeout.id);
      if (timeoutValue <= 0) {
        doChange();
        timeout.last = Date.now() / 1000 | 0;
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
    }

    else if (message.type === UPDATE) {
      onChange();
    }

    else if (message.type === OPTIONS) {
      options = message.options;
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
      const store = configureStore(next)(reducer, initialState);
      devToolsInit(store);
      return store;
    };
  };
};
