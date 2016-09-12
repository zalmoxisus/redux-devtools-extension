import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from '../../../app/containers/App';
import configureStore from 'remotedev-app/lib/store/configureStore';

const monitorPosition = location.hash;
let monitor;
let selectedTemplate;
let testTemplates;

chrome.storage.local.get({
  ['monitor' + monitorPosition]: 'InspectorMonitor',
  'test-templates': null,
  'test-templates-sel': null
}, options => {
  monitor = options['monitor' + monitorPosition];
  selectedTemplate = options['test-templates-sel'];
  testTemplates = options['test-templates'];
});

chrome.runtime.getBackgroundPage(({ store }) => {
  const localStore = configureStore();
  const bg = chrome.runtime.connect({ name: 'monitor' });
  bg.onMessage.addListener(message => {
  });

  render(
    <Provider store={localStore}>
      <App
        monitor={monitor} monitorPosition={monitorPosition}
        selectedTemplate={selectedTemplate} testTemplates={testTemplates}
      />
    </Provider>,
    document.getElementById('root')
  );
});
