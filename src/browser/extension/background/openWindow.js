import getMonitorName from '../options/getMonitorName';
let windows = {};
let lastPosition = null;

export default function openDevToolsWindow(position) {
  function popWindow(action, url, customOptions) {
    function focusIfExist(callback) {
      if (!windows[position]) {
        callback();
        lastPosition = position;
      } else {
        let params = {focused: true};
        if (lastPosition !== position && position !== 'devtools-panel') params = {...params, ...customOptions};
        chrome.windows.update(windows[position], params, () => {
          lastPosition = null;
          if (chrome.runtime.lastError) callback();
        });
      }
    }

    focusIfExist(() => {
      let options = {
        type: 'popup',
        ...customOptions
      };
      if (action === 'open') {
        getMonitorName(position, monitorName => {
          options.url = chrome.extension.getURL(url + (monitorName ? '#' + monitorName + '/' + position : ''));
          chrome.windows.create(options, (win) => {
            windows[position] = win.id;
          });
        });
      }
    });
  }

  let params = { left: 0, top: 0, width: 350, height: window.screen.availHeight };
  let url = 'window.html';
  switch (position) {
    case 'devtools-right':
      params.left = window.screen.availWidth - params.width;
      break;
    case 'devtools-bottom':
      params.height = 200;
      params.top = window.screen.availHeight - params.height;
      params.width = window.screen.availWidth;
      break;
    case 'devtools-panel':
      params.type = 'panel';
      break;
    case 'devtools-remote':
      params = { width: 850, height: 600 };
      url = 'remote.html';
      break;
  }
  popWindow('open', url, params);
}
