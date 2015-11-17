const getOptions = callback => {
  chrome.storage.sync.get({
    timeout: 1,
    serialize: true,
    inject: true,
    urls: 'https?:\\/\\/localhost|0\\.0\\.0\\.0:\\d+\\/(.+)?\nhttps?:\\/\\/.+\\.github\\.io\\/(.+)?'
  }, function(items) {
    callback(items)
  });
}

export default getOptions;
