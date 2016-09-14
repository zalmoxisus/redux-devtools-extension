import { LIFTED_ACTION, SELECT_INSTANCE } from 'remotedev-app/lib/constants/actionTypes';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';

export default function panelDispatcher(store) {
  let autoselected = false;
  function inject({ message: type, action, state }) {
    chrome.devtools.inspectedWindow.eval(
      'window.postMessage({' +
      'type: \'' + type + '\',' +
      'payload: ' + JSON.stringify(action) + ',' +
      'state: \'' + state + '\',' +
      'id: \'' + getActiveInstance(store.getState().instances) + '\',' +
      'source: \'@devtools-extension\'' +
      '}, \'*\');',
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
