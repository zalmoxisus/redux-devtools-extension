import mapValues from 'lodash/mapValues';
import { parse } from 'jsan';

export default function importState(state, { deserializeState, deserializeAction }) {
  if (!state) return undefined;
  let preloadedState;
  let nextLiftedState = parse(state);
  if (nextLiftedState.payload) {
    if (nextLiftedState.preloadedState) preloadedState = parse(nextLiftedState.preloadedState);
    nextLiftedState = parse(nextLiftedState.payload);
  }
  if (deserializeState) {
    if (typeof nextLiftedState.computedStates !== 'undefined') {
      nextLiftedState.computedStates = nextLiftedState.computedStates.map(computedState => ({
        ...computedState,
        state: deserializeState(computedState.state)
      }));
    }
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

  return { nextLiftedState, preloadedState };
}
