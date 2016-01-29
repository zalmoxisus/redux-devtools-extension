import React from 'react';
import DiffMonitor from 'redux-devtools-diff-monitor';

export default (props) => (
  <div style={{ height: '100%', overflow: 'auto' }}>
    <DiffMonitor {...props} />
  </div>
);
