// Include this script in Chrome apps and extensions for remote debugging
// <script src="chrome-extension://lmhkpmbekcpmknklioeibfkpmmfibljd/js/inject.bundle.js"></script>

const id = 'lmhkpmbekcpmknklioeibfkpmmfibljd';

chrome.runtime.sendMessage(id, { type: 'GET_OPTIONS' }, function(response) {
  if (!response.options.inject) {
    const urls = response.options.urls.split('\n').join('|');
    if (!location.href.match(new RegExp(urls))) return;
  }

  require('./pageScript');
  window.__REDUX_DEVTOOLS_EXTENSION__.id = id;
  window.__REDUX_DEVTOOLS_EXTENSION__.options = response.options;
  require('./contentScript');
  window.__REDUX_DEVTOOLS_EXTENSION__.notifyErrors();
});
