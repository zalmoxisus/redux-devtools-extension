import { connect } from 'crossmessaging';
import React from 'react';
import { render } from 'react-dom';
import DevTools from '../../../app/containers/DevTools';
import createDevStore from '../../../app/store/createDevStore';
import parseJSON from '../utils/parseJSON';

const backgroundPageConnection = connect();

function dispatch(action) {
  chrome.devtools.inspectedWindow.eval(
    'window.postMessage({' +
    'type: \'ACTION\',' +
    'payload: ' + JSON.stringify(action) + ',' +
    'source: \'redux-cs\'' +
    '}, \'*\');',
    { useContentScriptContext: false }
  );
}

const store = createDevStore(dispatch);

let rendered = false;

function showDevTools() {
  if (!rendered) {
    render(
      <DevTools store={store} />,
      document.getElementById('root')
    );
    rendered = true;
  }
}

backgroundPageConnection.onMessage.addListener((message) => {
  if (message.na) {
    render(
      <div>No store found. Make sure to follow <a href="https://github.com/zalmoxisus/redux-devtools-extension#implementation" target="_blank">the instructions</a>.</div>,
      document.getElementById('root')
    );
    rendered = false;
  } else if (message.payload) {
    const payload = parseJSON(message.payload);
    if (!payload) return;
    store.liftedStore.setState(payload);
    showDevTools();
  } else if (message.action) {
    dispatch(message.action);
  }
});

function init(id) {
  chrome.devtools.inspectedWindow.eval(
    'window.postMessage({' +
    'type: \'UPDATE\',' +
    'source: \'redux-cs\'' +
    '}, \'*\');'
  );
  backgroundPageConnection.postMessage({ name: 'init', tabId: id });
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
