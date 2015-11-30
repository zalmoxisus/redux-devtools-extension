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

const injectOptions = () => {
  let s = document.createElement('script');
  s.type = 'text/javascript';
  s.appendChild(document.createTextNode('window.devToolsOptions=' + JSON.stringify(options)));
  s.onload = function() {
    this.parentNode.removeChild(this);
  };
  (document.head || document.documentElement).appendChild(s);
};

export const getOptionsFromBg = callback => {
  chrome.runtime.sendMessage({ type: 'GET_OPTIONS' }, response => {
    options = response.options;
    if (callback) callback(response.options);
    else injectOptions();
  });
};

export const isAllowed = (localOptions = options) => (
  !localOptions || localOptions.inject || location.href.match(localOptions.urls.split('\n').join('|'))
);

export default {
  save: save,
  get: get
};
