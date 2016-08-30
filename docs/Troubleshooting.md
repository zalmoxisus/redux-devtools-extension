# Troubleshooting

### I just see empty log or "No store found"

Make sure you [applied the enhancer](https://github.com/zalmoxisus/redux-devtools-extension#2-use-with-redux). Note that passing enhancer as last argument requires redux@>=3.1.0. For older versions apply it like [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/todomvc/store/configureStore.js) or [here](https://github.com/zalmoxisus/redux-devtools-extension/blob/v0.4.2/examples/counter/store/configureStore.js#L7-L12).

If you develop on your local filesystem, make sure to allow Redux DevTools access to `file:///` URLs in the settings of this extension.

Don't mix the old Redux API with the new one. Pass enhancers and applyMiddleware as last createStore argument.

### It shows only the `@@INIT` action or moving back and forth doesn't update the state

Most likely you mutate the state. Check it by [adding `redux-immutable-state-invariant` middleware](https://github.com/zalmoxisus/redux-devtools-extension/blob/master/examples/counter/store/configureStore.js#L3).

### Extension ignores Redux Saga or other store enhancers which change the store object

Update the store after creating / changing:

```js
if (window.devToolsExtension) window.devToolsExtension.updateStore(store)
```

See [the example for Redux Saga](https://github.com/zalmoxisus/redux-devtools-extension/blob/0757dac4c2eb217d7bbb8be738d8bae32ec21d86/examples/saga-counter/src/main.js#L25).
