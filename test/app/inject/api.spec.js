import 'babel-polyfill';
import expect from 'expect';
import { insertScript, listenMessage } from '../../utils/inject';
import '../../../src/browser/extension/inject/pageScript';

describe('API', () => {
  it('should get window.devToolsExtension function', () => {
    expect(window.devToolsExtension).toBeA('function');
  });

  it('should notify error', () => {
    const spy = expect.createSpy(() => {});
    window.devToolsExtension.notifyErrors(spy);
    insertScript('hi()');
    expect(spy).toHaveBeenCalled();
  });

  it('should open monitor', async () => {
    let message = await listenMessage(() => {
      window.devToolsExtension.open();
    });
    expect(message).toEqual({ source: '@devtools-page', type: 'OPEN', position: 'right' });

    message = await listenMessage(() => {
      window.devToolsExtension.open('left');
    });
    expect(message).toEqual({ source: '@devtools-page', type: 'OPEN', position: 'left' });
  });

  it('should send message', async () => {
    let message = await listenMessage(() => {
      window.devToolsExtension.send('hi');
    });
    expect(message).toInclude({
      type: 'ACTION',
      action: '{"action":{"type":"hi"}}',
      payload: undefined,
      id: undefined,
      name: '',
      source: '@devtools-page'
    });

    message = await listenMessage(() => {
      window.devToolsExtension.send({ type: 'hi' }, { counter: 1 }, 1);
    });
    expect(message).toInclude({
      type: 'ACTION',
      action: '{"action":{"type":"hi"}}',
      payload: '{"counter":1}',
      instanceId: undefined,
      name: '',
      source: '@devtools-page'
    });

    message = await listenMessage(() => {
      window.devToolsExtension.send({ type: 'hi' }, { counter: 1 }, 1);
    });
    expect(message).toInclude({
      type: 'ACTION',
      payload: '{"counter":1}',
      instanceId: undefined,
      name: '',
      source: '@devtools-page'
    });
    expect(message.action).toBe('{"action":{"type":"hi"}}');

    message = await listenMessage(() => {
      window.devToolsExtension.send(undefined, { counter: 1 }, 1);
    });
    expect(message).toEqual({
      type: 'STATE',
      payload: { counter: 1 },
      serialize: undefined,
      actionsById: undefined,
      computedStates: undefined,
      committedState: undefined,
      instanceId: undefined,
      name: '',
      source: '@devtools-page'
    });
  });
});
