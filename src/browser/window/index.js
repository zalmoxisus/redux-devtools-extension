import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createDevTools } from 'redux-devtools';
import DevTools from '../../app/containers/DevTools';

chrome.runtime.getBackgroundPage( background => {
  render(
    <Provider store={background.store}>
      <DevTools />
    </Provider>,
    document.getElementById('root')
  );
});
