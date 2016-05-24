import { compose } from 'redux';
import instrument from 'redux-devtools-instrument';
import persistState from 'redux-devtools/lib/persistState';

function getPersistSession() {
  const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
  return (matches && matches.length > 0) ? matches[1] : null;
}

export default function configureStore(
  next, subscriber = () => ({}), { deserializeState, deserializeAction }
) {
  return compose(
    instrument(subscriber, window.devToolsOptions),
    persistState(
      getPersistSession(),
      deserializeState,
      deserializeAction
    )
  )(next);
}
