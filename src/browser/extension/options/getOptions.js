const getOptions = callback => {
  if (window.devToolsExtensionID && chrome.runtime.id !== window.devToolsExtensionID) {
    callback(window.devToolsOptions);
    return;
  }

  chrome.storage.sync.get({
    limit: 50,
    timeout: 1,
    serialize: true,
    inject: true,
    urls: '^https?://localhost|0\\.0\\.0\\.0:\\d+\n^https?://.+\\.github\\.io'
  }, function(items) {
    callback(items);
  });
};

export default getOptions;
