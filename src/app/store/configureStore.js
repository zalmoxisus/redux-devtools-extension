import { compose } from 'redux';
import { persistState, instrument } from 'redux-devtools';

export default function configureStore(next, subscriber = () => ({})) {
  return compose(
    instrument(subscriber),
    persistState(
      getPersistSession()
    )
  )(next);
}
function getPersistSession() {
  const pageHref = window.location.href.substr(0, window.location.href.indexOf('#'))
  const matches = pageHref.match(/[?&]debug_session=([^&]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}
