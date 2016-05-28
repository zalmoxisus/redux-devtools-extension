import { getOptionsFromBg, injectOptions, isAllowed } from '../options/syncOptions';
let bg;

if (!window.devToolsOptions) getOptionsFromBg();

function connect() {
  // Connect to the background script
  const name = 'tab';
  if (window.devToolsExtensionID) {
    bg = chrome.runtime.connect(window.devToolsExtensionID, { name });
  } else {
    bg = chrome.runtime.connect({ name });
  }

  // Relay background script messages to the page script
  bg.onMessage.addListener((message) => {
    if (message.action) {
      window.postMessage({
        type: message.type,
        payload: message.action,
        state: message.state,
        id: message.id,
        source: '@devtools-extension'
      }, '*');
    } else if (message.options) {
      injectOptions(message.options);
    } else {
      window.postMessage({
        type: message.type,
        state: message.state,
        id: message.id,
        source: '@devtools-extension'
      }, '*');
    }
  });
}

// Resend messages from the page to the background script
window.addEventListener('message', function(event) {
  if (!isAllowed()) return;
  if (!event || event.source !== window || typeof event.data !== 'object') return;
  const message = event.data;
  if (message.source !== '@devtools-page') return;
  if (message.type === 'DISCONNECT') {
    if (bg) { bg.disconnect(); bg = undefined; }
    return;
  }

  try {
    if (!bg) connect();
    if (message.type === 'INIT_INSTANCE') bg.postMessage({ name: 'INIT_INSTANCE' });
    else bg.postMessage({ name: 'RELAY', message });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Failed to send message', err);
  }
}, false);
