import mapValues from 'lodash/mapValues';

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
  if (!localFilter && !window.devToolsOptions.filter) return false;

  const { whitelist, blacklist } = localFilter || window.devToolsOptions;
  return (
    whitelist && !action.type.match(whitelist) ||
    blacklist && action.type.match(blacklist)
  );
}

function filterActions(actionsById, actionsFilter) {
  if (!actionsFilter) return actionsById;
  return mapValues(actionsById, (action, id) => (
    { ...action, action: actionsFilter(action.action, id) }
  ));
}

function filterStates(computedStates, statesFilter) {
  if (!statesFilter) return computedStates;
  return computedStates.map((state, idx) => (
    { ...state, state: statesFilter(state.state, idx) }
  ));
}

export function filterState(state, type, localFilter, statesFilter, actionsFilter, nextActionId) {
  if (type === 'ACTION') return !statesFilter ? state : statesFilter(state, nextActionId - 1);
  else if (type !== 'STATE') return state;

  if (localFilter || window.devToolsOptions.filter) {
    const filteredStagedActionIds = [];
    const filteredComputedStates = [];
    const filteredActionsById = actionsFilter && {};
    const { actionsById } = state;
    const { computedStates } = state;

    state.stagedActionIds.forEach((id, idx) => {
      if (!isFiltered(actionsById[id].action, localFilter)) {
        filteredStagedActionIds.push(id);
        filteredComputedStates.push(
          statesFilter ?
          { ...computedStates[idx], state: statesFilter(computedStates[idx].state, idx) } :
          computedStates[idx]
        );
        if (actionsFilter) {
          filteredActionsById[id] = {
            ...actionsById[id], action: actionsFilter(actionsById[id].action, id)
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

  if (!statesFilter && !actionsFilter) return state;
  return {
    ...state,
    actionsById: filterActions(state.actionsById, actionsFilter),
    computedStates: filterStates(state.computedStates, statesFilter)
  };
}
