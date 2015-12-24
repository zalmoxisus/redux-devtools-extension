import parseJSON from '../utils/parseJSON';

function recompute(previousLiftedState, storeState, action, nextActionId) {
  const actionId = nextActionId - 1;
  const liftedState = { ...previousLiftedState };
  liftedState.stagedActionIds.push(actionId);
  liftedState.actionsById[actionId] = parseJSON(action);
  liftedState.nextActionId = nextActionId;
  liftedState.computedStates.push({ state: storeState });
  liftedState.currentStateIndex++;
  return liftedState;
}

export default function updateState(store, request) {
  const payload = parseJSON(request.payload);
  if (!payload) return null;

  switch (request.type) {
    case 'ACTION':
      const newState = recompute(store.liftedStore.getState(), payload, request.action, request.nextActionId);
      store.liftedStore.setState(newState);
      return newState;
    case 'STATE':
      store.liftedStore.setState(payload);
      return payload;
    default:
      return null;
  }
}
