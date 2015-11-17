const getOptions = callback => {
  chrome.storage.sync.get({
    timeout: 1,
    serialize: true
  }, function(items) {
    callback(items)
  });
}

export default getOptions;
