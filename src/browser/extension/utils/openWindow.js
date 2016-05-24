export default function openWindow(position) {
  window.postMessage({
    source: 'redux-page',
    type: 'OPEN',
    position: position || 'right'
  }, '*');
}
