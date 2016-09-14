import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { Provider } from 'react-redux';
import App from '../../../app/containers/App';
import configureStore from '../../../app/store/panelStore';
import getPreloadedState from '../background/getPreloadedState';

const position = location.hash;
let rendered;
let store;
let bgConnection;
let naTimeout;
let preloadedState;
getPreloadedState(position, state => { preloadedState = state; });

function renderDevTools() {
  const node = document.getElementById('root');
  unmountComponentAtNode(node);
  clearTimeout(naTimeout);
  if (process.env.NODE_ENV !== 'production') {
    try {
      store = configureStore(position, preloadedState);
      render(
        <Provider store={store}>
          <App position={position} />
        </Provider>,
        node
      );
    } catch (error) {
      render(
        <pre>{error.stack}</pre>,
        document.getElementById('root')
      );
    }
  } else {
    store = configureStore(position, preloadedState);
    render(
      <Provider store={store}>
        <App position={position} />
      </Provider>,
      node
    );
  }
  rendered = true;
}

function renderNA() {
  if (rendered === false) return;
  rendered = false;
  naTimeout = setTimeout(() => {
    render(
      <div style={{ padding: '20px', width: '100%', textAlign: 'center' }}>
        No store found. Make sure to follow <a href="https://github.com/zalmoxisus/redux-devtools-extension#usage" target="_blank">the instructions</a>.
      </div>,
      document.getElementById('root')
    );
  }, 1500);
}

function init(id) {
  renderNA();
  bgConnection = chrome.runtime.connect({ name: id.toString() });
  bgConnection.onMessage.addListener(message => {
    if (message.type === 'NA') {
      renderNA();
    } else {
      if (!rendered) renderDevTools();
      store.dispatch(message);
    }
  });
}

if (chrome.devtools.inspectedWindow.tabId) {
  init(chrome.devtools.inspectedWindow.tabId);
} else {
  // If there's no tabId it means we're inspecting an extension background script and will use its id
  chrome.devtools.inspectedWindow.eval('chrome.runtime.id',
    function(result, isException) {
      if (!isException && result) init(result);
    });
}
