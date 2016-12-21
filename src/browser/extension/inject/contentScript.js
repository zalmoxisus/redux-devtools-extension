import { getOptionsFromBg, injectOptions, isAllowed } from '../options/syncOptions';
const source = '@devtools-extension';
let connected = false;
let bg;

if (!window.devToolsOptions) getOptionsFromBg();

function connect() {
  // Connect to the background script
  connected = true;
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
        source
      }, '*');
    } else if (message.options) {
      injectOptions(message.options);
    } else {
      window.postMessage({
        type: message.type,
        state: message.state,
        id: message.id,
        source
      }, '*');
    }
  });

  bg.onDisconnect.addListener(handleDisconnect);
}

function handleDisconnect() {
  window.removeEventListener('message', handleMessages);
  window.postMessage({ type: 'STOP', failed: true, source }, '*');
  bg = undefined;
}

function tryCatch(fn, args) {
  try {
    return fn(args);
  } catch (err) {
    handleDisconnect();
    /* eslint-disable no-console */
    if (process.env.NODE_ENV !== 'production') console.error('Failed to send message', err);
    /* eslint-enable no-console */
  }
}

function send(message) {
  if (!connected) connect();
  if (message.type === 'INIT_INSTANCE') bg.postMessage({ name: 'INIT_INSTANCE' });
  else bg.postMessage({ name: 'RELAY', message });
}

// Resend messages from the page to the background script
function handleMessages(event) {
  if (!isAllowed()) return;
  if (!event || event.source !== window || typeof event.data !== 'object') return;
  const message = event.data;
  if (message.source !== '@devtools-page') return;
  if (message.type === 'DISCONNECT') {
    if (bg) {
      bg.disconnect();
      connected = false;
    }
    return;
  }

  tryCatch(send, message);
}

window.addEventListener('message', handleMessages, false);
