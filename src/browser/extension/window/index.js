import React from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import App from '../../../app/containers/App';

chrome.runtime.getBackgroundPage(background => {
  const { store, unsubscribe } = background.getStore();
  const ConnectedApp = connect(state => state)(App);
  render(
    <ConnectedApp store={store} />,
    document.getElementById('root')
  );
  addEventListener('unload', unsubscribe, true);
});
