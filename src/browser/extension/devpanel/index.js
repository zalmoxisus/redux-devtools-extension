import React from 'react';
import { render } from 'react-dom';
import Provider from '../../../app/containers/Provider';
import DevTools from '../../../app/containers/DevTools';
import createDevStore from '../../../app/store/createDevStore';

const store = createDevStore((action) => {
  chrome.devtools.inspectedWindow.eval('dispatch(' + JSON.stringify(action) + ')', {
    useContentScriptContext: true
  });
});

let rendered = false;

function showDevTools() {
  if (!rendered) {
    render(
      <Provider store={store}>
        <DevTools />
      </Provider>,
      document.getElementById('root')
    );
    rendered = true;
  }
}

const backgroundPageConnection = chrome.runtime.connect({
  name: 'panel'
});

backgroundPageConnection.onMessage.addListener((message) => {
  if (message.source !== 'redux-page') return;
  if (message.na) {
    render(
      <div>No store found. Make sure to follow <a href="https://github.com/zalmoxisus/redux-devtools-extension#implementation" target="_blank">the instructions</a>.</div>,
      document.getElementById('root')
    );
    rendered = false;
    return;
  }
  if (!message.payload) return;

  store.liftedStore.setState(message.payload);
  showDevTools();
});

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});

// If devToolsExtension wasn't injected, reload the page and inject it
chrome.devtools.inspectedWindow.eval(
  'devToolsExtension',
  function(result, isException) {
    if (isException) {
      require('./remote');
    }
  }
);
