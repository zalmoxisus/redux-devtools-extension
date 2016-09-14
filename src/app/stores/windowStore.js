import { createStore, compose, applyMiddleware } from 'redux';
import persist from 'remotedev-app/lib/middlewares/persist';
import syncStores from '../middlewares/syncStores';
import rootReducer from '../reducers/window';

export default function configureStore(baseStore, position, preloadedState) {
  let enhancer;
  const middlewares = applyMiddleware(
    syncStores(baseStore, position === '#popup'),
    persist(position)
  );
  if (process.env.NODE_ENV === 'production') {
    enhancer = middlewares;
  } else {
    enhancer = compose(
      middlewares,
      window.devToolsExtension ? window.devToolsExtension() : noop => noop
    );
  }
  const store = createStore(rootReducer, preloadedState, enhancer);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
