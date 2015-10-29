import { compose } from 'redux';
import { persistState } from 'redux-devtools';
import DevTools from '../containers/DevTools';

export default function configureStore(next) {
  return compose(
    DevTools.instrument(),
    persistState(
      window.location.href.match(
        /[?&]debug_session=([^&]+)\b/
      )
    )
  )(next);
}
