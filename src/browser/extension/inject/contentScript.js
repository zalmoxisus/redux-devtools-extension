let payload;

const sendMessage = (
  window.devToolsExtensionID ?
    function(message) {
      chrome.runtime.sendMessage(window.devToolsExtensionID, message);
    }
    : chrome.runtime.sendMessage
);

if (!window.devToolsExtensionID) {
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

// Request from the background script to send actions to the page
if (chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action) {
      window.postMessage({
        type: 'ACTION',
        payload: message.action,
        source: 'redux-cs'
      }, '*');
    }
  });
}

window.addEventListener('beforeunload', function() {
  sendMessage({
    type: 'PAGE_UNLOADED'
  });
});

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
