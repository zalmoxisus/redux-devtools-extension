import { createStore, applyMiddleware } from 'redux';
import persist from 'remotedev-app/lib/middlewares/persist';
import panelDispatcher from '../middlewares/panelDispatcher';
import rootReducer from '../reducers/panel';

export default function configureStore(position, preloadedState) {
  return createStore(rootReducer, preloadedState, applyMiddleware(persist(position), panelDispatcher));
}
