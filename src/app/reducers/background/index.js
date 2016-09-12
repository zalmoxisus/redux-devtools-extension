import { combineReducers } from 'redux';
import instances from 'remotedev-app/lib/reducers/instances';

const rootReducer = combineReducers({
  instances
});

export default rootReducer;
