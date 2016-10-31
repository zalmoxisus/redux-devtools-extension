import mapValues from 'lodash/mapValues';

export const FilterState = {
  DO_NOT_FILTER: 'DO_NOT_FILTER',
  BLACKLIST_SPECIFIC: 'BLACKLIST_SPECIFIC',
  WHITELIST_SPECIFIC: 'WHITELIST_SPECIFIC'
};

export function getLocalFilter(config) {
  if (config.actionsBlacklist || config.actionsWhitelist) {
    return {
      whitelist: config.actionsWhitelist && config.actionsWhitelist.join('|'),
      blacklist: config.actionsBlacklist && config.actionsBlacklist.join('|')
    };
  }
  return undefined;
}

export function isFiltered(action, localFilter) {
  if (!localFilter && window.devToolsOptions.filter === FilterState.DO_NOT_FILTER) return false;

  const { whitelist, blacklist } = localFilter || window.devToolsOptions;
  return (
    whitelist && !action.type.match(whitelist) ||
    blacklist && action.type.match(blacklist)
  );
}

function filterActions(actionsById, actionSanitizer) {
  if (!actionSanitizer) return actionsById;
  return mapValues(actionsById, (action, id) => (
    { ...action, action: actionSanitizer(action.action, id) }
  ));
}

function filterStates(computedStates, stateSanitizer) {
  if (!stateSanitizer) return computedStates;
  return computedStates.map((state, idx) => (
    { ...state, state: stateSanitizer(state.state, idx) }
  ));
}

export function filterState(state, type, localFilter, stateSanitizer, actionSanitizer, nextActionId, predicate) {
  if (type === 'ACTION') return !stateSanitizer ? state : stateSanitizer(state, nextActionId - 1);
  else if (type !== 'STATE') return state;

  if (predicate || localFilter || window.devToolsOptions.filter !== FilterState.DO_NOT_FILTER) {
    const filteredStagedActionIds = [];
    const filteredComputedStates = [];
    const sanitizedActionsById = actionSanitizer && {};
    const { actionsById } = state;
    const { computedStates } = state;

    state.stagedActionIds.forEach((id, idx) => {
      const liftedAction = actionsById[id];
      const currAction = liftedAction.action;
      const liftedState = computedStates[idx];
      const currState = liftedState.state;
      if (idx) {
        if (predicate && !predicate(currState, currAction)) return;
        if (isFiltered(currAction, localFilter)) return;
      }

      filteredStagedActionIds.push(id);
      filteredComputedStates.push(
        stateSanitizer ? { ...liftedState, state: stateSanitizer(currState, idx) } : liftedState
      );
      if (actionSanitizer) {
        sanitizedActionsById[id] = {
          ...liftedAction, action: actionSanitizer(currAction, id)
        };
      }
    });

    return {
      ...state,
      actionsById: sanitizedActionsById || actionsById,
      stagedActionIds: filteredStagedActionIds,
      computedStates: filteredComputedStates
    };
  }

  if (!stateSanitizer && !actionSanitizer) return state;
  return {
    ...state,
    actionsById: filterActions(state.actionsById, actionSanitizer),
    computedStates: filterStates(state.computedStates, stateSanitizer)
  };
}

export function startingFrom(
  sendingActionId, state, localFilter, stateSanitizer, actionSanitizer, predicate
) {
  const stagedActionIds = state.stagedActionIds;
  if (sendingActionId <= stagedActionIds[1]) return state;
  const index = stagedActionIds.indexOf(sendingActionId);
  if (index === -1) return state;

  const actionsById = state.actionsById;
  const computedStates = state.computedStates;
  const newActionsById = {};
  const newComputedStates = [];
  let key;
  let currAction;
  let currState;

  for (let i = index; i < stagedActionIds.length; i++) {
    key = stagedActionIds[i];
    currAction = actionsById[key];
    currState = computedStates[i];
    if (predicate && !predicate(currState, currAction) || isFiltered(currAction, localFilter)) {
      continue;
    }
    newActionsById[key] = !actionSanitizer ? currAction :
      { ...currAction, action: actionSanitizer(currAction, key) };
    newComputedStates.push(
      !stateSanitizer ? currState : { ...currState, state: stateSanitizer(currState, i) }
    );
  }

  if (newComputedStates.length === 0) return undefined;

  return {
    actionsById: newActionsById,
    computedStates: newComputedStates,
    stagedActionIds,
    currentStateIndex: state.currentStateIndex,
    nextActionId: state.nextActionId
  };
}
