// const arrowURLs = [];

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status !== 'loading') return;
  // const matched = arrowURLs.every(url => !!tab.url.match(url));
  // if (!matched) return;

  chrome.tabs.executeScript(tabId, {
    code: 'var injected = window.ReduxDevToolsInjected; window.ReduxDevToolsInjected = true; injected;',
    runAt: 'document_start'
  }, (result) => {
    if (chrome.runtime.lastError || result[0]) return;

    chrome.tabs.executeScript(tabId, { code: 
        'var s = document.createElement(\'script\');' +
        's.src = chrome.extension.getURL(\'inject.js\');' +
        's.onload = function() {' +
        'this.parentNode.removeChild(this);' +
        '};' + 
        '(document.head || document.documentElement).appendChild(s);',
      runAt: 'document_end' });

  });
});
