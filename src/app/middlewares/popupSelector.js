import { SELECT_INSTANCE } from 'remotedev-app/lib/constants/actionTypes';

export default function popupSelector(store) {
  let autoselected = false;
  return next => action => {
    const result = next(action);
    if (!autoselected) {
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
}
