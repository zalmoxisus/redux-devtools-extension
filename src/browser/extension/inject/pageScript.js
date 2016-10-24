import { getActionsArray, evalAction } from 'remotedev-utils';
import createStore from '../../../app/stores/createStore';
import configureStore, { getUrlParam } from '../../../app/stores/enhancerStore';
import { isAllowed } from '../options/syncOptions';
import Monitor from '../../../app/service/Monitor';
import { getLocalFilter, isFiltered, filterState } from '../../../app/api/filters';
import notifyErrors from '../../../app/api/notifyErrors';
import importState from '../../../app/api/importState';
import openWindow from '../../../app/api/openWindow';
import {
  updateStore, toContentScript, sendMessage, setListener, connect, disconnect,
  generateId, isInIframe
} from '../../../app/api';

let stores = {};
let reportId;

function deprecateParam(oldParam, newParam) {
  /* eslint-disable no-console */
  console.warn(`${oldParam} parameter is deprecated, use ${newParam} instead: https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md`);
  /* eslint-enable no-console */
}

const devToolsExtension = function(reducer, preloadedState, config) {
  /* eslint-disable no-param-reassign */
  if (typeof reducer === 'object') {
    config = reducer; reducer = undefined;
  } else if (typeof config !== 'object') config = {};
  /* eslint-enable no-param-reassign */
  if (!window.devToolsOptions) window.devToolsOptions = {};

  let store;
  let shouldSerialize = config.serializeState || config.serializeAction;
  let errorOccurred = false;
  let maxAge;
  let isExcess;
  let actionCreators;
  const instanceId = generateId(config.instanceId);
  const localFilter = getLocalFilter(config);
  let { statesFilter, actionsFilter, stateSanitizer, actionSanitizer, predicate } = config;

  // Deprecate statesFilter and actionsFilter
  if (statesFilter) {
    deprecateParam('statesFilter', 'stateSanitizer');
    stateSanitizer = statesFilter; // eslint-disable-line no-param-reassign
  }
  if (actionsFilter) {
    deprecateParam('actionsFilter', 'actionSanitizer');
    actionSanitizer = actionsFilter; // eslint-disable-line no-param-reassign
  }

  const monitor = new Monitor(relayState);
  if (config.getMonitor) config.getMonitor(monitor);

  function relay(type, state, action, nextActionId, shouldInit) {
    const message = {
      type,
      payload: filterState(
        state, type, localFilter, stateSanitizer, actionSanitizer, nextActionId, predicate
      ),
      source: '@devtools-page',
      instanceId
    };

    if (type === 'ACTION') {
      message.action = !actionSanitizer ? action : actionSanitizer(action.action, nextActionId - 1);
      message.isExcess = isExcess;
      message.nextActionId = nextActionId;
    } else if (shouldInit) {
      message.action = action;
      message.name = config.name || document.title;
    }

    if (shouldSerialize || window.devToolsOptions.serialize !== false) {
      toContentScript(message, true, config.serializeState, config.serializeAction);
    } else {
      toContentScript(message);
    }
  }

  function relayState(actions, shouldInit) {
    relay('STATE', store.liftedStore.getState(), actions, undefined, shouldInit);
  }

  function dispatchRemotely(action) {
    try {
      const result = evalAction(action, actionCreators);
      store.dispatch(result);
    } catch (e) {
      relay('ERROR', e.message);
    }
  }

  function onMessage(message) {
    switch (message.type) {
      case 'DISPATCH':
        store.liftedStore.dispatch(message.payload);
        return;
      case 'ACTION':
        dispatchRemotely(message.payload);
        return;
      case 'IMPORT':
        const nextLiftedState = importState(message.state, config);
        if (!nextLiftedState) return;
        store.liftedStore.dispatch({type: 'IMPORT_STATE', ...nextLiftedState});
        relayState();
        return;
      case 'UPDATE':
        relayState();
        return;
      case 'START':
        monitor.start(true);
        if (!actionCreators && config.actionCreators) {
          actionCreators = getActionsArray(config.actionCreators);
        }
        relayState(JSON.stringify(actionCreators), true);

        if (reportId) {
          relay('GET_REPORT', reportId);
          reportId = null;
        }
        return;
      case 'STOP':
        monitor.stop();
        if (!message.failed) relay('STOP');
    }
  }

  function init() {
    maxAge = config.maxAge || window.devToolsOptions.maxAge || 50;

    setListener(onMessage, instanceId);
    notifyErrors(() => {
      errorOccurred = true;
      const state = store.liftedStore.getState();
      if (state.computedStates[state.currentStateIndex].error) {
        relay('STATE', state);
      }
      return true;
    });

    relay('INIT_INSTANCE');
    store.subscribe(handleChange);

    if (typeof reportId === 'undefined') {
      reportId = getUrlParam('remotedev_report');
      if (reportId) openWindow();
    }
  }

  function handleChange() {
    if (!monitor.active) return;
    if (!errorOccurred && !monitor.isMonitorAction()) {
      const liftedState = store.liftedStore.getState();
      const nextActionId = liftedState.nextActionId;
      const currentActionId = nextActionId - 1;
      const liftedAction = liftedState.actionsById[currentActionId];
      const action = liftedAction.action;
      if (isFiltered(action, localFilter)) return;
      const stagedActionLength = liftedState.stagedActionIds.length;
      const state = liftedState.computedStates[stagedActionLength - 1].state;
      if (predicate && !predicate(state, action)) return;
      relay('ACTION', state, liftedAction, nextActionId);
      if (!isExcess && maxAge) isExcess = stagedActionLength >= maxAge;
    } else {
      if (monitor.isPaused() || monitor.isLocked() || monitor.isTimeTraveling()) return;
      const liftedState = store.liftedStore.getState();
      if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) {
        errorOccurred = false;
      }
      relay('STATE', liftedState);
    }
  }

  const enhance = () => (next) => {
    return (reducer_, initialState_, enhancer_) => {
      if (!isAllowed(window.devToolsOptions)) return next(reducer_, initialState_, enhancer_);

      store = stores[instanceId] =
        configureStore(next, monitor.reducer, config)(reducer_, initialState_, enhancer_);

      if (isInIframe()) setTimeout(init, 3000);
      else init();

      return store;
    };
  };

  if (!reducer) return enhance();
  return createStore(reducer, preloadedState, enhance);
};

