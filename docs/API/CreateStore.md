### `window.__REDUX_DEVTOOLS_EXTENSION__(reducer, [preloadedState, config])`
> Note: This is not intended to replace Redux' `createStore`. Use this approach only when you want to inspect changes outside of Redux or when not using Redux inside your application.

1. `reducer` *(Function)*: A [reducing function](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#reducer) that returns the next [state tree](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#state), given the current state tree and an [action](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#action) to handle.

2. [`preloadedState`] *(any)*: The initial state. You may optionally specify it to hydrate the state from the server in universal apps, or to restore a previously serialized user session. If you produced `reducer` with [`combineReducers`](https://github.com/reactjs/redux/tree/master/docs/api/combineReducers.md), this must be a plain object with the same shape as the keys passed to it. Otherwise, you are free to pass anything that your `reducer` can understand.

3. [`config`] *(Object)*: options. See [parameters](Arguments.md) for details.

[Example of usage](https://github.com/zalmoxisus/redux-devtools-extension/commit/1810d2c1f0e8be1daf8f2d8f7bbeb4f8c528d90b).

[See the post for more details](https://medium.com/@zalmoxis/redux-devtools-without-redux-or-how-to-have-a-predictable-state-with-any-architecture-61c5f5a7716f).
