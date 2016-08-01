# API Reference

`window.devToolsExtension` function can be used in 2 ways:
 1. [Apply as a Redux store enhancer](#windowdevtoolsextensionconfig)
 2. [Create Redux store right in the extension](#windowdevtoolsextensionreducer-preloadedstate-config).


### `window.devToolsExtension([config])`
- [`config`] *(object)*: options
  - **name** (*string*) - the instance name to be showed on the monitor page. Default value is `document.title`.
  - **actionCreators** (*array* or *object*) - action creators to dispatch remotely. See [the example](https://github.com/zalmoxisus/redux-devtools-extension/commit/477e69d8649dfcdc9bf84dd45605dab7d9775c03).
  - **deserializeState(state): transformedState** (*function*) - optional transformation of state deserialized from debug session (useful if state is not plain object. Example: immutable-js state)
    - state, transformedState - Redux state objects.
      Example of usage:
      
      ```js
      const store = createStore(rootReducer, window.devToolsExtension && window.devToolsExtension({
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
  - **serializeState(key, value): transformedState** (*function*) - optional serialization function (useful if state is not plain object. Example: for mori data structures)
      Example of usage:
      
      ```js
      const store = Redux.createStore(reducer, window.devToolsExtension && window.devToolsExtension({
        serializeState: (key, value) => (
          value && mori.isMap(value) ? mori.toJs(value) : value
        )
      }));
      ```
  - **serializeAction(key, value): transformedAction** (*function*) - optional serialization function (useful if actions are not plain object. Example: for mori data structures in actions payload)
  - **actionsBlacklist** (*array*) - actions to be hidden in DevTools. Overwrites corresponding global setting in the options page.
  - **actionsWhitelist** (*array*) - all other actions will be hidden in DevTools. Overwrites corresponding global setting in the options page.
  - **actionsFilter** (*function*) - function which takes `action` object and id number as arguments, and should return `action` object back. See the example bellow.
  - **statesFilter** (*function*) - function which takes `state` object and index as arguments, and should return `state` object back.
      Example of usage:
      
      ```js
      const actionsFilter = (action) => (
        action.type === 'FILE_DOWNLOAD_SUCCESS' && action.data ?
        { ...action, data: '<<LONG_BLOB>>' } : action
      );
      const store = createStore(rootReducer, window.devToolsExtension && window.devToolsExtension({
        actionsFilter,
        statesFilter: (state) => state.data ? { ...state, data: '<<LONG_BLOB>>' } : state)
      }));
      ```
  - **getMonitor** (*function*) - return monitor object with the following properties:
    - **active** (*boolean*) - is `true` if the application is monitored (the monitor is open).
    - **start** (*function*) - starts monitoring (relaying logs to the monitor).
    - **stop** (*function*) - stop monitoring (the monitor will not get new changes till you `start` it again with the function above).
    - **update** (*function*) - update state history. Usually you want to use it when stopped monitoring (with the function above) and want to update the logs explicitly (useful for apps which dispatch actions too frequently).   
    - **isHotReloaded** (*function*) - return `true` if reducers just got hot reloaded (useful for dealing with side effects, which didn't get hot-reloaded).
    - **isMonitorAction** (*function*) - return `true` if the last action was dispatched by the monitor (was: 'TOGGLE_ACTION', 'SWEEP', 'SET_ACTIONS_ACTIVE', 'IMPORT_STATE').
    - **isTimeTraveling** (*function*) - return `true` if the state was set by moving back and forth (the last action was dispatched by the monitor was 'JUMP_TO_STATE'). Usually you want to use it to skip side effects. 
      
      Example of usage:
      
      ```js
      export let isMonitorAction;
      export default function configureStore(initialState) {
        return createStore(reducer, initialState, 
          window.devToolsExtension && window.devToolsExtension({
            getMonitor: (monitor) => { isMonitorAction = monitor.isMonitorAction; }
          }) : f => f
        );
      }  
      ```
      Then import it, for example, like [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/examples/counter/components/Counter.js).

### `window.devToolsExtension(reducer, [preloadedState, config])`
> Note: This is not intended to replace Redux' `createStore`. Use this approach only when you want to inspect changes outside of Redux or when not using Redux inside your application.

1. `reducer` *(Function)*: A [reducing function](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#reducer) that returns the next [state tree](../Glossary.md#state), given the current state tree and an [action](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#action) to handle.

2. [`preloadedState`] *(any)*: The initial state. You may optionally specify it to hydrate the state from the server in universal apps, or to restore a previously serialized user session. If you produced `reducer` with [`combineReducers`](combineReducers.md), this must be a plain object with the same shape as the keys passed to it. Otherwise, you are free to pass anything that your `reducer` can understand.

3. [`config`] *(Object)*: options. See [above](#windowdevtoolsextensionconfig) for details.

[Example of usage](https://github.com/zalmoxisus/redux-devtools-extension/commit/1810d2c1f0e8be1daf8f2d8f7bbeb4f8c528d90b).
