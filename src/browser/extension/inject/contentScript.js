import { ACTION, UPDATE } from '../../../app/constants/ActionTypes';
let payload;

let s = document.createElement('script');
s.src = chrome.extension.getURL('js/page.bundle.js');
s.onload = function() {
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

// Resend messages from the page to the background script
window.addEventListener('message', function(event) {
  if (!event || event.source !== window || typeof event.data !== 'string') return;
  const message = JSON.parse(event.data);
  if (message.source !== 'redux-page') return;
  payload = message.payload;
  chrome.runtime.sendMessage(message);
});

// Send actions to the page
window.dispatch = function(action) {
  window.postMessage({
    type: ACTION,
    payload: action,
    source: 'redux-cs'
  }, '*');
};

// Ask for updates from the page
window.update = function() {
  window.postMessage({
    type: UPDATE,
    source: 'redux-cs'
  }, '*');
};

// Request from the background script to send actions to the page
chrome.runtime.onMessage.addListener((message) => {
  if (message.action) window.dispatch(message.action);
});

window.addEventListener('beforeunload', function() {
  chrome.runtime.sendMessage({
    type: 'PAGE_UNLOADED'
  });
});

// Detect when the tab is reactivated
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible' && payload) {
    chrome.runtime.sendMessage({
      payload: payload,
      source: 'redux-page',
      init: true
    });
  }
});
