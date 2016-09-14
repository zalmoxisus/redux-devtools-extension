import { createStore, applyMiddleware } from 'redux';
import rootReducer from '../reducers/background';
import api from '../middlewares/api';

export default function configureStore(preloadedState) {
  return createStore(rootReducer, preloadedState, applyMiddleware(api));
}
