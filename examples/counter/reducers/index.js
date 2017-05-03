import { combineReducers } from 'redux';
import counter from './counter';

const rootReducer = combineReducers({
  counter,
  payload: (state=[], action) => state
});

export default rootReducer;
