"use strict";

exports.__esModule = true;
exports.composeWithDevTools = (
  typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    function() {
      if (arguments.length === 0) return undefined;
      var compose = require('redux').compose;
      if (typeof arguments[0] === 'object') return compose;
      return compose.apply(null, arguments);
    }
);
