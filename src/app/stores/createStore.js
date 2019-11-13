import { createStore } from 'redux';

export default (reducer, initialState, enhance)=> {
  return createStore(reducer, initialState, enhance());
}
