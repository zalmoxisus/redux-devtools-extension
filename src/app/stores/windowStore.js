import { createStore, compose, applyMiddleware } from 'redux';
import persist from 'remotedev-app/lib/middlewares/persist';
import syncStores from '../middlewares/syncStores';
import popupSelector from '../middlewares/popupSelector';
import rootReducer from '../reducers/window';

export default function configureStore(baseStore, position, preloadedState) {
  let enhancer;
  const middlewares = [syncStores(baseStore), persist(position)];
  if (position === '#popup') middlewares.push(popupSelector);
  if (process.env.NODE_ENV === 'production') {
    enhancer = applyMiddleware(...middlewares);
  } else {
    enhancer = compose(
      applyMiddleware(...middlewares),
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
