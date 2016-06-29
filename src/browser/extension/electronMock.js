// Electron: Not supported some chrome.* API

window.isElectron = window.navigator &&
  window.navigator.userAgent.indexOf('Electron') !== -1;

// Background page only
if (
  window.isElectron &&
  location.pathname === '/_generated_background_page.html'
) {
  chrome.runtime.onConnectExternal = {
    addListener() {}
  };
  chrome.runtime.onMessageExternal = {
    addListener() {}
  };
  chrome.notifications = {
    onClicked: {
      addListener() {}
    },
    create() {},
    clear() {}
  };
}

if (window.isElectron) {
  chrome.storage.local = {
    set(obj, callback) {
      Object.keys(obj).forEach(key => {
        localStorage.setItem(key, obj[key]);
      });
      if (callback) {
        callback();
      }
    },
    get(obj, callback) {
      const result = {};
      Object.keys(obj).forEach(key => {
        result[key] = localStorage.getItem(key) || obj[key];
      });
      if (callback) {
        callback(result);
      }
    }
  };
}
