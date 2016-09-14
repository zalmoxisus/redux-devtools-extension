import { LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';
import { getActiveInstance } from 'remotedev-app/lib/reducers/instances';

export default function panelDispatcher(store) {
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
    if (action.type === LIFTED_ACTION) inject(action);
    return next(action);
  };
}
