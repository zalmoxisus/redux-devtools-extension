import { onMessage, sendToBg } from 'crossmessaging';
import { getOptionsFromBg, isAllowed } from '../options/syncOptions';
let payload;
let sendMessage;

if (!window.devToolsOptions) getOptionsFromBg();

// Relay background script massages to the page script
onMessage((message) => {
  if (message.action) {
    window.postMessage({
      type: 'DISPATCH',
      payload: message.action,
      source: 'redux-cs'
    }, '*');
  } else {
    message.source = 'redux-cs';
    window.postMessage(message, '*');
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
  try {
    sendMessage(message);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Failed to send message', err);
  }
}, false);

if (typeof window.onbeforeunload !== 'undefined') {
  // Prevent adding beforeunload listener for Chrome apps
  window.onbeforeunload = function() {
    if (!isAllowed()) return;
    sendMessage({ type: 'PAGE_UNLOADED' });
  };
}
