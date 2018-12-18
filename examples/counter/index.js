import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './store/configureStore';

const store1 = configureStore();
const store2 = configureStore();

render(
  <Provider store={store1}>
    <App />
  </Provider>,
  document.getElementById('root')
);

render(
  <Provider store={store2}>
    <App />
  </Provider>,
  document.getElementById('root2')
);
