import { LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';
import { UPDATE_STATES } from '../constants/actionTypes';

const syncStores = baseStore => store => next => action => {
  if (action.type === UPDATE_STATES) {
    return next({
      ...action,
      instances: baseStore.getState().instances
    });
  }
  if (action.type === LIFTED_ACTION) {
    const instances = store.getState().instances;
    const instanceId = instances.selected || instances.current;
    const id = instances.options[instanceId].connectionId;
    baseStore.dispatch({ ...action, instanceId, id });
  }
  return next(action);
};

export default syncStores;