// noinspection JSAnnotator
window.devToolsExtension = devToolsExtension;
window.devToolsExtension.open = openWindow;
window.devToolsExtension.updateStore = updateStore(stores);
window.devToolsExtension.notifyErrors = notifyErrors;
window.devToolsExtension.send = sendMessage;
window.devToolsExtension.listen = setListener;
window.devToolsExtension.connect = connect;
window.devToolsExtension.disconnect = disconnect;

window.__REDUX_DEVTOOLS_EXTENSION__ = window.devToolsExtension;

const preEnhancer = instanceId => next =>
  (reducer, preloadedState, enhancer) => {
    const store = next(reducer, preloadedState, enhancer);

    // Mutate the store in order to keep the reference
    if (stores[instanceId]) {
      stores[instanceId].dispatch = store.dispatch;
      stores[instanceId].liftedStore = store.liftedStore;
      stores[instanceId].getState = store.getState;
    }

    return {
      ...store,
      dispatch: (action) => (
        window.__REDUX_DEVTOOLS_EXTENSION_LOCKED__ ? action : store.dispatch(action)
      )
    };
  };

const extensionCompose = (config) => (...funcs) => {
  return (...args) => {
    const instanceId = generateId(config.instanceId);
    return [preEnhancer(instanceId), ...funcs].reduceRight(
      (composed, f) => f(composed), devToolsExtension({ ...config, instanceId })(...args)
    );
  };
};

window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = (...funcs) => {
  if (funcs.length === 0) {
    return devToolsExtension();
  }
  if (funcs.length === 1 && typeof funcs[0] === 'object') {
    return extensionCompose(funcs[0]);
  }
  return extensionCompose({})(...funcs);
};
