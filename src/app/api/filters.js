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

export function filterState(state, type, localFilter, stateSanitizer, actionSanitizer, nextActionId) {
  if (type === 'ACTION') return !stateSanitizer ? state : stateSanitizer(state, nextActionId - 1);
  else if (type !== 'STATE') return state;

  if (localFilter || window.devToolsOptions.filter !== FilterState.DO_NOT_FILTER) {
    const filteredStagedActionIds = [];
    const filteredComputedStates = [];
    const filteredActionsById = actionSanitizer && {};
    const { actionsById } = state;
    const { computedStates } = state;

    state.stagedActionIds.forEach((id, idx) => {
      if (!isFiltered(actionsById[id].action, localFilter)) {
        filteredStagedActionIds.push(id);
        filteredComputedStates.push(
          stateSanitizer ?
          { ...computedStates[idx], state: stateSanitizer(computedStates[idx].state, idx) } :
          computedStates[idx]
        );
        if (actionSanitizer) {
          filteredActionsById[id] = {
            ...actionsById[id], action: actionSanitizer(actionsById[id].action, id)
          };
        }
      }
    });

    return {
      ...state,
      actionsById: filteredActionsById || actionsById,
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
