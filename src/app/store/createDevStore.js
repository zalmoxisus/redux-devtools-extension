export default function createDevToolsStore(onDispatch) {
  let currentState = {
    committedState: {},
    stagedActions: [],
    computedStates: [],
    skippedActions: {},
    currentStateIndex: 0
  };
  let listeners = [];

  function dispatch(action) {
    if (action.type[0] !== '@') onDispatch(action);
    return action;
  }

  function getState() {
    return currentState;
  }

  function setState(state) {
    currentState = state;
    listeners.forEach(listener => listener());
  }

  function subscribe(listener) {
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  return {
    dispatch,
    getState,
    subscribe,
    liftedStore: {
      dispatch,
      getState,
      setState,
      subscribe
    }
  };
}
