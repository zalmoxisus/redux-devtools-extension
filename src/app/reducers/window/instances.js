import { initialState, dispatchAction } from 'remotedev-app/lib/reducers/instances';
import { SELECT_INSTANCE, LIFTED_ACTION } from 'remotedev-app/lib/constants/actionTypes';
import { UPDATE_STATES } from '../../constants/actionTypes';

export default function instances(state = initialState, action) {
  switch (action.type) {
    case UPDATE_STATES:
      return { ...action.instances, selected: state.selected };
    case LIFTED_ACTION:
      if (action.message === 'DISPATCH') return dispatchAction(state, action);
      return state;
    case SELECT_INSTANCE:
      return { ...state, selected: action.selected };
    default:
      return state;
  }
}
