export default function createDevToolsStore(onDispatch) {
  let currentState = {
    committedState: {},
    stagedActions: [],
    computedStates: [],
    skippedActions: {},
    currentStateIndex: 0
  };
  let handleChangeState = null;
  let initiated = false;

  function dispatch(action) {
    if (action.type[0] !== '@') onDispatch(action);
    return action;
  }

  function getState() {
    return currentState;
  }

  function isSet() {
    return initiated;
  }

  function setState(state) {
    currentState = state;
    if (handleChangeState) handleChangeState();
    if (!initiated) initiated = true;
  }

  function subscribe(listener) {
    handleChangeState = listener;

    return function unsubscribe() {
      handleChangeState = null;
    };
  }

  return {
    dispatch,
    getState,
    liftedStore: {
      dispatch,
      getState,
      setState,
      subscribe,
      isSet
    }
  };
}
