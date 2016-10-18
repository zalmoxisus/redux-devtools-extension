export default function openWindow(position) {
  /* eslint-disable no-console */
  console.warn('Redux DevTools Extension\'s window was opened as ' +
    '`window.devToolsExtension.open()` was called from the app. ' +
    'Remove this command for better experience.');
  /* eslint-enable no-console */
  window.postMessage({
    source: '@devtools-page',
    type: 'OPEN',
    position: position || 'right'
  }, '*');
}
