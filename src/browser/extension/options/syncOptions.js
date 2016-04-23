import { onMessage, sendToBg, sendToTab } from 'crossmessaging';
let options;

const save = (toAllTabs) => (key, value) => {
  let obj = {};
  obj[key] = value;
  chrome.storage.sync.set(obj);
  options[key] = value;
  toAllTabs({ options: options });
};

const get = callback => {
  if (options) callback(options);
  else {
    chrome.storage.sync.get({
      leftMonitor: 'LogMonitor',
      rightMonitor: 'LogMonitor',
      bottomMonitor: 'SliderMonitor',
      maxAge: 50,
      filter: false,
      whitelist: '',
      blacklist: '',
      serialize: true,
      notifyErrors: true,
      inject: true,
      urls: '^https?://localhost|0\\.0\\.0\\.0:\\d+\n^https?://.+\\.github\\.io'
    }, function(items) {
      options = items;
      callback(items);
    });
  }
};

const toReg = str => (
  str !== '' ? str.split('\n').join('|') : null
);

export const injectOptions = newOptions => {
  if (!newOptions) return;
  if (newOptions.filter) {
    newOptions.whitelist = toReg(newOptions.whitelist);
    newOptions.blacklist = toReg(newOptions.blacklist);
  }

  options = newOptions;
  let s = document.createElement('script');
  s.type = 'text/javascript';
  s.appendChild(document.createTextNode(
    'window.devToolsOptions = Object.assign(window.devToolsOptions||{},' + JSON.stringify(options) + ');'
  ));
  (document.head || document.documentElement).appendChild(s);
  s.parentNode.removeChild(s);
};

export const getOptionsFromBg = () => {
  sendToBg({ type: 'GET_OPTIONS' }, response => {
    if (response && response.options) injectOptions(response.options);
  });
};

export const isAllowed = (localOptions = options) => (
  !localOptions || localOptions.inject || !localOptions.urls
    || location.href.match(toReg(localOptions.urls))
);

export default function syncOptions(toAllTabs) {
  return {
    save: save(toAllTabs),
    get: get
  };
}
