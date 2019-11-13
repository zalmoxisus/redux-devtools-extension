import { createStore } from 'redux';

export default const configureStore=(reducer, initialState, enhance)=> {
  return createStore(reducer, initialState, enhance());
}
