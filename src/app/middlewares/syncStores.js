import {
  UPDATE_STATE, LIFTED_ACTION, SELECT_INSTANCE
} from 'remotedev-app/lib/constants/actionTypes';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';
let autoselected = false;

const syncStores = (baseStore, isPopup) => store => next => action => {
  let result;
  if (action.type === UPDATE_STATE) {
    result = next({
      ...action,
      instances: baseStore.getState().instances
    });
  } else {
    result = next(action);
    if (action.type === LIFTED_ACTION) {
      const instances = store.getState().instances;
      const instanceId = getActiveInstance(instances);
      const id = instances.options[instanceId].connectionId;
      baseStore.dispatch({ ...action, instanceId, id });
    }
  }

  if (isPopup && !autoselected) {
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, tabs => {
      const instances = store.getState().instances;
      if (instances.current === 'default') return;
      autoselected = true;
      const tab = tabs[0];
      if (!tab) return;
      const connections = instances.connections[tab.id];
      if (connections && connections.length === 1) {
        next({ type: SELECT_INSTANCE, selected: connections[0] });
      }
    });
  }

  return result;
};

export default syncStores;
