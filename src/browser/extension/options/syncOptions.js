let options;

const save = (key, value) => {
  let obj = {};
  obj[key] = value;
  chrome.storage.sync.set(obj);
  options[key] = value;
};

const get = callback => {
  if (window.devToolsExtensionID && chrome.runtime.id !== window.devToolsExtensionID) {
    callback(window.devToolsOptions);
    return;
  }

  if (options) callback(options);
  else {
    chrome.storage.sync.get({
      limit: 50,
      timeout: 1,
      serialize: true,
      inject: true,
      urls: '^https?://localhost|0\\.0\\.0\\.0:\\d+\n^https?://.+\\.github\\.io'
    }, function(items) {
      options = items;
      callback(items);
    });
  }
};

export const getOptionsFromBg = callback => {
  chrome.runtime.sendMessage({ type: 'GET_OPTIONS' }, response => {
    options = response.options;
    callback(response.options);
  });
};

export const isAllowed = () => (
  !options || !options.inject && location.href.match(options.urls.split('\n').join('|'))
);

export default {
  save: save,
  get: get
};
