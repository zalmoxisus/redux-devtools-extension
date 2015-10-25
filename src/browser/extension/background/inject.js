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

    chrome.tabs.executeScript(tabId, { file: 'js/content.bundle.js',
      runAt: 'document_start' });
  });
});
