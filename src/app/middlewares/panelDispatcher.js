import { LIFTED_ACTION, SELECT_INSTANCE } from 'remotedev-app/lib/constants/actionTypes';
import { nonReduxDispatch } from 'remotedev-app/lib/store/monitorActions';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';

export default function panelDispatcher(store) {
  let autoselected = false;
  function inject({ message, action, state }) {
    const instances = store.getState().instances;
    const instanceId = getActiveInstance(instances);
    chrome.devtools.inspectedWindow.eval(
      `window.postMessage({
       type: '${message}',
       payload: ${JSON.stringify(action)},
       state: '${nonReduxDispatch(store, message, instanceId, action, state, instances)}',
       id: '${instanceId}',
       source: '@devtools-extension'
       }, '*');`,
      { useContentScriptContext: false }
    );
  }

  return next => action => {
    const result = next(action);
    if (!autoselected) {
      autoselected = true;
      const connections = store.getState()
        .instances.connections[chrome.devtools.inspectedWindow.tabId];
      if (connections && connections.length === 1) {
        next({ type: SELECT_INSTANCE, selected: connections[0] });
      }
    }
    if (action.type === LIFTED_ACTION) inject(action);
    return result;
  };
}
