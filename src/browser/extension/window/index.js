import React from 'react';
import { render } from 'react-dom';
import DevTools from '../../../app/containers/DevTools';

chrome.runtime.getBackgroundPage(background => {
  background.getStore((store, unsubscribe) => {
    render(
      <DevTools store={store} />,
      document.getElementById('root')
    );
    addEventListener('unload', unsubscribe, true);
  });
});
