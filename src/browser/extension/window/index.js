import React from 'react';
import { render } from 'react-dom';
import ConnectedApp from '../../../app/containers/ConnectedApp';

chrome.runtime.getBackgroundPage(({ store }) => {
  const listeners = [];

  const bg = chrome.runtime.connect({ name: 'monitor' });
  bg.onMessage.addListener(message => {
    if (message.type === 'UPDATE') listeners.forEach(listener => listener());
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
      subscribe
    }
  };

  render(
    <ConnectedApp store={localStore} />,
    document.getElementById('root')
  );
});
