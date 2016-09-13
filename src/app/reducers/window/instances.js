import { SELECT_INSTANCE } from 'remotedev-app/lib/constants/actionTypes';
import { UPDATE_STATES } from '../../constants/actionTypes';

const initialState = {
  selected: null,
  current: 'default',
  sync: false,
  connections: {},
  options: { default: {} },
  states: {
    default: {
      actionsById: {},
      computedStates: [],
      currentStateIndex: -1,
      monitorState: {},
      nextActionId: 0,
      skippedActionIds: [],
      stagedActionIds: []
    }
  }
};

export default function instances(state = initialState, action) {
  switch (action.type) {
    case UPDATE_STATES:
      return { ...action.instances, selected: state.selected };
    case SELECT_INSTANCE:
      return { ...state, selected: action.selected };
    default:
      return state;
  }
}
