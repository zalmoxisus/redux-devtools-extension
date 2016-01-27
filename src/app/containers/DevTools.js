import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import FilterMonitor from 'redux-devtools-filter-actions';
import App from './App';

export default createDevTools(<App><FilterMonitor><LogMonitor /></FilterMonitor></App>);
