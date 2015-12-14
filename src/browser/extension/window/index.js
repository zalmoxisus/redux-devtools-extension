import React from 'react';
import { render } from 'react-dom';
import DevTools from '../../../app/containers/DevTools';

chrome.runtime.getBackgroundPage( background => {
  render(
    <DevTools store={background.store} />,
    document.getElementById('root')
  );
});
