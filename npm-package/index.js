"use strict";

exports.__esModule = true;
exports.composeWithDevTools = (
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
  function() {
    var funcs = arguments;
    return function() {
      return require('redux').compose.apply(null, funcs);
    };
  }
);
