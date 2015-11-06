import React from 'react';
import { render } from 'react-dom';
import Provider from '../../../app/containers/Provider';
import DevTools from '../../../app/containers/DevTools';
import createDevStore from '../../../app/store/createDevStore';

const store = createDevStore((action) => {
  chrome.devtools.inspectedWindow.eval(
    'window.postMessage({' +
    'type: \'ACTION\',' +
    'payload: ' + JSON.stringify(action) + ',' +
    'source: \'redux-cs\'' +
    '}, \'*\');',
    { useContentScriptContext: false }
  );
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

function init(defaultID) {
  backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId || defaultID
  });
}

// If devToolsExtension wasn't injected in an extension page, reload the page and inject it
chrome.devtools.inspectedWindow.eval(
  '[!window.devToolsExtension, chrome.runtime.id]',
  function(result, isException) {
    if (!isException && result[0] && result[1]) {
      require('./remote');
    }
    init(result[1]);
  }
);
