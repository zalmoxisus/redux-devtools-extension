import expect from 'expect';
import React from 'react';
import { mount } from 'enzyme';
import createDevStore from 'remotedev-app/lib/store/createDevStore';
import updateState from 'remotedev-app/lib/store/updateState';
import App from '../../../src/app/containers/App.js';

const store = createDevStore(() => {});
const component = mount(<App store={store} />);

describe('App container', () => {
  it('should render inspector monitor\'s component', () => {
    expect(component.find('div.inspector--jss-0-0').html()).toExist();
  });

  it('should contain an empty action list', () => {
    expect(
      component.find('div.actionListRows--jss-0-4').html()
    ).toBe('<div class=" actionListRows--jss-0-4"></div>');
  });

  it('should show actions', () => {
    updateState(store, {
      type: 'STATE',
      payload: '{"monitorState": {}, "actionsById": {"0": {"type": "PERFORM_ACTION", "action": {"type": "@@INIT"}, "timestamp": 1467195556442}}, "nextActionId": 1, "stagedActionIds": [0], "skippedActionIds": [], "currentStateIndex": 0, "computedStates": [{"state": {"counter": 0}}]}',
      id: 'c14sgmpumswv6gdl4eypynwmi'
    });
    expect(component.find('div.actionListRows--jss-0-4').text()).toMatch(/^@@INIT/);

    updateState(store, {
      type: 'ACTION',
      payload: '{"counter": 1}', 'source': '@devtools-page', 'id': 'c14sgmpumswv6gdl4eypynwmi', 'action': '{"type": "PERFORM_ACTION", "action": {"type": "INCREMENT_COUNTER"}, "timestamp": 1467195566616, "duration": 0.04500000000007276}',
      nextActionId: 2
    });
    expect(component.find('div.actionListRows--jss-0-4').text()).toMatch(/INCREMENT_COUNTER/);
  });

  it('should show Diff', () => {
    expect(component.find('.actionPreview--jss-0-20 ul').first().text()).toMatch(/0 => 1/);
  });

  it('should show State', () => {
    component.find('.actionPreview--jss-0-20 .selectorButton--jss-0-35').at(2).simulate('click');
    expect(component.find('.actionPreview--jss-0-20 ul').first().text()).toMatch(/counter.+:1/);
  });

  it('should show Test', () => {
    component.find('.actionPreview--jss-0-20 .selectorButton--jss-0-35').at(3).simulate('click');
    expect(component.find('.ReactCodeMirror textarea').text())
      .toInclude('expect(reducers({"counter":0}, {"type":"INCREMENT_COUNTER"}).toEqual({"counter":1}));');
  });
});
