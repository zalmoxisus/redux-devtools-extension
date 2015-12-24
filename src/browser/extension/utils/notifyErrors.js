let handleError;

function postError(message) {
  if (handleError && !handleError()) return;
  window.postMessage({
    source: 'redux-page',
    type: 'ERROR',
    message: message
  }, '*');
}

function catchErrors(e) {
  if (window.devToolsOptions && !window.devToolsOptions.notifyErrors) return;
  postError(e.message);
}

export default function notifyErrors(onError) {
  handleError = onError;
  window.addEventListener('error', catchErrors, false);
}
