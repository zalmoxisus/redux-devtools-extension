import { createStore } from 'redux';
import rootReducer from '../reducers';
import * as actionCreators from '../actions';

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState,
    window.devToolsExtension && window.devToolsExtension({ actionCreators })
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
