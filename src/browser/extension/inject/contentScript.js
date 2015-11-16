import { onMessage, sendToBg } from 'crossmessaging';
let payload;
let sendMessage;

// Relay background script massages to the page script
onMessage((message) => {
  if (message.action) {
    window.postMessage({
      type: 'ACTION',
      payload: message.action,
      source: 'redux-cs'
    }, '*');
  }
});

if (window.devToolsExtensionID) { // Send external messages
  sendMessage = function(message) {
    chrome.runtime.sendMessage(window.devToolsExtensionID, message);
  };
} else {
  sendMessage = sendToBg;

  let s = document.createElement('script');
  s.src = chrome.extension.getURL('js/page.bundle.js');
  s.onload = function() {
    this.parentNode.removeChild(this);
  };
  (document.head || document.documentElement).appendChild(s);
}

function parseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    // console.error(data + 'is not a valid JSON', e);
    return {};
  }
}

// Resend messages from the page to the background script
window.addEventListener('message', function(event) {
  if (!event || event.source !== window || typeof event.data !== 'string') return;
  const message = parseJSON(event.data);
  if (message.source !== 'redux-page') return;
  payload = message.payload;
  sendMessage(message);
});

if (typeof window.onbeforeunload !== 'undefined') {
  // Prevent adding beforeunload listener for Chrome apps
  window.onbeforeunload = function() {
    sendMessage({ type: 'PAGE_UNLOADED' });
  };
}

// Detect when the tab is reactivated
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible' && payload) {
    sendMessage({
      payload: payload,
      source: 'redux-page',
      init: true
    });
  }
});
