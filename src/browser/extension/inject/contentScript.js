import { onMessage, sendToBg } from 'crossmessaging';
import { getOptionsFromBg, isAllowed } from '../options/syncOptions';
let payload;
let sendMessage;

getOptionsFromBg();

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
}

// Resend messages from the page to the background script
window.addEventListener('message', function(event) {
  if (!isAllowed()) return;
  if (!event || event.source !== window || typeof event.data !== 'object') return;
  const message = event.data;
  if (message.source !== 'redux-page') return;
  if (message.payload) payload = message.payload;
  sendMessage(message);
}, false);

if (typeof window.onbeforeunload !== 'undefined') {
  // Prevent adding beforeunload listener for Chrome apps
  window.onbeforeunload = function() {
    if (!isAllowed()) return;
    sendMessage({ type: 'PAGE_UNLOADED' });
  };
}

// Detect when the tab is reactivated
document.addEventListener('visibilitychange', function() {
  if (!isAllowed()) return;
  if (document.visibilityState === 'visible' && payload) {
    sendMessage({
      payload: payload,
      source: 'redux-page',
      init: true
    });
  }
}, false);
