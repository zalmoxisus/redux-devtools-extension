import { createStore, applyMiddleware, compose } from 'redux';
import DevTools from '../../../app/containers/DevTools';
import { ACTION, UPDATE } from '../../../app/constants/ActionTypes';

window.devToolsInit = function(store) {
  function onChange(init) {
    window.postMessage({
      payload: store.liftedStore.getState(),
      source: 'redux-page',
      init: init || false
    }, '*')
  }

  function onMessage(event) {
    let message;

    if (event && event.source !== window) {
      return
    }

    message = event.data;

    if (!message || message.source !== 'redux-cs') {
      return;
    }

    if (message.type === ACTION) {
      store.liftedStore.dispatch(message.payload);
    }

    if (message.type === UPDATE) {
      onChange();
    }
  }

  store.liftedStore.subscribe(onChange);
  window.addEventListener('message', onMessage);

  onChange(true);
};

window.devToolsExtension = function(next) {
  return (reducer, initialState) => {
    const store = DevTools.instrument()(next)(reducer, initialState);
    devToolsInit(store);
    return store;
  }
};
