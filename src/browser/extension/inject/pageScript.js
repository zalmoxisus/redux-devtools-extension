import { getActionsArray, evalAction } from 'remotedev-utils';
import throttle from 'lodash/throttle';
import createStore from '../../../app/stores/createStore';
import configureStore, { getUrlParam } from '../../../app/stores/enhancerStore';
import { isAllowed } from '../options/syncOptions';
import Monitor from '../../../app/service/Monitor';
import { getLocalFilter, isFiltered, filterState, startingFrom } from '../../../app/api/filters';
import notifyErrors from '../../../app/api/notifyErrors';
import importState from '../../../app/api/importState';
import openWindow from '../../../app/api/openWindow';
import generateId from '../../../app/api/generateInstanceId';
import {
  updateStore, toContentScript, sendMessage, setListener, connect, disconnect,
  isInIframe, getSeralizeParameter
} from '../../../app/api';

const source = '@devtools-page';
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
  let errorOccurred = false;
  let maxAge;
  let actionCreators;
  let sendingActionId = 1;
  const instanceId = generateId(config.instanceId);
  const localFilter = getLocalFilter(config);
  const serializeState = getSeralizeParameter(config, 'serializeState');
  const serializeAction = getSeralizeParameter(config, 'serializeAction');
  let {
    statesFilter, actionsFilter, stateSanitizer, actionSanitizer, predicate, latency = 500
  } = config;

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
  if (config.getMonitor) {
    /* eslint-disable no-console */
    console.warn('Redux DevTools extension\'s `getMonitor` parameter is deprecated and will be not ' +
      'supported in the next version, please remove it and just use ' +
      '`__REDUX_DEVTOOLS_EXTENSION_COMPOSE__` instead: ' +
      'https://github.com/zalmoxisus/redux-devtools-extension#12-advanced-store-setup');
    /* eslint-enable no-console */
    config.getMonitor(monitor);
  }

  function exportState() {
    const liftedState = store.liftedStore.getState();
    const actionsById = liftedState.actionsById;
    const payload = [];
    liftedState.stagedActionIds.slice(1).forEach(id => {
      // if (isFiltered(actionsById[id].action, localFilter)) return;
      payload.push(actionsById[id].action);
    });
    toContentScript({
      type: 'EXPORT', payload, committedState: liftedState.committedState, source, instanceId
    }, serializeState, serializeAction);
  }

  function relay(type, state, action, nextActionId, libConfig) {
    const message = {
      type,
      payload: filterState(
        state, type, localFilter, stateSanitizer, actionSanitizer, nextActionId, predicate
      ),
      source,
      instanceId
    };

    if (type === 'ACTION') {
      message.action = !actionSanitizer ? action : actionSanitizer(action.action, nextActionId - 1);
      message.maxAge = maxAge;
      message.nextActionId = nextActionId;
    } else if (libConfig) {
      message.libConfig = libConfig;
    }

    toContentScript(message, serializeState, serializeAction);
  }

  const relayState = throttle((liftedState, libConfig) => {
    relayAction.cancel();
    const state = liftedState || store.liftedStore.getState();
    sendingActionId = state.nextActionId;
    relay('STATE', state, undefined, undefined, libConfig);
  }, latency);

  const relayAction = throttle(() => {
    const liftedState = store.liftedStore.getState();
    const nextActionId = liftedState.nextActionId;
    const currentActionId = nextActionId - 1;
    const liftedAction = liftedState.actionsById[currentActionId];

    // Send a single action
    if (sendingActionId === currentActionId) {
      sendingActionId = nextActionId;
      const action = liftedAction.action;
      const computedStates = liftedState.computedStates;
      if (
        isFiltered(action, localFilter) ||
        predicate && !predicate(computedStates[computedStates.length - 1].state, action)
      ) return;
      const state = liftedState.computedStates[liftedState.computedStates.length - 1].state;
      relay('ACTION', state, liftedState.actionsById[nextActionId - 1], nextActionId);
      return;
    }

    // Send multiple actions
    const payload = startingFrom(
      sendingActionId,
      liftedState,
      localFilter, stateSanitizer, actionSanitizer, predicate
    );
    sendingActionId = nextActionId;
    if (typeof payload === 'undefined') return;
    if (typeof payload.skippedActionIds !== 'undefined') {
      relay('STATE', payload);
      return;
    }
    toContentScript({
      type: 'PARTIAL_STATE',
      payload,
      source,
      instanceId,
      maxAge
    }, serializeState, serializeAction);
  }, latency);

  function dispatchRemotely(action) {
    if (config.features && !config.features.dispatch) return;
    try {
      const result = evalAction(action, actionCreators);
      (store.initialDispatch || store.dispatch)(result);
    } catch (e) {
      relay('ERROR', e.message);
    }
  }

  function importPayloadFrom(state) {
    if (config.features && !config.features.import) return;
    try {
      const nextLiftedState = importState(state, config);
      if (!nextLiftedState) return;
      store.liftedStore.dispatch({type: 'IMPORT_STATE', ...nextLiftedState});
    } catch (e) {
      relay('ERROR', e.message);
    }
  }

  function dispatchMonitorAction(action) {
    const type = action.type;
    const features = config.features;
    if (features) {
      if (!features.jump && (type === 'JUMP_TO_STATE' || type === 'JUMP_TO_ACTION')) return;
      if (!features.skip && type === 'TOGGLE_ACTION') return;
      if (!features.reorder && type === 'REORDER_ACTION') return;
      if (!features.import && type === 'IMPORT_STATE') return;
      if (!features.lock && type === 'LOCK_CHANGES') return;
      if (!features.pause && type === 'PAUSE_RECORDING') return;
    }
    if (type === 'JUMP_TO_STATE') {
      const liftedState = store.liftedStore.getState();
      const index = liftedState.stagedActionIds.indexOf(action.actionId);
      if (index === -1) return;
      store.liftedStore.dispatch({ type, index });
      return;
    }
    store.liftedStore.dispatch(action);
  }

  function onMessage(message) {
    switch (message.type) {
      case 'DISPATCH':
        dispatchMonitorAction(message.payload);
        return;
      case 'ACTION':
        dispatchRemotely(message.payload);
        return;
      case 'IMPORT':
        importPayloadFrom(message.state);
        return;
      case 'EXPORT':
        exportState();
        return;
      case 'UPDATE':
        relayState();
        return;
      case 'START':
        monitor.start(true);
        if (!actionCreators && config.actionCreators) {
          actionCreators = getActionsArray(config.actionCreators);
        }
        relayState(undefined, {
          name: config.name || document.title,
          actionCreators: JSON.stringify(actionCreators),
          features: config.features,
          serialize: !!config.serialize,
          type: 'redux'
        });

        if (reportId) {
          relay('GET_REPORT', reportId);
          reportId = null;
        }
        return;
      case 'STOP':
        monitor.stop();
        relayAction.cancel();
        relayState.cancel();
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
        relayState(state);
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
      relayAction();
      return;
    }
    if (monitor.isPaused() || monitor.isLocked() || monitor.isTimeTraveling()) return;
    const liftedState = store.liftedStore.getState();
    if (errorOccurred && !liftedState.computedStates[liftedState.currentStateIndex].error) {
      errorOccurred = false;
    }
    relayState(liftedState);
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
      stores[instanceId].initialDispatch = store.dispatch;
      stores[instanceId].liftedStore = store.liftedStore;
      stores[instanceId].getState = store.getState;
    }

    return {
      ...store,
      dispatch: (...args) => (
        window.__REDUX_DEVTOOLS_EXTENSION_LOCKED__ && store.dispatch(...args)
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
