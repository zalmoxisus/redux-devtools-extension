let handleError;
let lastTime = 0;

function createExpBackoffTimer(step) {
  let count = 1;
  return function(reset) {
    // Reset call
    if (reset) {
      count = 1;
      return 0;
    }
    // Calculate next timeout
    let timeout = Math.pow(2, count - 1);
    count += 1;
    return timeout * step;
  };
}

const nextErrorTimeout = createExpBackoffTimer(1000);

function postError(message) {
  if (handleError && !handleError()) return;
  window.postMessage({
    source: 'redux-page',
    type: 'ERROR',
    message: message
  }, '*');
}

function catchErrors(e) {
  if (
    window.devToolsOptions && !window.devToolsOptions.notifyErrors
    || e.timeStamp - lastTime < nextErrorTimeout()
  ) return;
  lastTime = e.timeStamp; nextErrorTimeout(true);
  postError(e.message);
}

export default function notifyErrors(onError) {
  handleError = onError;
  window.addEventListener('error', catchErrors, false);
}
