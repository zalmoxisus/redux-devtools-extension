let windows = {devtools: 0};
let lastPosition = null;

export default function openDevToolsWindow(position) {
  function popWindow(action, url, type, customOptions) {
    function focusIfExist(callback) {
      if (!windows[type]) {
        callback();
        lastPosition = position;
      } else {
        let params = {focused: true};
        if (lastPosition !== position && position !== 'devtools-panel') params = {...params, ...customOptions};
        chrome.windows.update(windows[type], params, () => {
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
        options.url = chrome.extension.getURL(url);
        chrome.windows.create(options, (win) => {
          windows[type] = win.id;
        });
      }
    });
  }

  let params = { left: 0, top: 0, width: 320, height: window.screen.availHeight };
  switch (position) {
    case 'devtools-right':
      params.left = window.screen.availWidth - params.width;
      break;
    case 'devtools-bottom':
      params.height = 320;
      params.top = window.screen.availHeight - 320;
      params.width = window.screen.availWidth;
      break;
    case 'devtools-panel':
      params.type = 'panel';
      break;
  }
  popWindow('open', 'window.html', 'devtools', params);
}
