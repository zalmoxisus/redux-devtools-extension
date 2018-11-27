chrome.devtools.panels.create(
  'Redux', 'img/logo/scalable.png', chrome.extension.getBackgroundPage ? 'window.html' : 'devpanel.html', function() {}
);
