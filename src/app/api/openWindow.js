export default function openWindow(position) {
  /* eslint-disable no-console */
  console.warn('Redux DevTools Extension\'s window was opened as ' +
    '`window.devToolsExtension.open()` was called. ' +
    'Remove this command from your code for better experience.');
  /* eslint-enable no-console */
  window.postMessage({
    source: '@devtools-page',
    type: 'OPEN',
    position: position || 'right'
  }, '*');
}
