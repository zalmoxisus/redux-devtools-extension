import React from 'react';
import { render } from 'react-dom';
import ConnectedApp from '../../../app/containers/ConnectedApp';

chrome.runtime.getBackgroundPage(({ store }) => {
  let currentState;
  let currentInstance;
  const listeners = [];
  function update() {
    currentState = undefined;
    listeners.forEach(listener => listener());
  }

  const bg = chrome.runtime.connect({ name: 'monitor' });
  bg.onMessage.addListener(message => {
    if (message.type === 'UPDATE') update();
  });

  const subscribe = (listener) => {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };
  const localStore = {
    ...store,
    subscribe,
    liftedStore: {
      ...store.liftedStore,
      getState: () => {
        if (currentState) return currentState;
        currentState = store.liftedStore.getState(currentInstance, true);
        if (!currentState) {
          currentInstance = undefined;
          currentState = store.liftedStore.getState();
        }
        return currentState;
      },
      dispatch: (action) => {
        store.liftedStore.dispatch(action);
        if (action.type === 'JUMP_TO_STATE') update();
      },
      subscribe
    },
    setInstance: instance => {
      currentInstance = instance;
      currentState = undefined;
    }
  };

  render(
    <ConnectedApp store={localStore} />,
    document.getElementById('root')
  );
});
