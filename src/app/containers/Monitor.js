import React, { createElement } from 'react';
import FilterMonitor from 'redux-devtools-filter-actions';
import LogMonitor from 'redux-devtools-log-monitor';
import ChartMonitor from 'redux-devtools-chart-monitor';
import SliderMonitor from 'redux-slider-monitor';
import DiffMonitor from 'redux-devtools-diff-monitor';

function getMonitor() {
  if (!location.hash) return LogMonitor;
  const monitorTypes = location.hash.substr(1).split('/');
  switch (monitorTypes[0]) {
    case 'SliderMonitor': return SliderMonitor;
    case 'ChartMonitor': return ChartMonitor;
    case 'DiffMonitor': return DiffMonitor;
    default: return LogMonitor;
  }
}

export default (props) => (
  <FilterMonitor {...props}>{createElement(getMonitor())}</FilterMonitor>
);
