import React from 'react';
import { render } from 'react-dom';
import { createDevTools } from 'redux-devtools';
import Provider from '../../app/containers/Provider';
import DevTools from '../../app/containers/DevTools';
import createDevStore from './../../app/store/createDevStore';

const store = createDevStore((action) => {
  chrome.devtools.inspectedWindow.eval('dispatch(' + JSON.stringify(action) + ')', {
    useContentScriptContext: true
  });
});

let rendered = false;

function showDevTools(){
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
  name: "panel"
});

backgroundPageConnection.onMessage.addListener((message) => {
  store.liftedStore.setState(message.payload);
  showDevTools();
});

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});

chrome.devtools.inspectedWindow.eval('update()', {
  useContentScriptContext: true
});
