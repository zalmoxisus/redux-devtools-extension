import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor-filterable';

export default createDevTools(<LogMonitor />);
