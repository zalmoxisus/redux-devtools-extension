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
    case 'ChartMonitor': return createElement(ChartMonitor, {
      ...props, defaultIsVisible: true, invertTheme: true,
      tooltipOptions: {
        style: {
          'background-color': '#ffffff',
          'opacity': '0.9',
          'border-radius': '5px',
          'padding': '5px'
        }
      }
    });
    case 'DiffMonitor': return createElement(DiffMonitor, props);
    case 'InspectorMonitor': return createElement(InspectorMonitor, props);
    default: return createElement(LogMonitor, { ...props, preserveScrollTop: false });
  }
};
