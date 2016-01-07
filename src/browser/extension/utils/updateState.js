import parseJSON from '../utils/parseJSON';

function recompute(previousLiftedState, storeState, action, nextActionId) {
  const actionId = nextActionId - 1;
  const liftedState = { ...previousLiftedState };
  liftedState.stagedActionIds = [...liftedState.stagedActionIds, actionId];
  liftedState.actionsById = { ...liftedState.actionsById };
  liftedState.actionsById[actionId] = action;
  liftedState.nextActionId = nextActionId;
  liftedState.computedStates = [...liftedState.computedStates, { state: storeState }];
  liftedState.currentStateIndex++;
  return liftedState;
}

export default function updateState(store, request) {
  const payload = parseJSON(request.payload);
  if (!payload) return null;

  switch (request.type) {
    case 'ACTION':
      const newState = recompute(store.liftedStore.getState(), payload, parseJSON(request.action), request.nextActionId);
      store.liftedStore.setState(newState);
      return newState;
    case 'STATE':
      store.liftedStore.setState(payload);
      return payload;
    default:
      return null;
  }
}
