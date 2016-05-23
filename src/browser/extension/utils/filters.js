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

export function filterState(state, type, localFilter) {
  if (type !== 'STATE' || !localFilter && !window.devToolsOptions.filter) return state;

  const filteredStagedActionIds = [];
  const filteredComputedStates = [];
  state.stagedActionIds.forEach((id, idx) => {
    if (!isFiltered(state.actionsById[id].action)) {
      filteredStagedActionIds.push(id);
      filteredComputedStates.push(state.computedStates[idx]);
    }
  });

  return { ...state,
    stagedActionIds: filteredStagedActionIds,
    computedStates: filteredComputedStates
  };
}
