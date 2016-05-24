import mapValues from 'lodash/mapValues';
import { parse } from 'jsan';

export default function importState(state, { deserializeState, deserializeAction }) {
  if (!state) return undefined;
  const nextLiftedState = parse(state);
  if (deserializeState) {
    nextLiftedState.computedStates = nextLiftedState.computedStates.map(computedState => ({
      ...computedState,
      state: deserializeState(computedState.state)
    }));
    if (typeof nextLiftedState.committedState !== 'undefined') {
      nextLiftedState.committedState = deserializeState(nextLiftedState.committedState);
    }
  }
  if (deserializeAction) {
    nextLiftedState.actionsById = mapValues(nextLiftedState.actionsById, liftedAction => ({
      ...liftedAction,
      action: deserializeAction(liftedAction.action)
    }));
  }

  return nextLiftedState;
}
