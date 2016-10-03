"use strict";

exports.__esModule = true;
exports.composeWithDevTools = (
  process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    function() {
      function compose() {
        return require('redux').compose.apply(null, arguments);
      }
      if (arguments.length && typeof arguments[0] !== 'object') {
        return compose.apply(null, arguments);
      }
      return compose();
    }
);
