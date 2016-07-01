import 'babel-polyfill';
import expect from 'expect';
import { createStore, compose } from 'redux';
import { listenMessage } from '../../utils/inject';
import '../../../src/browser/extension/inject/pageScript';

function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    default: return state;
  }
}

describe('Redux enhancer', () => {
  it('should create the store', async () => {
    const message = await listenMessage(() => {
      window.store = createStore(counter, window.devToolsExtension());
      expect(window.store).toBeA('object');
    });
    expect(message.type).toBe('INIT_INSTANCE');
  });

  it('should perform actions', () => {
    expect(window.store.getState()).toBe(0);
    window.store.dispatch({ type: 'INCREMENT' });
    expect(window.store.getState()).toBe(1);
    window.store.dispatch({ type: 'INCREMENT' });
    expect(window.store.getState()).toBe(2);
  });

  it('should create the store with config parameters', async () => {
    const name = 'Some title';
    const message = await listenMessage(() => {
      window.store = createStore(counter, window.devToolsExtension({
        name,
        actionsBlacklist: ['SOME_ACTION'],
        statesFilter: state => state,
        serializeState: (key, value) => value
      }));
      expect(window.store).toBeA('object');
    });
    expect(message.type).toBe('INIT_INSTANCE');
    expect(message.name).toBe(name);
  });

  it('should create the store using old Redux api', async () => {
    const message = await listenMessage(() => {
      window.store = window.devToolsExtension()(createStore)(counter);
      expect(window.store).toBeA('object');
    });
    expect(message.type).toBe('INIT_INSTANCE');
  });

  it('should create the store with several enhancers', async () => {
    const testEnhancer = next =>
      (reducer, initialState, enhancer) => next(reducer, initialState, enhancer);
    const message = await listenMessage(() => {
      window.store = createStore(counter, compose(
        testEnhancer,
        window.devToolsExtension())
      );
      expect(window.store).toBeA('object');
    });
    expect(message.type).toBe('INIT_INSTANCE');
  });
});
