import React, { createElement } from 'react';
import FilterMonitor from 'redux-devtools-filter-actions';
import LogMonitor from 'redux-devtools-log-monitor';
import ChartMonitor from 'redux-devtools-chart-monitor';
import SliderMonitor from 'redux-slider-monitor';

function getMonitor() {
  const monitorType = location.hash.substr(1);
  switch (monitorType) {
    case 'SliderMonitor': return SliderMonitor;
    case 'ChartMonitor': return ChartMonitor;
    default: return LogMonitor;
  }
}

export default (props) => (
  <FilterMonitor {...props}>{createElement(getMonitor())}</FilterMonitor>
);
