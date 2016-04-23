import { getOptionsFromBg, injectOptions, isAllowed } from '../options/syncOptions';
let bg;
let payload;

if (!window.devToolsOptions) getOptionsFromBg();

function connect(instance) {
  // Connect to the background script
  if (window.devToolsExtensionID) {
    bg = chrome.runtime.connect(window.devToolsExtensionID);
  } else {
    bg = chrome.runtime.connect();
  }
  bg.postMessage({name: 'INIT_INSTANCE', instance});

  // Relay background script massages to the page script
  bg.onMessage.addListener((message) => {
    if (message.action) {
      window.postMessage({
        type: 'DISPATCH',
        payload: message.action,
        source: 'redux-cs'
      }, '*');
    } else if (message.options) {
      injectOptions(message.options);
    } else {
      window.postMessage({
        type: message.type,
        state: message.state,
        source: 'redux-cs'
      }, '*');
    }
  });
}

// Resend messages from the page to the background script
window.addEventListener('message', function(event) {
  if (!isAllowed()) return;
  if (!event || event.source !== window || typeof event.data !== 'object') return;
  const message = event.data;
  if (message.source !== 'redux-page') return;
  if (message.payload) payload = message.payload;
  try {
    if (message.type === 'INIT_INSTANCE') {
      connect(message.name);
    } else bg.postMessage({ name: 'RELAY', message });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Failed to send message', err);
  }
}, false);
