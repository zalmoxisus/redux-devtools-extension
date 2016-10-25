// Deprecated warning for inject.bundle.js
const prefix = `chrome-extension://${window.devToolsExtensionID}/js/`;
console.warn(
  `Using '${prefix}inject.bundle.js' is deprecated. ` +
  `Please use '${prefix}redux-devtools-extension.js' instead.`
);
