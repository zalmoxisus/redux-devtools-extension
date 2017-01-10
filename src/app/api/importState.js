import mapValues from 'lodash/mapValues';
import jsan from 'jsan';
import seralizeImmutable from 'remotedev-serialize/immutable/serialize';

export default function importState(state, { deserializeState, deserializeAction, serialize }) {
  if (!state) return undefined;
  let parse = jsan.parse;
  if (serialize) {
    if (serialize.immutable) {
      parse = v => jsan.parse(v, seralizeImmutable(serialize.immutable, serialize.refs).reviver);
    } else if (serialize.reviver) {
      parse = v => jsan.parse(v, serialize.reviver);
    }
  }

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
    if (typeof preloadedState !== 'undefined') {
      preloadedState = deserializeState(preloadedState);
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
