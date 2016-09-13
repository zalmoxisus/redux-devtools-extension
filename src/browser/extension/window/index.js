import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from '../../../app/containers/App';
import configureStore from '../../../app/store/windowStore';
import { UPDATE_STATES } from '../../../app/constants/actionTypes';

const position = location.hash;
let preloadedState;

chrome.storage.local.get([
  'monitor' + position, 'slider' + position, 'dispatcher' + position,
  'test-templates', 'test-templates-sel'
], options => {
  preloadedState = {
    monitor: {
      selected: options['monitor' + position],
      sliderIsOpen: options['slider' + position] || false,
      dispatcherIsOpen: options['dispatcher' + position] || false,
    },
    test: {
      selected: options['test-templates-sel'] || 0,
      templates: options['test-templates']
    }
  };
});

chrome.runtime.getBackgroundPage(({ store }) => {
  const localStore = configureStore(store, position, preloadedState);
  const bg = chrome.runtime.connect({ name: 'monitor' });
  const update = () => { localStore.dispatch({ type: UPDATE_STATES }); };
  bg.onMessage.addListener(update);
  update();

  render(
    <Provider store={localStore}>
      <App position={position} />
    </Provider>,
    document.getElementById('root')
  );
});
