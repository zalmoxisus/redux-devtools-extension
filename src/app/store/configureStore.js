import { compose } from 'redux';
import { persistState } from 'redux-devtools';
import DevTools from '../containers/DevTools';

export default function configureStore(next) {
  return compose(
    DevTools.instrument(),
    persistState(
      getPersistSession()
    )
  )(next);
}
function getPersistSession() {
  const matches = window.location.href.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}
