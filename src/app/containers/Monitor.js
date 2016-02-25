import React, { createElement } from 'react';
import FilterMonitor from 'redux-devtools-filter-actions';
import LogMonitor from 'redux-devtools-log-monitor';
import ChartMonitor from 'redux-devtools-chart-monitor';
import SliderMonitor from 'redux-slider-monitor';
import DiffMonitor from './DiffMonitor';
import InspectorMonitor from 'redux-devtools-inspector';

const monitorTypes = location.hash ? location.hash.substr(1).split('/') : {};

function getMonitor() {
  switch (monitorTypes[0]) {
    case 'SliderMonitor': return createElement(SliderMonitor);
    case 'ChartMonitor': return createElement(ChartMonitor);
    case 'DiffMonitor': return createElement(DiffMonitor);
    case 'InspectorMonitor': return createElement(InspectorMonitor);
    default: return createElement(LogMonitor, { preserveScrollTop: false });
  }
}

export default (props) => (
  <FilterMonitor {...props}>{getMonitor()}</FilterMonitor>
);
