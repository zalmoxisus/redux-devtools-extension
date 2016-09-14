import { compose } from 'redux';
import instrument from 'redux-devtools-instrument';
import persistState from 'redux-devtools/lib/persistState';

export function getUrlParam(key) {
  const matches = window.location.href.match(new RegExp(`[?&]${key}=([^&#]+)\\b`));
  return (matches && matches.length > 0) ? matches[1] : null;
}

export default function configureStore(
  next, monitorReducer, { deserializeState, deserializeAction }
) {
  return compose(
    instrument(monitorReducer, window.devToolsOptions),
    persistState(
      getUrlParam('debug_session'),
      deserializeState,
      deserializeAction
    )
  )(next);
}
