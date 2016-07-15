import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import invariant from 'redux-immutable-state-invariant';
import reducer from '../reducers';

export let isMonitorAction;
export default function configureStore(initialState) {
  const store = createStore(reducer, initialState, compose(
    applyMiddleware(invariant(), thunk),
    window.devToolsExtension ? window.devToolsExtension({
      getMonitor: (monitor) => { isMonitorAction = monitor.isMonitorAction; }
    }) : f => f
  ));

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
