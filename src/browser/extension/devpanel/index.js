import { connect } from 'crossmessaging';
import React from 'react';
import { render } from 'react-dom';
import updateState from 'remotedev-app/lib/store/updateState';
import createDevStore from 'remotedev-app/lib/store/createDevStore';
import DevTools from '../../../app/containers/DevTools';

const backgroundPageConnection = connect();

function dispatch(action) {
  chrome.devtools.inspectedWindow.eval(
    'window.postMessage({' +
    'type: \'DISPATCH\',' +
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
  switch (message.type) {
    case 'NA':
      render(
        <div>No store found. Make sure to follow <a href="https://github.com/zalmoxisus/redux-devtools-extension#implementation" target="_blank">the instructions</a>.</div>,
        document.getElementById('root')
      );
      rendered = false;
      break;
    case 'DISPATCH':
      dispatch(message.action);
      break;
    default:
      if (updateState(store, message)) showDevTools();
  }
});

function init(id) {
  chrome.devtools.inspectedWindow.eval(
    'window.postMessage({' +
    'type: \'UPDATE\',' +
    'source: \'redux-cs\'' +
    '}, \'*\');'
  );
  backgroundPageConnection.postMessage({ name: 'INIT_PANEL', tabId: id });
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
