import React from 'react';
import { render } from 'react-dom';
import * as themes from 'redux-devtools-themes';
import LogMonitorButton from 'redux-devtools-log-monitor/lib/LogMonitorButton';
import GoSync from 'react-icons/lib/go/sync';
import DevTools from '../../../app/containers/DevTools';

chrome.runtime.getBackgroundPage(background => {
  render(
    <div className="flexbox">
      <DevTools store={background.store} />
      <div className="devmenu">
        <LogMonitorButton
          theme={themes.nicinabox}
          onClick={() => { background.sendMessage({ type: 'UPDATE' }); }}
          enabled>
          <GoSync /> Sync
        </LogMonitorButton>
      </div>
    </div>,
    document.getElementById('root')
  );
});
