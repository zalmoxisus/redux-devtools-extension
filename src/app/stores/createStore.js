import { createStore } from 'redux';

export default configureStore=(reducer, initialState, enhance)=> {
  return createStore(reducer, initialState, enhance());
}
