import { createStore, applyMiddleware } from 'redux';
import persist from 'remotedev-app/lib/middlewares/persist';
import panelDispatcher from '../middlewares/panelSync';
import rootReducer from '../reducers/panel';

export default function configureStore(position, bgConnection, preloadedState) {
  const enhancer = applyMiddleware(persist(position), panelDispatcher(bgConnection));
  return createStore(rootReducer, preloadedState, enhancer);
}
