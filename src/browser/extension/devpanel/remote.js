chrome.devtools.inspectedWindow.reload({
  injectedScript: 'setTimeout( function () {' +
  'var s = document.createElement(\'script\');' +
  's.src = \'' + chrome.extension.getURL('js/content.bundle.js') + '\';' +
  's.onload = function() { this.parentNode.removeChild(this); };' +
  'document.documentElement.appendChild(s);' +
  '}, 0);'
});
