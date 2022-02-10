"use strict";

import { compose } from 'redux';

const composeWithDevTools = (
  process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    function() {
      if (arguments.length === 0) return undefined;
      if (typeof arguments[0] === 'object') return compose;
      return compose.apply(null, arguments);
    }
);

export composeWithDevTools;

const devToolsEnhancer = (
  process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' &&
  window.__REDUX_DEVTOOLS_EXTENSION__ ?
    window.__REDUX_DEVTOOLS_EXTENSION__ :
    function() { return function(noop) { return noop; } }
);

export devToolsEnhancer;
