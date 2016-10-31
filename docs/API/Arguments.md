# Parameters

Use `window.__REDUX_DEVTOOLS_EXTENSION__([config])` or `window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__([config])()`
- [`config`] *(object)*: options
  - **name** (*string*) - the instance name to be showed on the monitor page. Default value is `document.title`.
  - **actionCreators** (*array* or *object*) - action creators to dispatch remotely. See [the example](https://github.com/zalmoxisus/redux-devtools-extension/commit/477e69d8649dfcdc9bf84dd45605dab7d9775c03).
  - **latency** (*number (in ms)*) - if more than one action is dispatched in the indicated interval, all new actions will be collected and sent at once. It determines the performance vs speed. When setting it to `0`, all actions will be sent instantly. Default is `500 ms`.
  - **maxAge** (*number*) - maximum allowed actions to be stored on the history tree, the oldest actions are removed once maxAge is reached. Default is `50`.
  - **shouldCatchErrors** (*boolean*) - if specified as `true`, whenever there's an exception in reducers, the monitors will show the error message, and next actions will not be dispatched.
  - **shouldRecordChanges** (*boolean*) - if specified as `false`, it will not record the changes till clicking on `Start recording` button. Default is `true`.
  - **pauseActionType** (*string*) - if specified, whenever clicking on `Pause recording` button and there are actions in the history log, will add this action type. If not specified, will commit when paused. Default is `@@PAUSED`.
  - **shouldStartLocked** (*boolean*) - if specified as `true`, it will not allow any non-monitor actions to be dispatched till clicking on `Unlock changes` button. Default is `false`.
  - **shouldHotReload** *boolean* - if set to `false`, will not recompute the states on hot reloading (or on replacing the reducers). Default to `true`.
  - **deserializeState(state): transformedState** (*function*) - optional transformation of state deserialized from debug session (useful if state is not plain object. Example: immutable-js state)
    - state, transformedState - Redux state objects.
      Example of usage:
      
      ```js
      const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
        deserializeState: (state) => ({
          todos: {
            ...state.todos,
            todoList: Immutable.fromJS(state.todos.todoList)
          }
        })
      }));
      ```
  - **deserializeAction(action): transformedAction** (*function*) - optional transformation of actions deserialized from debug session (useful if actions are not plain object. Example: immutable-js action payload)
    - action, transformedAction - Redux action objects
  - **serializeState** (*boolean or function or object*) - specify how and what should be handled during serialization (useful if state is not plain object). It will affect the extension's performance significantly!
  Could be:
    - `undefined` - use regular `JSON.stringify` to send data - the fast mode.
    - `false` - handle only circular references.
    - `true` - handle also dates, regexes, undefined, error objects, symbols, and functions.
    - `function(key, value)` - JSON replacer. Example of usage with mori data structures:
      
      ```js
      const store = Redux.createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
        serializeState: (key, value) => (
          value && mori.isMap(value) ? mori.toJs(value) : value
        )
      }));
      ```

    - object (`{ replacer: function, options: object } `) - in addition to the replacer function, specify an options object, which contains `date`, `regexe`, `undefined`, `error`, and `function` keys. Fo each of them you can indicate whether to include (if set as `true`). For `function` key you can also specify a custom function which handles serialization. See [`jsan`](https://github.com/kolodny/jsan) for more details. Example:
      ```js
      const store = Redux.createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
        serializeState: { 
          options: {
           undefined: true,
           function: function(fn) { return fn.toString() }
          }
        }
      }));
      ```       

  - **serializeAction** (*boolean or function or object*) - same as `serializeState` but used for actions payloads.
  - **actionsBlacklist** (*array*) - actions to be hidden in DevTools. Overwrites corresponding global setting in the options page.
  - **actionsWhitelist** (*array*) - all other actions will be hidden in DevTools. Overwrites corresponding global setting in the options page.
  - **actionSanitizer** (*function*) - function which takes `action` object and id number as arguments, and should return `action` object back. See the example bellow.
  - **stateSanitizer** (*function*) - function which takes `state` object and index as arguments, and should return `state` object back.
      Example of usage:
      
      ```js
      const actionSanitizer = (action) => (
        action.type === 'FILE_DOWNLOAD_SUCCESS' && action.data ?
        { ...action, data: '<<LONG_BLOB>>' } : action
      );
      const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
        actionSanitizer,
        stateSanitizer: (state) => state.data ? { ...state, data: '<<LONG_BLOB>>' } : state
      }));
      ```
  - **predicate** (*function*) - called for every action before sending, takes `state` and `action` object, and returns `true` in case it allows sending the current data to the monitor. Use it as a more advanced version of `actionsBlacklist`/`actionsWhitelist` parameters.
      Example of usage:
      
      ```js
      const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
        predicate: (state, action) => state.dev.logLevel === VERBOSE && !action.forwarded
      }));
      ```
