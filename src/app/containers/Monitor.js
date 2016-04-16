import { createElement } from 'react';
import LogMonitor from 'redux-devtools-log-monitor';
import ChartMonitor from 'redux-devtools-chart-monitor';
import SliderMonitor from 'redux-slider-monitor';
import DiffMonitor from './DiffMonitor';
import InspectorMonitor from 'redux-devtools-inspector';

const monitorTypes = location.hash ? location.hash.substr(1).split('/') : {};

export default (props) => {
  switch (monitorTypes[0]) {
    case 'SliderMonitor': return createElement(SliderMonitor, props);
    case 'ChartMonitor': return createElement(ChartMonitor, { ...props, defaultIsVisible: true });
    case 'DiffMonitor': return createElement(DiffMonitor, props);
    case 'InspectorMonitor': return createElement(InspectorMonitor, props);
    default: return createElement(LogMonitor, { ...props, preserveScrollTop: false });
  }
};
