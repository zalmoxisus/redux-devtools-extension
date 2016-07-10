import React from 'react';
import { render } from 'react-dom';
import ConnectedApp from '../../../app/containers/ConnectedApp';

chrome.runtime.getBackgroundPage(({ store }) => {
  const listeners = [];
  function update() {
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
      dispatch: (action) => {
        store.liftedStore.dispatch(action);
        if (action.type === 'JUMP_TO_STATE') update();
      },
      subscribe
    }
  };

  render(
    <ConnectedApp store={localStore} />,
    document.getElementById('root')
  );
});
