// Include this script in Chrome apps and extensions for remote debugging
// <script src="chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/inject.bundle.js"></script>

window.devToolsExtensionID = 'lmhkpmbekcpmknklioeibfkpmmfibljd';

chrome.runtime.sendMessage(window.devToolsExtensionID, { type: 'GET_OPTIONS' }, function(response) {
  if (!response.options.inject) {
    const urls = response.options.urls.split('\n').filter(Boolean).join('|');
    if (!location.href.match(new RegExp(urls))) return;
  }

  window.devToolsOptions = response.options;
  require('./contentScript');
  require('./pageScript');
  window.devToolsExtension.notifyErrors();
});
