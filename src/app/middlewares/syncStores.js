import { LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';
import { UPDATE_STATES } from '../constants/actionTypes';

const syncStores = (baseStore) => () => next => action => {
  if (action.type === UPDATE_STATES) {
    return next({
      ...action,
      instances: baseStore.getState().instances
    });
  }
  if (action.type === LIFTED_ACTION) baseStore.dispatch(action);
  return next(action);
};

export default syncStores;
