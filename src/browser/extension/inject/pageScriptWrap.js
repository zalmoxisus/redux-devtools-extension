let s = document.createElement('script');

if (process.env.NODE_ENV === 'production') {
  const script = require('raw!tmp/page.bundle.js');
  s.appendChild(document.createTextNode(script));
} else {
  s.src = chrome.extension.getURL('js/page.bundle.js');
}

s.type = 'text/javascript';
s.onload = function() {
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);
