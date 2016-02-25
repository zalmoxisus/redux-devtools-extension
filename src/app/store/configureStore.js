import { compose } from 'redux';
import { persistState, instrument } from 'redux-devtools';

export default function configureStore(next, subscriber = () => ({}), options = {}) {
  const { deserializeState, deserializeAction } = options;
  return compose(
    instrument(subscriber),
    persistState(
      getPersistSession(),
      deserializeState,
      deserializeAction
    )
  )(next);
}
function getPersistSession() {
  const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}
