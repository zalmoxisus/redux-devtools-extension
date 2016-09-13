import { combineReducers } from 'redux';
import instances from './instances';
import monitor from 'remotedev-app/lib/reducers/monitor';
import notification from 'remotedev-app/lib/reducers/notification';

const rootReducer = combineReducers({
  instances,
  monitor,
  notification
});

export default rootReducer;
