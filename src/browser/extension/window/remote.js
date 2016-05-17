import React from 'react';
import { render } from 'react-dom';
import DevTools from 'remotedev-app';

chrome.storage.local.get({
  'select-monitor': 'LogMonitor',
  's:hostname': null,
  's:port': null,
  's:secure': null
}, options => {
  render(
    <DevTools
      selectMonitor={options['select-monitor']}
      socketOptions={
        options['s:hostname'] && options['s:port'] ?
          {
            hostname: options['s:hostname'], port: options['s:port'], secure: options['s:secure']
          } : undefined
      }
    />,
    document.getElementById('root')
  );
});
