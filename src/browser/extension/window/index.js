import React from 'react';
import { render } from 'react-dom';
import ConnectedApp from '../../../app/containers/ConnectedApp';

chrome.runtime.getBackgroundPage(background => {
  const { store, unsubscribe } = background.getStore();
  render(
    <ConnectedApp store={store} />,
    document.getElementById('root')
  );
  addEventListener('unload', unsubscribe, true);
});
